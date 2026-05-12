import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, DollarSign, Calendar, Users, Building2, Globe, Mail, Phone, X, Briefcase } from "lucide-react";
import { useApi } from "../../lib/useApi";
import { internshipsApi, applicationsApi } from "../../lib/api";
import { useAuth } from "../../store/auth";
import { useToast } from "../../lib/toast";

const typeColor = { Remote:"badge-blue", "On-site":"badge-green", Hybrid:"badge-purple" };

function ApplyModal({ internship, onClose, onApplied }) {
  const { user } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const handleApply = async () => {
    if (!user?.profileId) { toast("Complete your profile first", "error"); return; }
    setSaving(true);
    try {
      await applicationsApi.create({
        candidateId:  user.profileId,
        companyId:    internship.companyId?._id || internship.companyId,
        internshipId: internship._id,
        role:         internship.title,
        appliedDate:  new Date().toISOString().split("T")[0],
        status:       "Applied",
        coverLetter,
      });
      toast(`Applied to "${internship.title}" successfully!`);
      onApplied();
      onClose();
    } catch (e) {
      toast(e.message || "Failed to apply", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Apply — {internship.title}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{internship.companyId?.name}</div>
          </div>
          <button className="btn btn-ghost" style={{ padding: "4px 6px" }} onClick={onClose}><X size={15} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Cover Letter (optional)</label>
            <textarea className="input" rows={5} placeholder="Tell the company why you're a great fit for this role…"
              value={coverLetter} onChange={e => setCoverLetter(e.target.value)} style={{ resize: "vertical" }} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleApply} disabled={saving}>
            {saving ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InternshipCard({ internship, onClick }) {
  return (
    <div className="card" style={{ cursor: "pointer", overflow: "hidden", transition: "box-shadow 0.2s" }}
      onClick={() => onClick(internship._id)}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "var(--shadow)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = ""}>
      {internship.imageUrl && (
        <img src={internship.imageUrl} alt={internship.title}
          style={{ width: "100%", height: 100, objectFit: "cover" }} />
      )}
      <div style={{ padding: 14 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3 }}>{internship.companyId?.name}</div>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, lineHeight: 1.3 }}>{internship.title}</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {internship.type && <span className={`badge ${typeColor[internship.type] || "badge-gray"}`} style={{ fontSize: 10 }}>{internship.type}</span>}
          {internship.location && <span style={{ fontSize: 11, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 2 }}><MapPin size={9} />{internship.location}</span>}
        </div>
        {internship.stipend && <div style={{ fontSize: 11, color: "var(--primary)", fontWeight: 600 }}>{internship.stipend}</div>}
      </div>
    </div>
  );
}

export default function InternshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applyModal, setApplyModal] = useState(false);
  const [applied, setApplied] = useState(false);

  const { data: res, loading, error } = useApi(
    useCallback(() => internshipsApi.get(id), [id]),
    [id]
  );
  const internship = res?.data;

  // Related internships from same company
  const { data: relatedRes } = useApi(
    useCallback(() => internship?.companyId?._id
      ? internshipsApi.list({ companyId: internship.companyId._id, limit: 4 })
      : Promise.resolve({ data: [] }),
      [internship?.companyId?._id]
    ),
    [internship?.companyId?._id]
  );
  const related = (relatedRes?.data || []).filter(r => r._id !== id);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>;
  if (error || !internship) return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <p style={{ color: "#e24b4a", marginBottom: 12 }}>Internship not found.</p>
      <button className="btn" onClick={() => navigate(-1)}><ArrowLeft size={13} /> Go back</button>
    </div>
  );

  const company = internship.companyId;

  return (
    <div className="page-enter">
      {applyModal && (
        <ApplyModal
          internship={internship}
          onClose={() => setApplyModal(false)}
          onApplied={() => setApplied(true)}
        />
      )}

      {/* Back */}
      <button className="btn btn-ghost" style={{ marginBottom: 16, padding: "6px 10px" }} onClick={() => navigate(-1)}>
        <ArrowLeft size={14} /> Back
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "flex-start" }}>
        {/* ── LEFT: Main content ── */}
        <div>
          {/* Banner */}
          {internship.imageUrl && (
            <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
              <img src={internship.imageUrl} alt={internship.title}
                style={{ width: "100%", maxHeight: 320, objectFit: "cover" }} />
            </div>
          )}

          {/* Header */}
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{company?.name}</div>
                <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>{internship.title}</h1>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  {internship.type && <span className={`badge ${typeColor[internship.type] || "badge-gray"}`}>{internship.type}</span>}
                  {internship.status && <span className={`badge ${internship.status === "Open" ? "badge-green" : "badge-gray"}`}>{internship.status}</span>}
                  {internship.location && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-secondary)" }}>
                      <MapPin size={12} /> {internship.location}
                    </span>
                  )}
                  {internship.duration && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-secondary)" }}>
                      <Clock size={12} /> {internship.duration}
                    </span>
                  )}
                  {internship.stipend && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>
                      <DollarSign size={12} /> {internship.stipend}
                    </span>
                  )}
                  {internship.deadline && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-secondary)" }}>
                      <Calendar size={12} /> Deadline: {internship.deadline}
                    </span>
                  )}
                </div>
              </div>
              {user?.role === "student" && (
                <button
                  className={`btn ${applied ? "" : "btn-primary"}`}
                  style={{ flexShrink: 0, padding: "9px 22px" }}
                  disabled={applied || internship.status === "Closed"}
                  onClick={() => setApplyModal(true)}
                >
                  {applied ? "Applied ✓" : internship.status === "Closed" ? "Closed" : "Apply Now"}
                </button>
              )}
            </div>
          </div>

          {/* Skills */}
          {internship.skills?.length > 0 && (
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Required Skills</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {internship.skills.map(s => (
                  <span key={s} className="badge badge-blue" style={{ fontSize: 12, padding: "4px 12px" }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {internship.description && (
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>About the Role</div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {internship.description}
              </p>
            </div>
          )}

          {/* Requirements */}
          {internship.requirements && (
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Requirements</div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {internship.requirements}
              </p>
            </div>
          )}

          {/* Related internships */}
          {related.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>More from {company?.name}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                {related.map(r => (
                  <InternshipCard key={r._id} internship={r} onClick={id => navigate(`/internship/${id}`)} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Company profile sidebar ── */}
        <div style={{ position: "sticky", top: 20 }}>
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Building2 size={22} style={{ color: "var(--primary)" }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{company?.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{company?.industry}</div>
              </div>
            </div>

            {company?.description && (
              <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 14 }}>
                {company.description}
              </p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {company?.location && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                  <MapPin size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  {company.location}
                </div>
              )}
              {company?.website && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <Globe size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  <a href={company.website} target="_blank" rel="noreferrer" style={{ color: "var(--primary)" }}>
                    {company.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
              {company?.email && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                  <Mail size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  {company.email}
                </div>
              )}
              {company?.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                  <Phone size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  {company.phone}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16, paddingTop: 16, borderTop: "var(--border)" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: "var(--primary)" }}>{company?.openRoles || 0}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Open Roles</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: "var(--primary)" }}>{company?.totalHires || 0}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Total Hires</div>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 12, color: "var(--text-secondary)" }}>Internship Info</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: Users,    label: "Applicants",  value: internship.applicants || 0 },
                { icon: Clock,    label: "Duration",    value: internship.duration || "Not specified" },
                { icon: DollarSign, label: "Stipend",   value: internship.stipend  || "Not specified" },
                { icon: Calendar, label: "Deadline",    value: internship.deadline || "Open" },
                { icon: Briefcase,label: "Work Type",   value: internship.type     || "Not specified" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)" }}>
                    <Icon size={12} /> {label}
                  </span>
                  <span style={{ fontWeight: 500, color: "var(--text)" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
