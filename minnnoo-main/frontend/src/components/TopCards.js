import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, MapPin, Users, ArrowRight } from "lucide-react";

export default function TopCards() {
  const [vacancies, setVacancies] = useState([]);
  const [appliedCounts, setAppliedCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch vacancies
    const fetchVacancies = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/hr/vacancies");
        const data = await res.json();
        setVacancies(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch vacancies", err);
      }
    };

    // Fetch applications count per vacancy
    const fetchCounts = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/applications/count-per-vacancy"
        );
        const data = await res.json();

        const countsMap = {};
        if (Array.isArray(data)) {
          data.forEach((item) => {
            countsMap[item._id] = item.appliedCount;
          });
        }

        setAppliedCounts(countsMap);
      } catch (err) {
        console.error("Failed to fetch application counts", err);
      }
    };

    fetchVacancies();
    fetchCounts();
  }, []);

  return (
    <div className="py-10 px-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex items-end justify-between border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
              All Jobs Overview
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Monitoring applications across {vacancies.length} active position{vacancies.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
            <div className="px-4 py-2 bg-blue-50 rounded-xl">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Total Pipeline</span>
              <span className="text-xl font-bold text-gray-800">
                {Object.values(appliedCounts).reduce((a, b) => a + b, 0)}
              </span>
            </div>
          </div>
        </div>

        {vacancies.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {vacancies.map((vac) => (
              <div
                key={vac._id}
                onClick={() => navigate(`/hr/vacancies/${vac._id}/candidates`)}
                className="group cursor-pointer bg-white p-6 rounded-2xl border border-gray-100 shadow-sm
                           hover:shadow-md hover:-translate-y-0.5
                           flex flex-col justify-between
                           transition-all duration-200"
              >
                <div className="mb-6 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                    <Users size={20} />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-gray-800 leading-tight group-hover:text-blue-600 transition">
                      {vac.title}
                    </h3>
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <Building2 size={11} className="text-blue-400" /> {vac.company}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <MapPin size={11} className="text-purple-400" /> {vac.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                  <div>
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest block">Applications</span>
                    <p className="text-lg font-bold text-gray-800">
                      {appliedCounts[vac._id] || 0}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-3xl border border-gray-100 border-dashed">
            <span className="text-4xl">📋</span>
            <p className="text-gray-400 text-sm italic">No vacancy data available.</p>
          </div>
        )}
      </div>
    </div>
  );
}