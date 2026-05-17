import Portal from "../../lib/Portal";
import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Clock, DollarSign, Calendar,
  Users, Building2, Globe, Mail, Phone, X, Briefcase, CheckCircle
} from "lucide-react";
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
    <Portal><div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth:500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Apply — {internship.title}</div>
            <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>{internship.companyId?.name}</div>
          </div>
          <button className="btn btn-ghost" style={{ padding:"4px 6px" }} onClick={onClose}><X size={15}/></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Cover Letter (optional)</label>
            <textarea className="input" rows={5}
              placeholder="Tell the company why you're a great fit…"
              value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
              style={{ resize:"vertical" }}/>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleApply} disabled={saving}>
            {saving ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </div>
    </div></Portal>
  );
}

function RelatedCard({ internship, onClick }) {
  return (
    <div
      className="card"
      style={{ cursor:"pointer", display:"flex", gap:12, padding:12, alignItems:"flex-start",
        transition:"box-shadow 0.15s" }}
      onClick={() => onClick(internship._id)}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "var(--shadow)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = ""}
    >
      {internship.imageUrl ? (
        <img src={internship.imageUrl} alt=""
          style={{ width:48, height:48, objectFit:"cover", borderRadius:8, flexShrink:0 }}/>
      ) : (
        <div style={{ width:48, height:48, borderRadius:8, background:"var(--primary-light)",
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Briefcase size={18} style={{ color:"var(--primary)" }}/>
        </div>
      )}
      <div style={{ minWidth:0 }}>
        <div style={{ fontWeight:600, fontSize:12.5, marginBottom:3, lineHeight:1.3 }}>{internship.title}</div>
        <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:4 }}>{internship.companyId?.name}</div>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {internship.type && <span className={`badge ${typeColor[internship.type]||"badge-gray"}`} style={{ fontSize:10 }}>{internship.type}</span>}
          {internship.stipend && <span style={{ fontSize:10, color:"var(--primary)", fontWeight:600 }}>{internship.stipend}</span>}
        </div>
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
    useCallback(() => internshipsApi.get(id), [id]), [id]
  );
  const internship = res?.data;
  const company    = internship?.companyId;

  const { data: relatedRes } = useApi(
    useCallback(() =>
      internship?.companyId?._id
        ? internshipsApi.list({ companyId: internship.companyId._id, limit: 5 })
        : Promise.resolve({ data: [] }),
      [internship?.companyId?._id]
    ),
    [internship?.companyId?._id]
  );
  const related = (relatedRes?.data || []).filter(r => r._id !== id);

  if (loading) return (
    <div style={{ padding:48, textAlign:"center", color:"var(--text-muted)", fontSize:13 }}>Loading...</div>
  );
  if (error || !internship) return (
    <div style={{ padding:48, textAlign:"center" }}>
      <p style={{ color:"#e24b4a", marginBottom:12 }}>Internship not found.</p>
      <button className="btn" onClick={() => navigate(-1)}><ArrowLeft size={13}/> Go back</button>
    </div>
  );

  const metaItems = [
    internship.location && { icon: MapPin,      text: internship.location },
    internship.type     && { icon: Briefcase,   text: internship.type },
    internship.duration && { icon: Clock,       text: internship.duration },
    internship.stipend  && { icon: DollarSign,  text: internship.stipend, highlight: true },
    internship.deadline && { icon: Calendar,    text: `Deadline: ${internship.deadline}` },
    internship.applicants != null && { icon: Users, text: `${internship.applicants} applicants` },
  ].filter(Boolean);

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
      <button className="btn btn-ghost" style={{ marginBottom:14, padding:"5px 10px", fontSize:12 }}
        onClick={() => navigate(-1)}>
        <ArrowLeft size={13}/> Back to listings
      </button>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:18, alignItems:"flex-start" }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* Hero card — header with thumbnail */}
          <div className="card" style={{ overflow:"hidden" }}>
            {/* Thin accent banner */}
            <div style={{ height:6, background:"linear-gradient(90deg, var(--primary), var(--primary-mid))" }}/>

            <div style={{ padding:"20px 24px" }}>
              <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
                {/* Thumbnail */}
                <div style={{ flexShrink:0 }}>
                  {internship.imageUrl ? (
                    <img src={internship.imageUrl} alt={internship.title}
                      style={{ width:72, height:72, objectFit:"cover", borderRadius:10, border:"var(--border)" }}/>
                  ) : (
                    <div style={{ width:72, height:72, borderRadius:10, background:"var(--primary-light)",
                      display:"flex", alignItems:"center", justifyContent:"center", border:"var(--border)" }}>
                      <Briefcase size={28} style={{ color:"var(--primary)" }}/>
                    </div>
                  )}
                </div>

                {/* Title + company + badges */}
                <div style={{ flex:1, minWidth:0 }}>
                  <h1 style={{ fontSize:18, fontWeight:700, marginBottom:4, lineHeight:1.3 }}>{internship.title}</h1>
                  <div style={{ fontSize:13, color:"var(--text-secondary)", marginBottom:10 }}>
                    {company?.name}
                    {company?.industry && <span style={{ color:"var(--text-muted)" }}> · {company.industry}</span>}
                  </div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
                    <span className={`badge ${internship.status === "Open" ? "badge-green" : "badge-gray"}`}>
                      {internship.status}
                    </span>
                    {internship.type && (
                      <span className={`badge ${typeColor[internship.type]||"badge-gray"}`}>{internship.type}</span>
                    )}
                  </div>
                </div>

                {/* Apply button */}
                {user?.role === "student" && (
                  <button
                    className={`btn ${applied ? "" : "btn-primary"}`}
                    style={{ flexShrink:0, padding:"8px 20px", fontSize:13 }}
                    disabled={applied || internship.status === "Closed"}
                    onClick={() => setApplyModal(true)}
                  >
                    {applied ? <><CheckCircle size={13}/> Applied</> : internship.status === "Closed" ? "Closed" : "Apply Now"}
                  </button>
                )}
              </div>

              {/* Meta row */}
              <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginTop:16, paddingTop:16,
                borderTop:"var(--border)", fontSize:12, color:"var(--text-secondary)" }}>
                {metaItems.map(({ icon: Icon, text, highlight }, i) => (
                  <span key={i} style={{ display:"flex", alignItems:"center", gap:5,
                    color: highlight ? "var(--primary)" : "var(--text-secondary)",
                    fontWeight: highlight ? 600 : 400 }}>
                    <Icon size={12} style={{ opacity:0.7 }}/>{text}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Skills */}
          {internship.skills?.length > 0 && (
            <div className="card" style={{ padding:"18px 24px" }}>
              <div style={{ fontWeight:600, fontSize:13, marginBottom:12 }}>Required Skills</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {internship.skills.map(s => (
                  <span key={s} className="badge badge-blue" style={{ fontSize:12, padding:"4px 12px" }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {internship.description && (
            <div className="card" style={{ padding:"18px 24px" }}>
              <div style={{ fontWeight:600, fontSize:13, marginBottom:12 }}>About the Role</div>
              <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.8, whiteSpace:"pre-wrap" }}>
                {internship.description}
              </p>
            </div>
          )}

          {/* Requirements */}
          {internship.requirements && (
            <div className="card" style={{ padding:"18px 24px" }}>
              <div style={{ fontWeight:600, fontSize:13, marginBottom:12 }}>Requirements</div>
              <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.8, whiteSpace:"pre-wrap" }}>
                {internship.requirements}
              </p>
            </div>
          )}

          {/* Related */}
          {related.length > 0 && (
            <div>
              <div style={{ fontWeight:600, fontSize:13, marginBottom:12, color:"var(--text-secondary)" }}>
                More from {company?.name}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {related.map(r => (
                  <RelatedCard key={r._id} internship={r} onClick={rid => navigate(`/internship/${rid}`)}/>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:14, position:"sticky", top:16 }}>

          {/* Company card */}
          <div className="card" style={{ padding:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <div style={{ width:38, height:38, borderRadius:8, background:"var(--primary-light)",
                display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Building2 size={18} style={{ color:"var(--primary)" }}/>
              </div>
              <div>
                <div style={{ fontWeight:600, fontSize:13 }}>{company?.name}</div>
                <div style={{ fontSize:11, color:"var(--text-muted)" }}>{company?.industry}</div>
              </div>
            </div>

            {company?.description && (
              <p style={{ fontSize:12, color:"var(--text-secondary)", lineHeight:1.6, marginBottom:14,
                display:"-webkit-box", WebkitLineClamp:4, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                {company.description}
              </p>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:8, fontSize:12 }}>
              {company?.location && (
                <div style={{ display:"flex", alignItems:"center", gap:8, color:"var(--text-secondary)" }}>
                  <MapPin size={12} style={{ color:"var(--text-muted)", flexShrink:0 }}/>{company.location}
                </div>
              )}
              {company?.website && (
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <Globe size={12} style={{ color:"var(--text-muted)", flexShrink:0 }}/>
                  <a href={company.website} target="_blank" rel="noreferrer"
                    style={{ color:"var(--primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {company.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
              {company?.email && (
                <div style={{ display:"flex", alignItems:"center", gap:8, color:"var(--text-secondary)" }}>
                  <Mail size={12} style={{ color:"var(--text-muted)", flexShrink:0 }}/>{company.email}
                </div>
              )}
              {company?.phone && (
                <div style={{ display:"flex", alignItems:"center", gap:8, color:"var(--text-secondary)" }}>
                  <Phone size={12} style={{ color:"var(--text-muted)", flexShrink:0 }}/>{company.phone}
                </div>
              )}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:14,
              paddingTop:14, borderTop:"var(--border)", textAlign:"center" }}>
              <div>
                <div style={{ fontWeight:700, fontSize:16, color:"var(--primary)" }}>{company?.openRoles || 0}</div>
                <div style={{ fontSize:10, color:"var(--text-muted)" }}>Open Roles</div>
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:16, color:"var(--primary)" }}>{company?.totalHires || 0}</div>
                <div style={{ fontSize:10, color:"var(--text-muted)" }}>Total Hires</div>
              </div>
            </div>
          </div>

          {/* Quick info card */}
          <div className="card" style={{ padding:16 }}>
            <div style={{ fontWeight:600, fontSize:12, color:"var(--text-secondary)", marginBottom:12,
              textTransform:"uppercase", letterSpacing:"0.4px" }}>Internship Details</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[
                { icon:Briefcase,   label:"Work Type",  value: internship.type     || "—" },
                { icon:Clock,       label:"Duration",   value: internship.duration || "—" },
                { icon:DollarSign,  label:"Stipend",    value: internship.stipend  || "—" },
                { icon:Calendar,    label:"Deadline",   value: internship.deadline || "Open" },
                { icon:Users,       label:"Applicants", value: internship.applicants ?? 0 },
              ].map(({ icon:Icon, label, value }) => (
                <div key={label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:12 }}>
                  <span style={{ display:"flex", alignItems:"center", gap:6, color:"var(--text-muted)" }}>
                    <Icon size={12}/>{label}
                  </span>
                  <span style={{ fontWeight:500, color:"var(--text)" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Apply CTA for student */}
          {user?.role === "student" && !applied && internship.status === "Open" && (
            <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center", padding:"10px" }}
              onClick={() => setApplyModal(true)}>
              Apply for this Internship
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
