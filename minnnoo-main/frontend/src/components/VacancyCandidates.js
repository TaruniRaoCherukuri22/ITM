import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, CheckCircle2, XCircle, Clock, User, Mail, Phone, Briefcase, FileText, ExternalLink } from "lucide-react";

const HIGH_MATCH = 37;
const MEDIUM_MATCH = 34;

function getMatchLevel(ats, ai) {
  const score = ats ?? ai;
  if (score >= HIGH_MATCH) return { label: "HIGH", bg: "#ecfdf5", text: "#059669", border: "#a7f3d0", dot: "#10b981" };
  if (score >= MEDIUM_MATCH) return { label: "MEDIUM", bg: "#fffbeb", text: "#d97706", border: "#fde68a", dot: "#f59e0b" };
  return { label: "LOW", bg: "#fff1f2", text: "#e11d48", border: "#fecdd3", dot: "#f43f5e" };
}

function getStatusStyle(status) {
  if (status === "APPROVED") return { bg: "#ecfdf5", text: "#059669", border: "#a7f3d0", icon: <CheckCircle2 size={11} /> };
  if (status === "REJECTED") return { bg: "#fff1f2", text: "#e11d48", border: "#fecdd3", icon: <XCircle size={11} /> };
  return { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0", icon: <Clock size={11} /> };
}

/* ── Score ring ── */
function ScoreRing({ value, color, label }) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(Number(value) || 0, 0), 100);
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r={r} strokeWidth="5" stroke="#e2e8f0" fill="none" />
          <circle cx="30" cy="30" r={r} strokeWidth="5" fill="none"
            stroke={color} strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold"
          style={{ color }}>
          {value != null ? `${value}%` : "N/A"}
        </span>
      </div>
      <span className="text-[10px] text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}

const FILTERS = [
  { key: "ALL", label: "All", activeColor: "#2563eb", activeBg: "#eff6ff", activeBorder: "#bfdbfe" },
  { key: "APPROVED", label: "Approved", activeColor: "#059669", activeBg: "#ecfdf5", activeBorder: "#a7f3d0" },
  { key: "PENDING", label: "Pending", activeColor: "#d97706", activeBg: "#fffbeb", activeBorder: "#fde68a" },
  { key: "REJECTED", label: "Rejected", activeColor: "#e11d48", activeBg: "#fff1f2", activeBorder: "#fecdd3" },
];

