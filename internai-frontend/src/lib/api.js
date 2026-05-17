// src/lib/api.js — Central API client for InternAI

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export { BASE_URL };

function getToken() {
  return localStorage.getItem("internai_token");
}

async function request(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

const get  = (path)        => request("GET",    path);
const post = (path, body)  => request("POST",   path, body);
const put  = (path, body)  => request("PUT",    path, body);
const del  = (path)        => request("DELETE", path);

// ── Auth ──────────────────────────────────────────────────────────────
export const authApi = {
  login:          (email, password) => post("/auth/login", { email, password }),
  register:       (data)            => post("/auth/register", data),
  me:             ()                => get("/auth/me"),
  changePassword: (data)            => put("/auth/change-password", data),
};

// ── Dashboard ─────────────────────────────────────────────────────────
export const dashboardApi = {
  stats:              () => get("/dashboard/stats"),
  topMatches:         () => get("/dashboard/top-matches"),
  upcomingInterviews: () => get("/dashboard/upcoming-interviews"),
  student:            () => get("/dashboard/student"),
  company:            () => get("/dashboard/company"),
};

// ── Candidates ────────────────────────────────────────────────────────
export const candidatesApi = {
  list:   (params = {}) => get(`/candidates?${new URLSearchParams(params)}`),
  get:    (id)          => get(`/candidates/${id}`),
  create: (data)        => post("/candidates", data),
  update: (id, data)    => put(`/candidates/${id}`, data),
  delete: (id)          => del(`/candidates/${id}`),
};

// ── Companies ─────────────────────────────────────────────────────────
export const companiesApi = {
  list:   (params = {}) => get(`/companies?${new URLSearchParams(params)}`),
  get:    (id)          => get(`/companies/${id}`),
  create: (data)        => post("/companies", data),
  update: (id, data)    => put(`/companies/${id}`, data),
  delete: (id)          => del(`/companies/${id}`),
};

// ── Applications ──────────────────────────────────────────────────────
export const applicationsApi = {
  list:   (params = {}) => get(`/applications?${new URLSearchParams(params)}`),
  get:    (id)          => get(`/applications/${id}`),
  create: (data)        => post("/applications", data),
  update: (id, data)    => put(`/applications/${id}`, data),
  delete: (id)          => del(`/applications/${id}`),
};

// ── Matches ───────────────────────────────────────────────────────────
export const matchesApi = {
  list:   (params = {}) => get(`/matches?${new URLSearchParams(params)}`),
  get:    (id)          => get(`/matches/${id}`),
  create: (data)        => post("/matches", data),
  update: (id, data)    => put(`/matches/${id}`, data),
  delete: (id)          => del(`/matches/${id}`),
};

// ── Interviews ────────────────────────────────────────────────────────
export const interviewsApi = {
  list:   (params = {}) => get(`/interviews?${new URLSearchParams(params)}`),
  get:    (id)          => get(`/interviews/${id}`),
  create: (data)        => post("/interviews", data),
  update: (id, data)    => put(`/interviews/${id}`, data),
  delete: (id)          => del(`/interviews/${id}`),
};

// ── Analytics ─────────────────────────────────────────────────────────
export const analyticsApi = {
  overview:     () => get("/analytics/overview"),
  monthly:      () => get("/analytics/monthly"),
  topCompanies: () => get("/analytics/top-companies"),
  topSkills:    () => get("/analytics/top-skills"),
};

// ── Internships ───────────────────────────────────────────────────────
export const internshipsApi = {
  list:      (params = {}) => get(`/internships?${new URLSearchParams(params)}`),
  listAll:   (params = {}) => get(`/internships/admin/all?${new URLSearchParams(params)}`),
  pending:   ()            => get("/internships/admin/pending"),
  get:       (id)          => get(`/internships/${id}`),
  delete:    (id)          => del(`/internships/${id}`),
  approve:   (id, data)    => put(`/internships/${id}/approve`, data),

  create: (formData) => {
    const token = localStorage.getItem("internai_token");
    return fetch(`${BASE_URL}/internships`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.message); return d; });
  },
  update: (id, formData) => {
    const token = localStorage.getItem("internai_token");
    return fetch(`${BASE_URL}/internships/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.message); return d; });
  },
};

// ── Company Approval ──────────────────────────────────────────────────
export const approvalApi = {
  pendingCompanies:    ()           => get("/companies/pending"),
  approveCompany:      (id, data)   => put(`/companies/${id}/approve`, data),
};

// ── Prolog AI Matching ────────────────────────────────────────────────
export const prologApi = {
  // Run Prolog match for one candidate, saves results to Matches collection
  matchCandidate: (candidateId)  => post("/prolog/match", { candidateId }),
  // Batch: run Prolog match for ALL active candidates
  matchAll:       ()             => post("/prolog/match-all", {}),
  // Debug: see the generated Prolog program for a candidate
  preview:        (candidateId)  => get(`/prolog/preview/${candidateId}`),
};
