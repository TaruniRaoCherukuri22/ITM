import Sidebar from "./Sidebar";
import { useParams } from "react-router-dom";
import Topbar from "./Topbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Tag,
  FileText,
  ScanLine,
  Save,
  CheckCircle2,
  X,
  ExternalLink,
  Loader2,
  UploadCloud,
} from "lucide-react";

/* ── Field wrapper ─────────────────────────────────── */
function Field({ icon: Icon, label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
        <Icon size={11} className="text-indigo-400" />
        {label}
      </label>
      {children}
    </div>
  );
}

/* ── Section divider ───────────────────────────────── */
function Section({ title }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">
        {title}
      </span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

const inputCls = `w-full px-4 py-2.5 rounded-xl text-sm text-gray-700
  border border-gray-200 bg-gray-50
  focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 focus:bg-white
  placeholder-gray-400 transition-all duration-200`;

/* ── Toast ─────────────────────────────────────────── */
function Toast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3
                 rounded-2xl text-sm font-medium shadow-xl border
                 ${isError
          ? "bg-red-50 border-red-200 text-red-700"
          : "bg-emerald-50 border-emerald-200 text-emerald-700"
        }`}
    >
      {isError
        ? <X size={15} className="text-red-500 shrink-0" />
        : <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
      }
      {toast.msg}
    </div>
  );
}

/* ── Main component ─────────────────────────────────── */
export default function Profile() {
  const navigate = useNavigate();

  let user = null;
  try {
    const stored = localStorage.getItem("user");
    if (stored && stored !== "undefined" && stored !== "null") {
      user = JSON.parse(stored);
    }
  } catch {
    user = null;
  }

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsAnalyzed, setAtsAnalyzed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [skillInput, setSkillInput] = useState("");

  const [profile, setProfile] = useState({
    name: "", email: "", phone: "", designation: "", skills: [], resume: null,
  });

  const { userId } = useParams();
  const isOwnProfile = !userId;

// if URL has userId → view other's profile
// else → logged-in user's profile
const profileUserId = userId || user?.id;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const fetchProfile = async () => {
      try {
        const res = await fetch(
  `http://localhost:5000/api/auth/profile/${profileUserId}`
);
        // const res = await fetch(`http://localhost:5000/api/auth/profile/${user.id}`);
        const data = await res.json();
        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          designation: data.designation || "",
          skills: data.skills || [],
          resume: data.resume || null,
        });
        setAtsAnalyzed(data.atsAnalyzed);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      await fetch(`http://localhost:5000/api/ats/analyze-all/${user.id}`, { method: "POST" });
      setAtsAnalyzed(true);
      showToast("Resume analysis completed 🎯");
    } catch {
      showToast("Failed to analyze resume", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResumeFile(file);
    setAtsAnalyzed(false);
    try {
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append("resume", file);
      const uploadRes = await fetch(`http://localhost:5000/api/auth/profile/${user.id}`, {
        method: "PUT", body: formData,
      });
      const data = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(data.message || "Upload failed");
      setProfile((prev) => ({ ...prev, resume: data.user.resume }));
      await handleAnalyze();
    } catch (err) {
      showToast(err.message || "Failed to upload resume", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSkillKey = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!profile.skills.includes(skillInput.trim())) {
        setProfile({ ...profile, skills: [...profile.skills, skillInput.trim()] });
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skill) =>
    setProfile({ ...profile, skills: profile.skills.filter((s) => s !== skill) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    formData.append("name", profile.name);
    formData.append("phone", profile.phone);
    formData.append("designation", profile.designation);
    formData.append("skills", JSON.stringify(profile.skills));
    if (resumeFile) formData.append("resume", resumeFile);
    try {
      const res = await fetch(`http://localhost:5000/api/auth/profile/${user.id}`, {
        method: "PUT", body: formData,
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message || "Failed to update", "error"); return; }
      setProfile((prev) => ({
        ...prev,
        name: data.user.name || prev.name,
        email: data.user.email || prev.email,
        phone: data.user.phone || prev.phone,
        designation: data.user.designation || prev.designation,
        skills: data.user.skills || prev.skills,
        resume: data.user.resume || prev.resume,
      }));
      setAtsAnalyzed(data.user.atsAnalyzed);
      showToast("Profile updated successfully ✅");
    } catch {
      showToast("Error updating profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const initials = (profile.name || "U").charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen text-gray-800 bg-gray-50">

      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div
        className={`flex-1 flex flex-col transition-all duration-300
          ${sidebarOpen ? "ml-60" : "ml-0"}`}
      >
        <Topbar setSidebarOpen={setSidebarOpen} />

        <div className="flex-1 flex justify-center px-4 pt-10 pb-16">
          <div className="w-full max-w-2xl space-y-6">

            {/* ── Header ── */}
            <div className="text-center space-y-2">
              {/* <div className="flex justify-center mb-3">
                <div
                  className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center
                             text-2xl font-black text-white select-none"
                  style={{
                    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                    boxShadow: "0 0 0 4px rgba(99,102,241,0.12), 0 4px 20px rgba(99,102,241,0.3)",
                  }}
                >
                  {initials}
                </div>
              </div> */}
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-800">
                My Profile
              </h1>
              {/* <p className="text-gray-400 text-xs">Manage your personal info and resume</p> */}
            </div>

            {/* ── Form card ── */}
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm"
            >
              <div className="p-7 space-y-6">

                {/* Personal Info */}
                <Section title="Personal Info" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field icon={User} label="Full Name">
                    <input
                      type="text" name="name" value={profile.name}
                      onChange={handleChange} placeholder="Full Name"
                      className={inputCls}
                    />
                  </Field>
                  <Field icon={Mail} label="Email">
                    <input
                      type="email" value={profile.email} disabled
                      className={`${inputCls} opacity-50 cursor-not-allowed`}
                    />
                  </Field>
                  <Field icon={Phone} label="Phone">
                    <input
                      type="text" name="phone" value={profile.phone}
                      onChange={handleChange} placeholder="Phone number"
                      className={inputCls}
                    />
                  </Field>
                  <Field icon={Briefcase} label="Designation">
                    <input
                      type="text" name="designation" value={profile.designation}
                      onChange={handleChange} placeholder="e.g. Software Engineer"
                      className={inputCls}
                    />
                  </Field>
                </div>

                {/* Skills */}
                <Section title="Skills" />

                <Field icon={Tag} label="Skills">
                  {profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium
                                     bg-indigo-50 border border-indigo-200 text-indigo-700"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="hover:text-red-500 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKey}
                    placeholder="Type a skill and press Enter…"
                    className={inputCls}
                  />
                </Field>

                {/* Resume */}
                <Section title="Resume" />

                <Field icon={FileText} label="Upload Resume">
                  <label
                    className="flex flex-col items-center justify-center gap-2.5 w-full py-8 rounded-xl
                               border-2 border-dashed border-indigo-200 bg-indigo-50/50
                               cursor-pointer hover:bg-indigo-50 hover:border-indigo-300
                               transition-all duration-200 text-center group"
                  >
                    <UploadCloud
                      size={26}
                      className="text-indigo-400 group-hover:scale-105 transition-transform"
                      strokeWidth={1.5}
                    />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        {resumeFile ? resumeFile.name : "Click to upload or replace resume"}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">PDF, DOC, DOCX</p>
                    </div>
                    <input type="file" onChange={handleFileChange} className="hidden" />
                  </label>

                  {profile.resume && (
                    <a
                      href={`http://localhost:5000${profile.resume}`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-500
                                 hover:text-indigo-700 transition-colors mt-2"
                    >
                      <ExternalLink size={12} />
                      View current resume
                    </a>
                  )}
                </Field>

                {/* Analyze button */}
                {profile.resume && (
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || atsAnalyzed}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                               text-sm font-semibold border transition-all duration-200
                               ${atsAnalyzed
                        ? "bg-emerald-50 border-emerald-200 text-emerald-600 cursor-default"
                        : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      }`}
                  >
                    {isAnalyzing ? (
                      <><Loader2 size={14} className="animate-spin" /> Analyzing Resume…</>
                    ) : atsAnalyzed ? (
                      <><CheckCircle2 size={14} /> Resume Already Analyzed</>
                    ) : (
                      <><ScanLine size={14} /> Analyze Resume with ATS</>
                    )}
                  </button>
                )}

                {/* Divider */}
                <div className="h-px bg-gray-100" />

                {/* Save button */}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                             text-sm font-bold text-white transition-all duration-200 disabled:opacity-60"
                  style={{
                    background: saving
                      ? "rgba(99,102,241,0.4)"
                      : "linear-gradient(135deg,#4f46e5,#7c3aed)",
                    boxShadow: saving ? "none" : "0 4px 16px rgba(99,102,241,0.35)",
                  }}
                >
                  {saving ? (
                    <><Loader2 size={14} className="animate-spin" /> Saving…</>
                  ) : (
                    <><Save size={14} /> Save Changes</>
                  )}
                </button>

              </div>
            </form>
          </div>
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
