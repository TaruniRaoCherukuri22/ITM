import { useEffect, useState } from "react";
import { Bell, BellOff, ChevronDown, Trophy, Star } from "lucide-react";

/* ── Rank medal colours ── */
const RANK_STYLE = [
  { bg: "#fffbeb", border: "#fde68a", text: "#d97706", label: "🥇" },
  { bg: "#f8fafc", border: "#e2e8f0", text: "#64748b", label: "🥈" },
  { bg: "#fff7ed", border: "#fed7aa", text: "#c2410c", label: "🥉" },
];

/* ── Toast ── */
function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl
                    bg-white border border-emerald-200 shadow-xl text-sm font-medium text-emerald-700">
      <Bell size={15} color="#059669" /> {msg}
    </div>
  );
}

export default function TopEmployeesHR() {
  const [vacancies, setVacancies] = useState([]);
  const [selectedVacancy, setSelectedVacancy] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notified, setNotified] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/hr/vacancies")
      .then((r) => r.json())
      .then((d) => setVacancies(Array.isArray(d) ? d : []));
  }, []);

  const fetchTopEmployees = async (vacancyId) => {
    if (!vacancyId) return;
    setSelectedVacancy(vacancyId);
    setLoading(true);
    setEmployees([]);
    setNotified([]);
    try {
      const res = await fetch(`http://localhost:5000/api/vacancies/${vacancyId}/top-employees`);
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const notifyEmployee = async (userId, name) => {
    try {
      await fetch("http://localhost:5000/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, vacancyId: selectedVacancy }),
      });
      setNotified((p) => [...p, userId]);
      setToast(`Notification sent to ${name}!`);
    } catch (err) {
      console.error("Notification failed", err);
    }
  };

  return (
    <div className="py-12 space-y-8">
      {/* Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle,#bfdbfe,transparent)" }} />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle,#ddd6fe,transparent)" }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 4px 14px rgba(245,158,11,0.3)" }}>
              <Trophy size={18} color="#fff" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Top Employees</h2>
              <p className="text-gray-400 text-xs">Best matching candidates for a vacancy</p>
            </div>
          </div>

          {/* Selector */}
          <div className="relative w-64">
            <select
              value={selectedVacancy}
              onChange={(e) => fetchTopEmployees(e.target.value)}
              className="w-full px-4 py-2.5 pr-9 rounded-xl text-sm text-gray-700
                         bg-white border border-gray-200 shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400
                         appearance-none transition"
            >
              <option value="">Select Vacancy…</option>
              {vacancies.map((v) => (
                <option key={v._id} value={v._id}>{v.title}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-gray-200" />

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading top employees…</p>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && selectedVacancy && employees.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-50">
            <Star size={36} color="#d1d5db" />
            <p className="text-gray-400 text-sm italic">No ranked employees found.</p>
          </div>
        )}

        {/* ── Cards grid ── */}
        {!loading && employees.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {employees.map((e, index) => {
              const isNotified = notified.includes(e.user._id);
              const rank = RANK_STYLE[index] || { bg: "#fff", border: "#e2e8f0", text: "#6b7280", label: `#${index + 1}` };

              return (
                <div
                  key={e.user._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm
                             hover:shadow-md hover:-translate-y-0.5 flex flex-col
                             transition-all duration-300 overflow-hidden"
                >
                  {/* Rank stripe */}
                  <div className="flex items-center justify-between px-5 pt-4 pb-3"
                    style={{ background: rank.bg, borderBottom: `1px solid ${rank.border}` }}>
                    <span className="text-xs font-bold" style={{ color: rank.text }}>
                      Rank {rank.label}
                    </span>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border"
                      style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb" }}>
                      TOP MATCH
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-1 gap-4">
                    {/* Name + initials */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
                        {(e.user.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800">{e.user.name}</h3>
                        <p className="text-[11px] text-gray-400">{e.user.email || ""}</p>
                      </div>
                    </div>

                    {/* Scores */}
                    <div className="flex gap-2 flex-wrap">
                      <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full
                                       bg-emerald-50 border border-emerald-200 text-emerald-700">
                        ATS: {e.atsScore}%
                      </span>
                      {e.aiScore != null && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full
                                         bg-violet-50 border border-violet-200 text-violet-700">
                          AI: {e.aiScore}%
                        </span>
                      )}
                    </div>

                    {/* Notify button */}
                    <button
                      onClick={() => notifyEmployee(e.user._id, e.user.name)}
                      disabled={isNotified}
                      className={`mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                                  text-xs font-semibold border transition-all duration-200
                                  ${isNotified
                          ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300"}`}
                    >
                      {isNotified
                        ? <><BellOff size={13} /> Notified</>
                        : <><Bell size={13} /> Notify to Apply</>
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}