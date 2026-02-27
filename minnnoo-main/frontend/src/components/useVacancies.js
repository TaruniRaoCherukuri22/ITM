import { useEffect, useState } from "react";

export default function useVacancies() {
  const [vacancies, setVacancies] = useState([]);

  const fetchVacancies = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/hr/vacancies");
      const data = await res.json();
      setVacancies(Array.isArray(data) ? data : []);
    } catch {
      setVacancies([]);
    }
  };

  const deleteVacancy = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vacancy?")) return;

    const res = await fetch(
      `http://localhost:5000/api/hr/vacancies/${id}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      setVacancies((prev) => prev.filter((v) => v._id !== id));
    }
  };

  useEffect(() => {
    fetchVacancies();
  }, []);

  return { vacancies, deleteVacancy };
}
