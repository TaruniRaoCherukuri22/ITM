import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

/* -------- SAFE USER ID -------- */
const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?._id || user?.id || null;
  } catch {
    return null;
  }
};

export default function Recruitment() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiLoadingJobId, setAiLoadingJobId] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);

  const userId = getUserId();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const matchedOnly = params.get("matched") === "true";

  /* ================= FETCH APPLIED JOBS ================= */
  useEffect(() => {
    if (!userId) return;

    const fetchAppliedJobs = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/applications/user/${userId}`
        );
        const data = await res.json();
        setAppliedJobs(data.map(a => a.vacancyId));
      } catch (err) {
        console.error("Failed to fetch applied jobs", err);
      }
    };

    fetchAppliedJobs();
  }, [userId]);

  /* ================= FETCH VACANCIES ================= */
  const fetchVacancies = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/hr/vacancies");
      const data = await res.json();

      const enriched = data.map(v => {
        const scoreObj = v.atsScores?.find(
          s => String(s.userId) === String(userId)
        );
        return { ...v, atsScore: scoreObj || null };
      });

      setVacancies(enriched);
    } catch (err) {
      console.error(err);
      setError("Failed to load vacancies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchVacancies();
  }, [userId]);

  /* ================= AI SCORE ================= */
  const handleCheckAIScore = async (vacancyId) => {
    try {
      setAiLoadingJobId(vacancyId);

      await fetch("http://localhost:5000/api/ai/analyze-one", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, vacancyId })
      });

      await fetchVacancies();
    } catch (err) {
      console.error(err);
      alert("AI analysis failed");
    } finally {
      setAiLoadingJobId(null);
    }
  };

  /* ================= GROUP BY DEPARTMENT ================= */
  const filteredVacancies = vacancies.filter(v =>
    matchedOnly ? v.atsScore?.score >= 37 : true
  );

  const groupedByDepartment = filteredVacancies.reduce((acc, vac) => {
    const dept = vac.department || "Other";
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(vac);
    return acc;
  }, {});

  if (loading) return <div className="pt-24 text-center text-gray-500">Loading vacancies...</div>;
  if (error) return <div className="pt-24 text-center text-red-500">{error}</div>;

  /* ================= UI ================= */
  return (
    <div className="flex bg-gray-50 min-h-screen text-gray-800">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "ml-60" : "ml-0"}`}>
        <Topbar setSidebarOpen={setSidebarOpen} />

        <div className="px-8 pt-8 pb-16">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-800">
                {matchedOnly ? "🎯 Matched Jobs for You" : "Recruitment"}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Explore and apply for the latest opportunities
              </p>
            </div>
          </div>

          {/* JOB LIST */}
          <div className="space-y-12">
            {Object.entries(groupedByDepartment).length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-gray-500">No vacancies found.</p>
              </div>
            ) : (
              Object.entries(groupedByDepartment).map(([department, jobs]) => (
                <div key={department} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-indigo-600 uppercase tracking-wider">
                      {department}
                    </h3>
                    <div className="flex-1 h-px bg-indigo-100" />
                    <span className="text-xs font-semibold text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {jobs.length} Jobs
                    </span>
                  </div>

                  <div className="grid gap-6">
                    {jobs
                      .sort((a, b) => (b.atsScore?.score || 0) - (a.atsScore?.score || 0))
                      .map(vac => {
                        const aiScoreForUser = vac.aiScores?.find(
                          s => String(s.userId) === String(userId)
                        );

                        return (
                          <div
                            key={vac._id}
                            className="group relative bg-white border border-gray-200
                                       rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
                          >
                            {/* ATS BADGE */}
                          {vac.atsScore && (
  <span
    className={`absolute top-6 right-6 px-3 py-1
      text-[10px] font-bold uppercase tracking-widest rounded-full
      ${
        vac.atsScore.score >= 37
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : vac.atsScore.score >= 35
          ? "bg-amber-50 text-amber-700 border border-amber-200"
          : "bg-rose-50 text-rose-700 border border-rose-200"
      }`}
  >
    {vac.atsScore.score >= 37
      ? "High Match"
      : vac.atsScore.score >= 35
      ? "Partial Match"
      : "Low Match"}
  </span>
)}
                            <div className="max-w-3xl">
                              <h3 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                                {vac.title}
                              </h3>
                              <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                                {vac.jobDescription}
                              </p>
                            </div>

                            {/* ACTIONS */}
                            <div className="mt-6 flex flex-wrap gap-3">
                              <button
                                onClick={() => handleCheckAIScore(vac._id)}
                                disabled={aiLoadingJobId === vac._id}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                                         bg-indigo-50 text-indigo-600 border border-indigo-100
                                         hover:bg-indigo-100 transition-all duration-200 disabled:opacity-50"
                              >
                                {aiLoadingJobId === vac._id ? (
                                  <><span className="animate-spin text-lg">🤖</span> Analyzing...</>
                                ) : "🤖 Check AI Match"}
                              </button>

                              <button
                                onClick={() => navigate(`/apply/${vac._id}`)}
                                disabled={appliedJobs.includes(vac._id)}
                                className={`px-5 py-2 rounded-xl text-sm font-bold shadow-sm transition-all duration-200
                                  ${appliedJobs.includes(vac._id)
                                    ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                                    : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-indigo-200"
                                  }`}
                              >
                                {appliedJobs.includes(vac._id) ? "Applied" : "Apply Now"}
                              </button>
                            </div>

                            {/* AI SCORE ANALYSIS */}
                            {aiScoreForUser && (
                              <div className="mt-6 bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                                      <span className="text-lg">🤖</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-800">AI Match Analysis</p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-semibold text-gray-400">Match Score:</span>
                                    <span className={`text-sm font-black ${aiScoreForUser.score >= 80 ? "text-emerald-600" :
                                        aiScoreForUser.score >= 50 ? "text-amber-600" : "text-rose-600"
                                      }`}>
                                      {aiScoreForUser.score}%
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {aiScoreForUser.matchedSkills?.length > 0 && (
                                    <div className="space-y-1.5">
                                      <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">Matched Skills</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {aiScoreForUser.matchedSkills.map(skill => (
                                          <span key={skill} className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                                            {skill}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {aiScoreForUser.missingSkills?.length > 0 && (
                                    <div className="space-y-1.5">
                                      <p className="text-[11px] font-bold text-rose-700 uppercase tracking-widest">Missing Skills</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {aiScoreForUser.missingSkills.map(skill => (
                                          <span key={skill} className="text-[10px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100">
                                            {skill}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {aiScoreForUser.summary && (
                                  <div className="pt-2 border-t border-gray-200">
                                    <p className="text-xs text-gray-500 leading-relaxed italic">
                                      "{aiScoreForUser.summary}"
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}