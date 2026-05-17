/**
 * prolog.controller.js
 * AI Service Controller - Handles Prolog matching logic
 */
const { runPrologMatch, buildPrologProgram, toAtom } = require("../services/prologEngine");

// POST /api/prolog/match
// Body: { candidateId, candidateSkills, internships }
const runMatchForCandidate = async (req, res) => {
  try {
    const { candidateId, candidateSkills, internships } = req.body;
    
    if (!candidateId) {
      return res.status(400).json({ success: false, message: "candidateId is required" });
    }
    if (!candidateSkills || !Array.isArray(candidateSkills)) {
      return res.status(400).json({ success: false, message: "candidateSkills array is required" });
    }
    if (!internships || !Array.isArray(internships)) {
      return res.status(400).json({ success: false, message: "internships array is required" });
    }

    // Run Prolog engine
    const prologResults = await runPrologMatch(
      String(candidateId),
      candidateSkills || [],
      internships
    );

    // Filter results with score > 0 and sort by score desc
    const matched = prologResults
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      candidateId,
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
// Body: { candidates, internships }
const runMatchAll = async (req, res) => {
  try {
    const { candidates, internships } = req.body;
    
    if (!candidates || !Array.isArray(candidates)) {
      return res.status(400).json({ success: false, message: "candidates array is required" });
    }
    if (!internships || !Array.isArray(internships)) {
      return res.status(400).json({ success: false, message: "internships array is required" });
    }

    if (!internships.length) {
      return res.json({ success: true, message: "No internships provided", processed: 0 });
    }

    let totalMatches = 0;
    const summary = [];

    for (const candidate of candidates) {
      const prologResults = await runPrologMatch(
        String(candidate._id),
        candidate.skills || [],
        internships
      );

      const matched = prologResults.filter(r => r.score > 0).sort((a, b) => b.score - a.score);

      for (const r of matched) {
        totalMatches++;
      }

      summary.push({ 
        candidateId: candidate._id, 
        name: candidate.name, 
        matchCount: matched.length 
      });
    }

    res.json({ 
      success: true, 
      processed: candidates.length, 
      totalMatches, 
      summary 
    });
  } catch (err) {
    console.error("Prolog match-all error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/prolog/preview
// Body: { candidateId, candidateSkills, internships }
const previewProlog = async (req, res) => {
  try {
    const { candidateId, candidateSkills, internships } = req.body;
    
    if (!candidateId) {
      return res.status(400).json({ success: false, message: "candidateId is required" });
    }
    
    const program = buildPrologProgram(
      String(candidateId),
      candidateSkills || [],
      internships || []
    );
    
    res.json({ success: true, program });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/prolog/diagnose
// Body: { candidateId, candidateSkills, internships }
const diagnose = async (req, res) => {
  try {
    const { candidateId, candidateSkills, internships } = req.body;
    
    if (!candidateId) {
      return res.status(400).json({ success: false, message: "candidateId is required" });
    }

    const matchableInterns = internships || [];

    const program = buildPrologProgram(
      String(candidateId),
      candidateSkills || [],
      matchableInterns.map(i => ({ _id: i._id, title: i.title, skills: i.skills || [] }))
    );

    let prologResults = [];
    try {
      prologResults = await runPrologMatch(
        String(candidateId),
        candidateSkills || [],
        matchableInterns.map(i => ({ _id: i._id, title: i.title, skills: i.skills || [], companyId: i.companyId }))
      );
    } catch (e) {
      prologResults = [{ error: e.message }];
    }

    res.json({
      success: true,
      candidate: { 
        id: candidateId, 
        skills: candidateSkills || [], 
        skillCount: (candidateSkills || []).length 
      },
      internshipCounts: {
        total: internships?.length || 0,
        matchable: matchableInterns.length,
      },
      prologResults,
      program,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { runMatchForCandidate, runMatchAll, previewProlog, diagnose };
