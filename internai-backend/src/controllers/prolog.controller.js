/**
 * prolog.controller.js
 * Bridges MongoDB data → Prolog engine → match results.
 */
const Candidate  = require("../models/Candidate");
const Internship = require("../models/Internship");
const Match      = require("../models/Match");
const { runPrologMatch } = require("../services/prologEngine");

// POST /api/prolog/match
// Body: { candidateId }  — runs matching for one candidate vs all open internships
const runMatchForCandidate = async (req, res) => {
  try {
    const { candidateId } = req.body;
    if (!candidateId) return res.status(400).json({ success: false, message: "candidateId is required" });

    // 1. Load candidate
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found" });

    // 2. Load internships — include approved + pending so Prolog matching works
    const internships = await Internship.find({
      status: "Open",
      approvalStatus: { $in: ["approved", "pending"] }
    }).populate("companyId", "name");

    if (!internships.length) return res.json({
      success: true, data: [],
      message: "No open internships found. Add internships first via the Internships section."
    });

    // 3. Run Prolog engine
    const prologResults = await runPrologMatch(
      String(candidate._id),
      candidate.skills || [],
      internships.map(i => ({ _id: i._id, title: i.title, skills: i.skills || [], companyId: i.companyId?._id }))
    );

    // 4. Filter results with score > 0 and sort by score desc
    const matched = prologResults
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score);

    // 5. Upsert into Match collection
    for (const r of matched) {
      const internship = internships.find(i => String(i._id) === r.internshipId);
      if (!internship) continue;
      await Match.findOneAndUpdate(
        { candidateId: candidate._id, companyId: internship.companyId?._id, role: internship.title },
        {
          candidateId:   candidate._id,
          companyId:     internship.companyId?._id,
          role:          internship.title,
          aiScore:       r.score,
          matchedSkills: r.matchedSkills,
          skillGap:      r.skillGap,
          status:        "In Review",
        },
        { upsert: true, new: true }
      );
    }

    res.json({
      success: true,
      candidate: { id: candidate._id, name: candidate.name, skills: candidate.skills },
      totalInternships: internships.length,
      matchCount: matched.length,
      data: matched,
    });
  } catch (err) {
    console.error("Prolog match error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/prolog/match-all
// Runs Prolog matching for ALL candidates (batch job)
const runMatchAll = async (req, res) => {
  try {
    const candidates  = await Candidate.find({ status: "Active" });
    const internships = await Internship.find({
      status: "Open",
      approvalStatus: { $in: ["approved", "pending"] }
    }).populate("companyId", "name");

    if (!internships.length) return res.json({ success: true, message: "No open internships", processed: 0 });

    let totalMatches = 0;
    const summary = [];

    for (const candidate of candidates) {
      const prologResults = await runPrologMatch(
        String(candidate._id),
        candidate.skills || [],
        internships.map(i => ({ _id: i._id, title: i.title, skills: i.skills || [], companyId: i.companyId?._id }))
      );

      const matched = prologResults.filter(r => r.score > 0).sort((a, b) => b.score - a.score);

      for (const r of matched) {
        const internship = internships.find(i => String(i._id) === r.internshipId);
        if (!internship) continue;
        await Match.findOneAndUpdate(
          { candidateId: candidate._id, companyId: internship.companyId?._id, role: internship.title },
          {
            candidateId:   candidate._id,
            companyId:     internship.companyId?._id,
            role:          internship.title,
            aiScore:       r.score,
            matchedSkills: r.matchedSkills,
            status:        "In Review",
          },
          { upsert: true, new: true }
        );
        totalMatches++;
      }

      summary.push({ candidateId: candidate._id, name: candidate.name, matchCount: matched.length });
    }

    res.json({ success: true, processed: candidates.length, totalMatches, summary });
  } catch (err) {
    console.error("Prolog match-all error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/prolog/preview/:candidateId
// Returns the generated Prolog program for debugging
const previewProlog = async (req, res) => {
  try {
    const { buildPrologProgram, toAtom } = require("../services/prologEngine");
    const candidate  = await Candidate.findById(req.params.candidateId);
    if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found" });
    const internships = await Internship.find({ status: "Open", approvalStatus: { $in: ["approved", "pending"] } });
    const program = buildPrologProgram(
      String(candidate._id),
      candidate.skills || [],
      internships.map(i => ({ _id: i._id, title: i.title, skills: i.skills || [] }))
    );
    res.json({ success: true, program });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/prolog/diagnose/:candidateId
// Returns a full diagnostic report — candidate skills, internship count, sample Prolog output
const diagnose = async (req, res) => {
  try {
    const { buildPrologProgram, toAtom, runPrologMatch } = require("../services/prologEngine");
    const candidate = await Candidate.findById(req.params.candidateId);
    if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found" });

    const allInternships   = await Internship.find({});
    const openInternships  = await Internship.find({ status: "Open" });
    const matchableInterns = await Internship.find({ status: "Open", approvalStatus: { $in: ["approved", "pending"] } });

    const program = buildPrologProgram(
      String(candidate._id),
      candidate.skills || [],
      matchableInterns.map(i => ({ _id: i._id, title: i.title, skills: i.skills || [] }))
    );

    let prologResults = [];
    try {
      prologResults = await runPrologMatch(
        String(candidate._id),
        candidate.skills || [],
        matchableInterns.map(i => ({ _id: i._id, title: i.title, skills: i.skills || [], companyId: i.companyId }))
      );
    } catch (e) {
      prologResults = [{ error: e.message }];
    }

    res.json({
      success: true,
      candidate: { id: candidate._id, name: candidate.name, skills: candidate.skills, skillCount: (candidate.skills || []).length },
      internshipCounts: {
        total: allInternships.length,
        open:  openInternships.length,
        matchable: matchableInterns.length,
        approvalStatuses: [...new Set(allInternships.map(i => i.approvalStatus))],
      },
      prologResults,
      program,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { runMatchForCandidate, runMatchAll, previewProlog, diagnose };
