import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import TopCards from "../components/TopCards";
import {
  Server, Banknote, Bot, UserPlus, TrendingUp,
  Megaphone, Trophy, Clock, Building2, MapPin, Trash2, Edit2,
} from "lucide-react";

const modules = [
  { name: "Platform", Icon: Server, color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  { name: "Payroll", Icon: Banknote, color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
  { name: "AI", Icon: Bot, color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  { name: "Recruitment", Icon: UserPlus, color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  { name: "Sales", Icon: TrendingUp, color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" },
  { name: "Marketing", Icon: Megaphone, color: "#e11d48", bg: "#fff1f2", border: "#fecdd3" },
  { name: "Performance", Icon: Trophy, color: "#ca8a04", bg: "#fefce8", border: "#fef08a" },
  { name: "Time Management", Icon: Clock, color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
];

/* ── Confirm delete modal ─────────────────────────── */
function ConfirmModal({ title, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(6px)" }}>
      <div className="bg-white rounded-2xl p-7 w-80 text-center shadow-2xl border border-red-100 space-y-4">
        <div className="text-4xl">🗑️</div>
        <p className="text-gray-800 font-semibold">Delete Vacancy?</p>
        <p className="text-gray-500 text-sm">
          "<span className="text-red-500 font-medium">{title}</span>" will be permanently removed.
        </p>
        <div className="flex gap-3 pt-1">
          <button onClick={onCancel}
            className="flex-1 py-2 rounded-xl text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2 rounded-xl text-sm bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [vacancies, setVacancies] = useState([]);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/hr/vacancies")
      .then((res) => res.json())
      .then((data) => setVacancies(Array.isArray(data) ? data : []))
      .catch(() => setVacancies([]));
  }, []);

  const handleDelete = async () => {
    if (!confirmId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/hr/vacancies/${confirmId}`, { method: "DELETE" });
      if (res.ok) setVacancies((prev) => prev.filter((v) => v._id !== confirmId));
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setConfirmId(null);
    }
  };

  const confirmVac = vacancies.find((v) => v._id === confirmId);

  return (
    <div className="flex-1 flex flex-col relative z-10">
      <div className="pb-24 space-y-14">

        {/* ── Top stats ── */}
        {/* <TopCards /> */}

        {/* ── Post a Job heading ── */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-800">
            Post a Job
          </h1>
          <p className="text-gray-400 text-sm">Choose a department module to create a new vacancy</p>
        </div>

        {/* ── Module grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {modules.map(({ name, Icon, color, bg, border }) => (
            <button
              key={name}
              onClick={() => navigate(`/create-job?department=${encodeURIComponent(name)}`)}
              className="group rounded-2xl p-5 flex flex-col items-center gap-4 text-left
                           border shadow-sm hover:shadow-md hover:-translate-y-1
                           transition-all duration-300 bg-white"
              style={{ borderColor: border }}
            >
              <div
                className="w-13 h-13 w-14 h-14 rounded-2xl flex items-center justify-center
                              transition-transform duration-300 group-hover:scale-110"
                style={{ background: bg, border: `1.5px solid ${border}` }}
              >
                <Icon size={24} color={color} strokeWidth={1.8} />
              </div>
              <span className="text-sm font-semibold text-center leading-tight" style={{ color }}>
                {name}
              </span>
            </button>
          ))}
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        {/* ── Existing Vacancies ── */}
        <div className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-800">
              Existing Vacancies
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">
              {vacancies.length} active posting{vacancies.length !== 1 ? "s" : ""}
            </p>
          </div>

          {vacancies.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vacancies.map((vac) => (
                <div
                  key={vac._id}
                  className="group bg-white rounded-2xl px-5 py-4 border border-gray-100
                               shadow-sm hover:shadow-md hover:-translate-y-0.5
                               flex items-center justify-between gap-4 transition-all duration-200"
                >
                  {/* Left: info — click to view candidates */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => navigate(`/vacancies/${vac._id}/candidates`)}
                  >
                    <h3 className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600 transition">
                      {vac.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {vac.company && (
                        <span className="flex items-center gap-1 text-[11px] text-gray-400">
                          <Building2 size={11} /> {vac.company}
                        </span>
                      )}
                      {vac.location && (
                        <span className="flex items-center gap-1 text-[11px] text-gray-400">
                          <MapPin size={11} /> {vac.location}
                        </span>
                      )}
                      {vac.department && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium
                                           bg-violet-50 border border-violet-200 text-violet-600">
                          {vac.department}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Edit button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/edit-job/${vac._id}`);
                      }}
                      className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-xl font-medium
                                   bg-blue-50 border border-blue-100 text-blue-600
                                   hover:bg-blue-100 hover:border-blue-200 transition-all duration-200"
                    >
                      <Edit2 size={12} /> Edit
                    </button>

                    {/* Right: delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmId(vac._id);
                      }}
                      className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-xl font-medium
                                   bg-red-50 border border-red-100 text-red-500
                                   hover:bg-red-100 hover:border-red-200 transition-all duration-200"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-50">
              <span className="text-5xl">📋</span>
              <p className="text-gray-400 text-sm italic">No vacancies posted yet.</p>
            </div>
          )}
        </div>

      </div>

      {confirmId && (
        <ConfirmModal
          title={confirmVac?.title || "this vacancy"}
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}