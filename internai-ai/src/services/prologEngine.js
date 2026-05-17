/**
 * prologEngine.js  — Prolog Matching Engine
 *
 * Core AI logic for matching candidates to internships using Prolog rules.
 * This service is independent and can be called via HTTP API.
 */

const pl = require("tau-prolog");
require("tau-prolog/modules/lists")(pl);

/** Sanitize any string into a safe Prolog atom */
function toAtom(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/__+/g, "_") || "x";
}

/** Build the full Prolog program from candidate and internship data */
function buildPrologProgram(candidateId, candidateSkills, internships) {
  const cAtom = toAtom(candidateId);
  const lines  = [];

  // ── Candidate skills ────────────────────────────────────────
  lines.push("% Candidate skills");
  if (candidateSkills.length === 0) {
    lines.push(`% (no skills for ${cAtom})`);
  }
  for (const skill of candidateSkills) {
    lines.push(`skill('${cAtom}', '${toAtom(skill)}').`);
  }

  // ── Internship requirements ──────────────────────────────────
  lines.push("\n% Internship requirements");
  for (const intern of internships) {
    const iAtom = toAtom(String(intern._id));
    lines.push(`internship('${iAtom}', '${toAtom(intern.title)}').`);
    for (const skill of (intern.skills || [])) {
      lines.push(`requires('${iAtom}', '${toAtom(skill)}').`);
    }
  }

  // ── Rules ────────────────────────────────────────────────────
  // IMPORTANT: use list_len/2 instead of length/2 (broken in tau-prolog)
  // IMPORTANT: negation is \+ in Prolog but needs \\\\+ in JS template literals
  lines.push(`
% Core rules
has_skill(C, S) :- skill(C, S).

list_len([], 0).
list_len([_|T], N) :- list_len(T, N1), N is N1 + 1.

matched_skills(C, E, Matched) :-
    findall(S, (requires(E, S), has_skill(C, S)), Matched).

skill_gaps(C, E, Gaps) :-
    findall(S, (requires(E, S), \\+ has_skill(C, S)), Gaps).

match_score(C, E, Score) :-
    findall(_, requires(E, _), RL), list_len(RL, Total),
    ( Total =:= 0
    -> Score is 0
    ;  findall(S, (requires(E, S), has_skill(C, S)), ML),
       list_len(ML, Match),
       Score is truncate((Match / Total) * 1000) / 10
    ).
`);

  return lines.join("\n");
}

/** Parse a Prolog list string like "[java,'spring boot',docker]" into JS array */
function parsePrologList(str) {
  if (!str) return [];
  const m = str.match(/\[([^\]]*)\]/);
  if (!m || !m[1].trim()) return [];
  return m[1].split(",").map(x => x.trim().replace(/^'|'$/g, "").replace(/_/g, " "));
}

/**
 * Run Prolog matching for one candidate vs all internships.
 * Returns array of { internshipId, internshipTitle, companyId, score, matchedSkills, skillGap }
 */
function runPrologMatch(candidateId, candidateSkills, internships) {
  return new Promise((resolve, reject) => {
    if (!internships.length) return resolve([]);

    const session = pl.create(20000);
    const program = buildPrologProgram(candidateId, candidateSkills, internships);

    session.consult(program, {
      success: () => {
        const results = [];
        let idx = 0;
        const cAtom = toAtom(candidateId);

        function ask(queryStr, cb) {
          session.query(queryStr, {
            success: () => session.answer({
              success: ans => cb(pl.format_answer(ans)),
              fail:    ()  => cb(null),
              error:   ()  => cb(null),
              limit:   ()  => cb(null),
            }),
            error: () => cb(null),
          });
        }

        function next() {
          if (idx >= internships.length) return resolve(results);
          const intern = internships[idx++];
          const iAtom  = toAtom(String(intern._id));
          let score = 0, matchedSkills = [], skillGap = [];

          ask(`match_score('${cAtom}','${iAtom}',Score).`, (ans) => {
            if (ans) {
              const m = ans.match(/Score\s*=\s*([\d.]+)/);
              if (m) score = parseFloat(m[1]);
            }

            ask(`matched_skills('${cAtom}','${iAtom}',Matched).`, (ans) => {
              matchedSkills = parsePrologList(ans);

              ask(`skill_gaps('${cAtom}','${iAtom}',Gaps).`, (ans) => {
                skillGap = parsePrologList(ans);

                results.push({
                  internshipId:    String(intern._id),
                  internshipTitle: intern.title,
                  companyId:       String(intern.companyId || ""),
                  score,
                  matchedSkills,
                  skillGap,
                });
                next();
              });
            });
          });
        }

        next();
      },
      error: (err) => {
        reject(new Error("Prolog consult error: " + (err?.indicator || JSON.stringify(err))));
      },
    });
  });
}

module.exports = { runPrologMatch, buildPrologProgram, toAtom };
