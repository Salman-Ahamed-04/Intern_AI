/**
 * prolog.controller.js
 * Bridges MongoDB data → AI Service → match results.
 */
const Candidate  = require("../models/Candidate");
const Internship = require("../models/Internship");
const Match      = require("../models/Match");
const axios      = require("axios");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:3002";

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

    // 3. Call AI Service via HTTP
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/prolog/match`, {
      candidateId: String(candidate._id),
      candidateSkills: candidate.skills || [],
      internships: internships.map(i => ({ _id: i._id, title: i.title, skills: i.skills || [], companyId: i.companyId?._id }))
    });

    if (!aiResponse.data.success) {
      throw new Error(aiResponse.data.message || "AI Service error");
    }

    const prologResults = aiResponse.data.data;

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

    // Call AI Service via HTTP
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/prolog/match-all`, {
      candidates: candidates.map(c => ({ _id: c._id, name: c.name, skills: c.skills || [] })),
      internships: internships.map(i => ({ _id: i._id, title: i.title, skills: i.skills || [], companyId: i.companyId?._id }))
    });

    if (!aiResponse.data.success) {
      throw new Error(aiResponse.data.message || "AI Service error");
    }

    const summary = aiResponse.data.summary;
    let totalMatches = 0;

    // Re-run matching to get detailed results for database updates
    for (const candidate of candidates) {
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/prolog/match`, {
        candidateId: String(candidate._id),
        candidateSkills: candidate.skills || [],
        internships: internships.map(i => ({ _id: i._id, title: i.title, skills: i.skills || [], companyId: i.companyId?._id }))
      });

      const prologResults = aiResponse.data.data;
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
    const candidate  = await Candidate.findById(req.params.candidateId);
    if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found" });
    const internships = await Internship.find({ status: "Open", approvalStatus: { $in: ["approved", "pending"] } });
    
    // Call AI Service via HTTP
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/prolog/preview`, {
      candidateId: String(candidate._id),
      candidateSkills: candidate.skills || [],
      internships: internships.map(i => ({ _id: i._id, title: i.title, skills: i.skills || [] }))
    });

    if (!aiResponse.data.success) {
      throw new Error(aiResponse.data.message || "AI Service error");
    }

    res.json({ success: true, program: aiResponse.data.program });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/prolog/diagnose/:candidateId
// Returns a full diagnostic report — candidate skills, internship count, sample Prolog output
const diagnose = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.candidateId);
    if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found" });

    const allInternships   = await Internship.find({});
    const openInternships  = await Internship.find({ status: "Open" });
    const matchableInterns = await Internship.find({ status: "Open", approvalStatus: { $in: ["approved", "pending"] } });

    // Call AI Service via HTTP
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/prolog/diagnose`, {
      candidateId: String(candidate._id),
      candidateSkills: candidate.skills || [],
      internships: matchableInterns.map(i => ({ _id: i._id, title: i.title, skills: i.skills || [], companyId: i.companyId }))
    });

    if (!aiResponse.data.success) {
      throw new Error(aiResponse.data.message || "AI Service error");
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
      prologResults: aiResponse.data.prologResults,
      program: aiResponse.data.program,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { runMatchForCandidate, runMatchAll, previewProlog, diagnose };
