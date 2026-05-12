import { useState, useCallback } from "react";
import { CheckCircle, XCircle, Building2, Briefcase, Clock } from "lucide-react";
import { useApi } from "../../lib/useApi";
import { approvalApi, internshipsApi } from "../../lib/api";
import { useToast } from "../../lib/toast";

const approvalBadge = { pending:"badge-yellow", approved:"badge-green", rejected:"badge-red" };

function NoteModal({ title, onConfirm, onClose, action }) {
  const [note, setNote] = useState("");
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth:420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{action === "approved" ? "Approve" : "Reject"} — {title}</span>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Note (optional)</label>
            <textarea className="input" rows={3} placeholder="Add a note for the company…"
              value={note} onChange={e => setNote(e.target.value)} style={{ resize:"vertical" }}/>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button
            className={`btn ${action === "approved" ? "btn-primary" : "btn-danger"}`}
            onClick={() => onConfirm(note)}
          >
            {action === "approved" ? "Approve" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CompanyApprovals() {
  const toast = useToast();
  const [refresh, setRefresh] = useState(0);
  const [modal, setModal] = useState(null); // { id, name, action }

  const { data, loading } = useApi(
    useCallback(() => approvalApi.pendingCompanies(), [refresh]), [refresh]
  );
  const companies = data?.data || [];

  const handleAction = async (note) => {
    try {
      await approvalApi.approveCompany(modal.id, { approvalStatus: modal.action, approvalNote: note });
      toast(`Company ${modal.action}`);
      setModal(null);
      setRefresh(r => r + 1);
    } catch (e) {
      toast(e.message || "Failed", "error");
    }
  };

  return (
    <div>
      {modal && (
        <NoteModal
          title={modal.name}
          action={modal.action}
          onConfirm={handleAction}
          onClose={() => setModal(null)}
        />
      )}
      <div style={{ fontWeight:600, fontSize:14, marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
        <Building2 size={15} style={{ color:"var(--primary)" }}/>
        Company Registrations
        {companies.length > 0 && (
          <span className="badge badge-yellow" style={{ fontSize:11 }}>{companies.length} pending</span>
        )}
      </div>

      {loading ? (
        <div style={{ padding:20, color:"var(--text-muted)", fontSize:13 }}>Loading...</div>
      ) : companies.length === 0 ? (
        <div className="empty-state" style={{ padding:24 }}><p>No pending company approvals.</p></div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {companies.map(c => (
            <div key={c._id} className="card" style={{ padding:16 }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13, marginBottom:3 }}>{c.name}</div>
                  <div style={{ fontSize:12, color:"var(--text-muted)", marginBottom:6 }}>
                    {c.industry && <span>{c.industry} · </span>}
                    {c.location && <span>{c.location} · </span>}
                    {c.email}
                  </div>
                  {c.description && (
                    <div style={{ fontSize:12, color:"var(--text-secondary)", lineHeight:1.5,
                      overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                      {c.description}
                    </div>
                  )}
                  <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:6 }}>
                    Registered: {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                  <button className="btn btn-primary" style={{ padding:"5px 14px", fontSize:12 }}
                    onClick={() => setModal({ id:c._id, name:c.name, action:"approved" })}>
                    <CheckCircle size={13}/> Approve
                  </button>
                  <button className="btn btn-danger" style={{ padding:"5px 14px", fontSize:12 }}
                    onClick={() => setModal({ id:c._id, name:c.name, action:"rejected" })}>
                    <XCircle size={13}/> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InternshipApprovals() {
  const toast = useToast();
  const [refresh, setRefresh] = useState(0);
  const [modal, setModal] = useState(null);

  const { data, loading } = useApi(
    useCallback(() => internshipsApi.pending(), [refresh]), [refresh]
  );
  const internships = data?.data || [];

  const handleAction = async (note) => {
    try {
      await internshipsApi.approve(modal.id, { approvalStatus: modal.action, approvalNote: note });
      toast(`Internship ${modal.action}`);
      setModal(null);
      setRefresh(r => r + 1);
    } catch (e) {
      toast(e.message || "Failed", "error");
    }
  };

  return (
    <div>
      {modal && (
        <NoteModal
          title={modal.name}
          action={modal.action}
          onConfirm={handleAction}
          onClose={() => setModal(null)}
        />
      )}
      <div style={{ fontWeight:600, fontSize:14, marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
        <Briefcase size={15} style={{ color:"var(--primary)" }}/>
        Internship Posts
        {internships.length > 0 && (
          <span className="badge badge-yellow" style={{ fontSize:11 }}>{internships.length} pending</span>
        )}
      </div>

      {loading ? (
        <div style={{ padding:20, color:"var(--text-muted)", fontSize:13 }}>Loading...</div>
      ) : internships.length === 0 ? (
        <div className="empty-state" style={{ padding:24 }}><p>No pending internship approvals.</p></div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {internships.map(i => (
            <div key={i._id} className="card" style={{ padding:16 }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                <div style={{ display:"flex", gap:12, flex:1 }}>
                  {i.imageUrl && (
                    <img src={i.imageUrl} alt="" style={{ width:56, height:56, objectFit:"cover", borderRadius:8, flexShrink:0 }}/>
                  )}
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:13, marginBottom:3 }}>{i.title}</div>
                    <div style={{ fontSize:12, color:"var(--text-muted)", marginBottom:4 }}>
                      {i.companyId?.name}
                      {i.location && <span> · {i.location}</span>}
                      {i.type && <span> · {i.type}</span>}
                      {i.stipend && <span style={{ color:"var(--primary)", fontWeight:500 }}> · {i.stipend}</span>}
                    </div>
                    {i.description && (
                      <div style={{ fontSize:12, color:"var(--text-secondary)", lineHeight:1.5,
                        overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                        {i.description}
                      </div>
                    )}
                    <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginTop:6 }}>
                      {(i.skills||[]).slice(0,4).map(s => (
                        <span key={s} className="badge badge-gray" style={{ fontSize:10 }}>{s}</span>
                      ))}
                    </div>
                    <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:6 }}>
                      Submitted: {new Date(i.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                  <button className="btn btn-primary" style={{ padding:"5px 14px", fontSize:12 }}
                    onClick={() => setModal({ id:i._id, name:i.title, action:"approved" })}>
                    <CheckCircle size={13}/> Approve
                  </button>
                  <button className="btn btn-danger" style={{ padding:"5px 14px", fontSize:12 }}
                    onClick={() => setModal({ id:i._id, name:i.title, action:"rejected" })}>
                    <XCircle size={13}/> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Approvals() {
  const [tab, setTab] = useState("companies");

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">Approvals</div>
          <div className="page-subtitle">Review and approve company registrations and internship posts</div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom:20, display:"inline-flex" }}>
        <button className={`tab ${tab === "companies" ? "active" : ""}`} onClick={() => setTab("companies")}>
          <Building2 size={13}/> Companies
        </button>
        <button className={`tab ${tab === "internships" ? "active" : ""}`} onClick={() => setTab("internships")}>
          <Briefcase size={13}/> Internships
        </button>
      </div>

      {tab === "companies"   ? <CompanyApprovals />   : <InternshipApprovals />}
    </div>
  );
}
