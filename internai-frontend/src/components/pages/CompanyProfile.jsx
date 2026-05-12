import { useState, useEffect } from "react";
import { useAuth } from "../../store/auth";
import { companiesApi } from "../../lib/api";
import { useToast } from "../../lib/toast";

export default function CompanyProfile() {
  const { user } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name:"", industry:"", location:"", website:"", email:"",
    phone:"", description:"", contactPerson:"", openRoles:0,
  });

  useEffect(() => {
    if (user?.profile) {
      const p = user.profile;
      setForm({
        name:          p.name || "",
        industry:      p.industry || "",
        location:      p.location || "",
        website:       p.website || "",
        email:         p.email || "",
        phone:         p.phone || "",
        description:   p.description || "",
        contactPerson: p.contactPerson || "",
        openRoles:     p.openRoles || 0,
      });
    }
  }, [user]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!user?.profileId) { toast("Profile not linked. Please contact support.", "error"); return; }
    setSaving(true);
    try {
      await companiesApi.update(user.profileId, { ...form, openRoles: parseInt(form.openRoles) || 0 });
      toast("Company profile updated!");
    } catch (e) {
      toast(e.message || "Failed to update", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">Company Profile</div>
          <div className="page-subtitle">Keep your company information up to date</div>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:600, fontSize:13, marginBottom:16 }}>Basic Information</div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input className="input" value={form.name} onChange={e => set("name", e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Industry</label>
              <input className="input" placeholder="e.g. Technology" value={form.industry} onChange={e => set("industry", e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="input" placeholder="e.g. Colombo, Sri Lanka" value={form.location} onChange={e => set("location", e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Open Roles</label>
              <input className="input" type="number" min="0" value={form.openRoles} onChange={e => set("openRoles", e.target.value)}/>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:600, fontSize:13, marginBottom:16 }}>Contact Details</div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input className="input" placeholder="e.g. HR Manager" value={form.contactPerson} onChange={e => set("contactPerson", e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => set("email", e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="input" placeholder="+94 11 234 5678" value={form.phone} onChange={e => set("phone", e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Website</label>
              <input className="input" placeholder="https://yourcompany.com" value={form.website} onChange={e => set("website", e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="input" rows={3} placeholder="Tell students about your company…" value={form.description} onChange={e => set("description", e.target.value)} style={{ resize:"vertical" }}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
