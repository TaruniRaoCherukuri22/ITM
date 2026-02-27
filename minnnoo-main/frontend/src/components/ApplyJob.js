import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SuccessModal from "../components/SuccessModalhr";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  Building2,
  MapPin,
  Layers,
  Users,
  Clock,
  CalendarX2,
  ChevronLeft,
  Send,
  CheckCircle2,
  Loader2,
  MessageSquare,
} from "lucide-react";

/* ── Safe user id ───────────────────────────── */
const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?._id || user?.id || null;
  } catch {
    return null;
  }
};

/* ── Info pill ──────────────────────────────── */
function InfoPill({ icon: Icon, label, value, color = "#4f46e5" }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs bg-gray-50 border border-gray-100"
    >
      <Icon size={13} color={color} strokeWidth={2} />
      <span className="text-gray-400 font-medium">{label}:</span>
      <span className="text-gray-700 font-semibold">{value}</span>
    </div>
  );
}

export default function ApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const userId = getUserId();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);
  const [success, setSuccess] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applicationStatus, setApplicationStatus] = useState(null);

  /* ── Fetch application status ── */
  useEffect(() => {
    const fetchStatus = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`http://localhost:5000/api/applications/user/${userId}`);
        const data = await res.json();
        const found = data.find((app) => app.vacancyId === jobId);
        setApplicationStatus(found?.status || null);
        if (found) setApplied(true);
      } catch {
        setApplicationStatus(null);
      }
    };
    fetchStatus();
  }, [jobId]);

  /* ── Fetch job ── */
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/hr/vacancies/${jobId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch job");
        setJob(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  /* ── Submit ── */
  const submitApplication = async (e) => {
    e.preventDefault();
    if (!userId) return alert("Please log in to apply");
    try {
      setSubmitting(true);
      const res = await fetch("http://localhost:5000/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, vacancyId: jobId, coverLetter }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Application failed");
      setSuccess(true);
      setApplied(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading State ── */
  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-gray-400 text-sm font-medium">Loading job details…</p>
      </div>
    );

  /* ── Error State ── */
  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 text-2xl">
          ⚠️
        </div>
        <p className="text-gray-800 font-semibold">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 transition"
        >
          ← Go Back
        </button>
      </div>
    );

  return (
    <div className="flex min-h-screen text-gray-800 bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "ml-60" : "ml-0"}`}>
        <Topbar setSidebarOpen={setSidebarOpen} />

        <div className="flex-1 flex justify-center px-4 pt-10 pb-16">
          <div className="relative z-10 w-full max-w-2xl space-y-5">

            {/* ── Header Area ── */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-indigo-600 transition"
              >
                <ChevronLeft size={18} /> BACK TO RECRUITMENT
              </button>
            </div>

            {/* ── Main card ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <form onSubmit={submitApplication} className="p-7 md:p-9 space-y-7">

                {/* ── Job title + company ── */}
                <div className="space-y-2">
                  <h2 className="text-3xl font-black tracking-tight text-gray-800 leading-tight">
                    {job.title}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-500 font-medium">
                    <div className="p-1.5 bg-gray-100 rounded-lg">
                      <Building2 size={14} className="text-indigo-500" />
                    </div>
                    <span>{job.company}</span>
                  </div>
                </div>

                {/* ── Application status badge ── */}
                {applied && applicationStatus && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold bg-emerald-50 border border-emerald-100 text-emerald-700">
                    <CheckCircle2 size={16} />
                    <span>Application Submitted · Status: {applicationStatus}</span>
                  </div>
                )}

                {/* ── Info pills ── */}
                <div className="flex flex-wrap gap-2">
                  {job.location && <InfoPill icon={MapPin} label="Location" value={job.location} color="#6366f1" />}
                  {job.department && <InfoPill icon={Layers} label="Department" value={job.department} color="#8b5cf6" />}
                  {job.employeeTypes?.length > 0 && <InfoPill icon={Users} label="Employment" value={job.employeeTypes.join(", ")} color="#10b981" />}
                  {(job.experienceMin != null || job.experienceMax != null) && <InfoPill icon={Clock} label="Experience" value={`${job.experienceMin}–${job.experienceMax} yrs`} color="#f59e0b" />}
                  {job.expiresOn && <InfoPill icon={CalendarX2} label="Expires" value={new Date(job.expiresOn).toLocaleDateString()} color="#ef4444" />}
                </div>

                {/* ── Skills ── */}
                {job.skills?.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      Required Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((s) => (
                        <span key={s} className="text-[11px] px-3 py-1 rounded-lg font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="h-px bg-gray-100" />

                {/* ── Job description ── */}
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Job Description
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap pl-3 border-l-2 border-indigo-100 italic">
                    {job.jobDescription}
                  </p>
                </div>

                <div className="h-px bg-gray-100" />

                {/* ── Cover letter / comments ── */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    <MessageSquare size={13} className="text-indigo-500" /> Comments (optional)
                  </label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Add any notes for the recruiter…"
                    rows={4}
                    className="w-full px-4 py-3 rounded-2xl text-sm text-gray-700 border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white transition-all duration-200 resize-none"
                  />
                </div>

                {/* ── Submit Button ── */}
                <button
                  type="submit"
                  disabled={submitting || applied}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold transition-all duration-200 relative overflow-hidden group"
                  style={{
                    background: applied
                      ? "#ecfdf5"
                      : submitting
                        ? "#eef2ff"
                        : "linear-gradient(135deg,#4f46e5,#7c3aed)",
                    color: applied ? "#059669" : submitting ? "#6366f1" : "white",
                    border: applied ? "1px solid #10b981" : submitting ? "1px solid #c7d2fe" : "none",
                    boxShadow: applied || submitting ? "none" : "0 4px 15px rgba(99,102,241,0.35)",
                    cursor: applied || submitting ? "not-allowed" : "pointer"
                  }}
                >
                  {applied ? (
                    <><CheckCircle2 size={18} /> Application Sent Successfully</>
                  ) : submitting ? (
                    <><Loader2 size={18} className="animate-spin" /> Submitting Application…</>
                  ) : (
                    <><Send size={16} /> Apply for this Position</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {success && <SuccessModal onClose={() => setSuccess(false)} />}
    </div>
  );
}