export default function VacancyCandidates() {
  const { vacancyId } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  // Detail view state
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [fullProfile, setFullProfile] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, [vacancyId]);

  const fetchCandidates = () => {
    setLoading(true);
    fetch(`http://localhost:5000/api/hr/vacancies/${vacancyId}/candidates`)
      .then((r) => r.json())
      .then((d) => { setCandidates(d || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const fetchFullProfile = async (userId) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/auth/profile/${userId}`);
      const data = await res.json();
      setFullProfile(data);
    } catch (err) {
      console.error("Failed to fetch user profile", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSelectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    fetchFullProfile(candidate.userId);
  };

  const handleStatusUpdate = async (userId, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/hr/vacancies/${vacancyId}/candidates/${userId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        // Update local state
        setCandidates(prev => prev.map(c => c.userId === userId ? { ...c, status } : c));
        if (selectedCandidate && selectedCandidate.userId === userId) {
          setSelectedCandidate({ ...selectedCandidate, status });
        }
      }
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  const filtered = filter === "ALL"
    ? candidates
    : candidates.filter((c) => (c.status || "PENDING") === filter);

  const counts = {
    ALL: candidates.length,
    APPROVED: candidates.filter((c) => c.status === "APPROVED").length,
    PENDING: candidates.filter((c) => !c.status || c.status === "PENDING").length,
    REJECTED: candidates.filter((c) => c.status === "REJECTED").length,
  };

  return (
    <div className="flex-1 flex flex-col relative z-10 p-6 md:p-10">
      {/* Subtle bg shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle,#bfdbfe,transparent)" }} />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle,#ddd6fe,transparent)" }} />
      </div>

      <div className="space-y-7 relative z-10 max-w-7xl mx-auto w-full">

        {/* Detail View */}
        {selectedCandidate ? (
          <div className="animate-in fade-in duration-300">
            {/* Header / Nav */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => { setSelectedCandidate(null); setFullProfile(null); }}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500
                             hover:text-gray-800 border border-gray-200 bg-white px-3 py-2
                             rounded-xl hover:border-gray-300 transition-all duration-200 shadow-sm"
              >
                <ChevronLeft size={14} /> Back to List
              </button>
              <h2 className="text-xl font-bold text-gray-800">Recruitment Profile</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Basic Info & Profile */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
                  {detailLoading ? (
                    <div className="flex flex-col items-center py-10 space-y-4">
                      <div className="w-8 h-8 border-3 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
                      <p className="text-xs text-gray-400">Loading user data...</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                          style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
                          {(selectedCandidate.name || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{selectedCandidate.name}</h3>
                          <p className="text-sm text-gray-400 font-medium">{fullProfile?.designation || "Candidate"}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold border"
                          style={getStatusStyle(selectedCandidate.status).border === "#e2e8f0"
                            ? { background: "#f8fafc", color: "#64748b", borderColor: "#e2e8f0" }
                            : { background: getStatusStyle(selectedCandidate.status).bg, color: getStatusStyle(selectedCandidate.status).text, borderColor: getStatusStyle(selectedCandidate.status).border }}>
                          {selectedCandidate.status || "PENDING"}
                        </span>
                      </div>

                      <div className="h-px bg-gray-50" />

                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                            <Mail size={14} />
                          </div>
                          <span className="text-gray-600 truncate">{selectedCandidate.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                            <Phone size={14} />
                          </div>
                          <span className="text-gray-600">{fullProfile?.phone || "N/A"}</span>
                        </div>
                        {fullProfile?.resume && (
                          <a
                            href={`http://localhost:5000${fullProfile.resume}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3 text-sm group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-100 transition-colors">
                              <FileText size={14} />
                            </div>
                            <span className="text-emerald-600 font-medium flex items-center gap-1 group-hover:underline">
                              View Resume <ExternalLink size={12} />
                            </span>
                          </a>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 flex gap-3">
                  <button
                    onClick={() => handleStatusUpdate(selectedCandidate.userId, "APPROVED")}
                    disabled={selectedCandidate.status === "APPROVED"}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold
                                 bg-emerald-50 border border-emerald-100 text-emerald-600
                                 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <CheckCircle2 size={14} /> Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedCandidate.userId, "REJECTED")}
                    disabled={selectedCandidate.status === "REJECTED"}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold
                                 bg-red-50 border border-red-100 text-red-500
                                 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>

              {/* Right Columns: Analysis & Skills */}
              <div className="lg:col-span-2 space-y-6">
                {/* Scores View */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none">Analytics</h4>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold border"
                      style={{ background: getMatchLevel(selectedCandidate.atsScore, selectedCandidate.aiScore).bg, color: getMatchLevel(selectedCandidate.atsScore, selectedCandidate.aiScore).text, borderColor: getMatchLevel(selectedCandidate.atsScore, selectedCandidate.aiScore).border }}>
                      {getMatchLevel(selectedCandidate.atsScore, selectedCandidate.aiScore).label} MATCH
                    </span>
                  </div>

                  <div className="flex flex-wrap justify-around gap-8">
                    <ScoreRing value={selectedCandidate.atsScore} color="#3b82f6" label="ATS Score" />
                    <ScoreRing value={selectedCandidate.aiScore} color="#8b5cf6" label="AI Score" />
                  </div>
                </div>

                {/* Skills Analysis */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Skill Set</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Matches</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.matchedSkills?.length > 0 ? (
                          selectedCandidate.matchedSkills.map(s => (
                            <span key={s} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                              ✓ {s}
                            </span>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400 italic">None</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Missing</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.missingSkills?.length > 0 ? (
                          selectedCandidate.missingSkills.map(s => (
                            <span key={s} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-red-50 text-red-600 border border-red-100">
                              ✕ {s}
                            </span>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400 italic">None</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Summary */}
                {selectedCandidate.summary && (
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                      <Briefcase size={60} />
                    </div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      AI Evaluation
                    </h4>
                    <p className="text-gray-600 text-[13px] leading-relaxed relative z-10 font-medium italic">
                      {selectedCandidate.summary}
                    </p>
                    <div className="h-px bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-transparent" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            {/* Header / Nav */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-5">
                <button
                  onClick={() => navigate("/topcards")}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-500
                               hover:text-gray-800 border border-gray-200 bg-white px-4 py-2.5
                               rounded-2xl hover:border-gray-300 transition-all duration-200 shadow-sm"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 tracking-tight leading-none">
                    Applicants List
                  </h2>
                  <p className="text-gray-400 text-[11px] font-medium mt-1 uppercase tracking-widest">
                    ID: {vacancyId.slice(-8)}
                  </p>
                </div>
              </div>

              {/* Filter pills */}
              <div className="flex gap-2 p-1 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
                {FILTERS.map(({ key, label, activeColor, activeBg, activeBorder }) => {
                  const active = filter === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className="px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300"
                      style={active
                        ? { background: activeBg, borderColor: activeBorder, color: activeColor }
                        : { background: "transparent", borderColor: "transparent", color: "#9ca3af" }}
                    >
                      {label} <span className="ml-1.5 opacity-60 text-[10px]">{counts[key]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Area */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="w-10 h-10 border-4 border-blue-50/50 border-t-blue-500 rounded-full animate-spin shadow-inner" />
                <p className="text-gray-400 text-sm font-medium tracking-wide">Loading applicants...</p>
              </div>
            ) : !filtered.length ? (
              <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-40 grayscale">
                <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200 text-6xl shadow-inner">👤</div>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No entries found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((candidate) => {
                  const status = getStatusStyle(candidate.status);
                  const match = getMatchLevel(candidate.atsScore, candidate.aiScore);
                  return (
                    <div
                      key={candidate.userId}
                      onClick={() => handleSelectCandidate(candidate)}
                      className="group bg-white rounded-[2rem] border border-gray-100 shadow-sm p-5 space-y-5 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1.5 transition-all duration-500 cursor-pointer relative overflow-hidden"
                    >
                      {/* Top highlight bar */}
                      <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: match.dot }} />

                      <div className="flex items-start justify-between">
                        <div className="w-14 h-14 rounded-3xl flex items-center justify-center text-lg font-bold text-white shadow-xl group-hover:rotate-6 transition-all duration-500"
                          style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
                          {(candidate.name || "?")[0].toUpperCase()}
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-bold border"
                          style={status.border === "#e2e8f0"
                            ? { background: "#f8fafc", color: "#64748b", borderColor: "#e2e8f0" }
                            : { background: status.bg, color: status.text, borderColor: status.border }}>
                          {candidate.status || "PENDING"}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-black text-gray-800 group-hover:text-blue-600 transition-colors uppercase tracking-tighter leading-none">{candidate.name}</h3>
                        <p className="text-[11px] text-gray-400 truncate mt-1.5">{candidate.email}</p>
                      </div>

                      {/* <div className="pt-4 flex items-center justify-between border-t border-gray-50">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-extrabold text-gray-300 uppercase tracking-tighter mb-0.5">ATS</span>
                          <span className="text-sm font-black text-blue-600 leading-none">{candidate.atsScore}%</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-extrabold text-gray-300 uppercase tracking-tighter mb-0.5">AI</span>
                          <span className="text-sm font-black text-purple-600 leading-none">{candidate.aiScore}%</span>
                        </div>
                      </div> */}

                      <div className="flex items-center justify-center pt-1">
                        <span className="text-[10px] font-bold text-blue-500/0 group-hover:text-blue-500 transition-all duration-500 underline decoration-2 underline-offset-4">
                          View Analysis
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}