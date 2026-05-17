import { useState, useEffect } from "react";
import { useAuth } from "../../store/auth";
import { candidatesApi } from "../../lib/api";
import { useToast } from "../../lib/toast";

export default function MyProfile() {
  const { user } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", university: "", degree: "",
    gpa: "", skills: "", bio: "", linkedIn: "", resumeUrl: "",
  });

  useEffect(() => {
    if (user?.profile) {
      const p = user.profile;
      setForm({
        name:       p.name || "",
        email:      p.email || "",
        phone:      p.phone || "",
        university: p.university || "",
        degree:     p.degree || "",
        gpa:        p.gpa || "",
        skills:     (p.skills || []).join(", "),
        bio:        p.bio || "",
        linkedIn:   p.linkedIn || "",
        resumeUrl:  p.resumeUrl || "",
      });
    }
  }, [user]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!user?.profileId) { toast("Profile not linked. Please contact support.", "error"); return; }
    setSaving(true);
    try {
      await candidatesApi.update(user.profileId, {
        ...form,
        gpa: parseFloat(form.gpa) || 0,
        skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
      });
      toast("Profile updated successfully!");
    } catch (e) {
      toast(e.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">My Profile</div>
          <div className="page-subtitle">Keep your profile updated to get better matches</div>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:600, fontSize:13, marginBottom:16 }}>Personal Information</div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="input" value={form.name} onChange={e => set("name", e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => set("email", e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="input" placeholder="+1 234 567 8900" value={form.phone} onChange={e => set("phone", e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">LinkedIn URL</label>
              <input className="input" placeholder="https://linkedin.com/in/…" value={form.linkedIn} onChange={e => set("linkedIn", e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Resume URL</label>
              <input className="input" placeholder="https://drive.google.com/…" value={form.resumeUrl} onChange={e => set("resumeUrl", e.target.value)}/>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:600, fontSize:13, marginBottom:16 }}>Education & Skills</div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div className="form-group">
              <label className="form-label">University</label>
              <input className="input" placeholder="e.g. MIT" value={form.university} onChange={e => set("university", e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Degree</label>
              <input className="input" placeholder="e.g. BSc Computer Science" value={form.degree} onChange={e => set("degree", e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">GPA</label>
              <input className="input" type="number" step="0.01" min="0" max="4" placeholder="3.80" value={form.gpa} onChange={e => set("gpa", e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Skills (comma separated)</label>
              <input className="input" placeholder="React, Python, SQL" value={form.skills} onChange={e => set("skills", e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="input" rows={3} placeholder="Tell companies about yourself…" value={form.bio} onChange={e => set("bio", e.target.value)} style={{ resize:"vertical" }}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
