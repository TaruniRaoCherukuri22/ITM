import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Building2, MapPin, Edit2, Trash2 } from "lucide-react";

function ConfirmModal({ title, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/10 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Delete</h3>
        <p className="text-gray-500 text-sm mb-6">
          Are you sure you want to remove <span className="font-semibold">{title}</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-gray-400 bg-gray-50 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-red-500 hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Vacancies() {
  const [vacancies, setVacancies] = useState([]);
  const [confirmId, setConfirmId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVacancies();
  }, []);

  const fetchVacancies = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/hr/vacancies");
      const data = await res.json();
      setVacancies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/hr/vacancies/${confirmId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setVacancies(vacancies.filter((v) => v._id !== confirmId));
        setConfirmId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmVac = vacancies.find((v) => v._id === confirmId);

  return (
    <div className="pb-12 px-6">
      {/* Subtle blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle,#bfdbfe,transparent)" }} />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle,#ddd6fe,transparent)" }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
              Available Vacancies
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {vacancies.length} active posting{vacancies.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => navigate("/create-job")}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-all shadow-sm"
          >
            Post New Job
          </button>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-gray-200" />

        {/* ── Grid ── */}
        {vacancies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {vacancies.map((vac) => (
              <div
                key={vac._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm
                           hover:shadow-md hover:-translate-y-0.5
                           flex flex-col justify-between p-5
                           transition-all duration-200"
              >
                {/* Top info */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-800 leading-snug">
                    {vac.title}
                  </h3>
                  <div className="flex flex-col gap-1">
                    {vac.company && (
                      <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <Building2 size={11} /> {vac.company}
                      </span>
                    )}
                    {vac.location && (
                      <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <MapPin size={11} /> {vac.location}
                      </span>
                    )}
                  </div>
                  {vac.department && (
                    <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-medium
                                     bg-violet-50 border border-violet-200 text-violet-600">
                      {vac.department}
                    </span>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 my-4" />

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/edit-job/${vac._id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold
                               bg-blue-50 border border-blue-100 text-blue-600
                               hover:bg-blue-100 hover:border-blue-200 transition-all duration-200"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => setConfirmId(vac._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold
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
          <div className="flex flex-col items-center justify-center py-24 gap-3 opacity-50">
            <span className="text-5xl">📋</span>
            <p className="text-gray-400 text-sm italic">No vacancies posted yet.</p>
          </div>
        )}
      </div>

      {/* Confirm modal */}
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