import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function TopEmployees() {
  const [vacancies, setVacancies] = useState([]);
  const [topEmployees, setTopEmployees] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingVacancy, setLoadingVacancy] = useState(null);

  // 🔹 Fetch all vacancies
  useEffect(() => {
    fetch("http://localhost:5000/api/hr/vacancies")
      .then(res => res.json())
      .then(data => setVacancies(data))
      .catch(err => console.error("Vacancy fetch error", err));
  }, []);

  // 🔹 Fetch top employees for vacancy
const fetchTopEmployees = async (vacancyId) => {
  try {
    setLoadingVacancy(vacancyId);

    const res = await fetch(
      `http://localhost:5000/api/vacancies/${vacancyId}/top-employees`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch top employees");
    }

    const data = await res.json(); // 👈 this IS the array

    setTopEmployees(prev => ({
      ...prev,
      [vacancyId]: data
    }));
  } catch (err) {
    console.error("Top employee fetch error", err);
  } finally {
    setLoadingVacancy(null);
  }
};


  return (
    <div className="flex bg-[#0b1020] min-h-screen text-gray-200">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className={`flex-1 ${sidebarOpen ? "ml-60" : "ml-0"}`}>
        <Topbar setSidebarOpen={setSidebarOpen} />

        <div className="px-8 pt-8 space-y-6">
          <h1 className="text-2xl font-semibold text-indigo-400">
            👥 Top Employees per Vacancy
          </h1>

          {vacancies.map(vac => (
            <div
              key={vac._id}
              className="bg-[#11162a] border border-white/10
                         rounded-2xl p-6 shadow-md"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">
                    {vac.title}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {vac.department}
                  </p>
                </div>

                <button
                  onClick={() => fetchTopEmployees(vac._id)}
                  className="px-4 py-2 text-sm rounded-lg
                             bg-indigo-600/20 border border-indigo-400/40
                             text-indigo-300 hover:bg-indigo-600/30"
                >
                  {loadingVacancy === vac._id
                    ? "Analyzing..."
                    : "View Top Employees"}
                </button>
              </div>

              {/* 🔽 TOP EMPLOYEES LIST */}
              {topEmployees[vac._id] && (
                <div className="mt-4 space-y-2">
                  {topEmployees[vac._id].map((emp, idx) => (
                    <div
                      key={emp.user._id}
                      className="flex justify-between text-sm
                                 bg-black/30 rounded-lg px-4 py-2"
                    >
                      <span>
                        {idx + 1}. {emp.user.name}  -   {emp.user.email}
                      </span>

                       


                      {/* <span className="text-green-400 font-semibold">
                        {emp.finalScore}% */}
                      {/* </span> */}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
