import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import SuccessModal from "../components/SuccessModal";
import {
  ChevronLeft, Briefcase, Building2, MapPin,
  Users, Layers, Clock, CalendarX2, FileText,
  Send, AlertCircle,
} from "lucide-react";

const LOCATIONS = [
  "Hyderabad, India", "Mumbai, India", "Gurgaon, India",
  "New Delhi, India", "Bengaluru, India", "Singapore",
  "Dubai, UAE", "Kuala Lumpur, Malaysia", "Jakarta, Indonesia",
  "Ho Chi Minh City, Vietnam", "San Mateo, California, USA",
];
const EMP_TYPES = ["Full Time", "Intern", "Contract", "Part Time"];
const COMPANIES = [
  "Darwinbox Digital Solutions Pvt Ltd",
  "PT Darwinbox Digital Solutions",
];

/* ── Section label ── */
function Label({ icon: Icon, text, color = "#2563eb" }) {
  return (
    <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
      <Icon size={12} color={color} /> {text}
    </label>
  );
}

const inputCls = `w-full px-4 py-2.5 rounded-xl text-sm text-gray-800
  border border-gray-200 bg-white
  focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400
  placeholder-gray-400 transition-all duration-200`;

export default function CreateJob() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { id } = useParams(); // ✅ Detect if editing
  const isEdit = !!id;

  const defaultDept = params.get("department");

  const [title, setJobTitle] = useState("");
  const [company, setCompany] = useState(COMPANIES[0]);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [employeeTypes, setTypes] = useState([]);
  const [jobDescription, setDesc] = useState("");
  const [department, setDept] = useState(defaultDept || "");
  const [expiresOn, setExpires] = useState("");
  const [experienceMin, setExpMin] = useState(0);
  const [experienceMax, setExpMax] = useState(5);
  const [l1Department, setL1] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch vacancy data if editing
  useEffect(() => {
    if (isEdit) {
      fetch(`http://localhost:5000/api/hr/vacancies/${id}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch vacancy details");
          return res.json();
        })
        .then(data => {
          if (data) {
            setJobTitle(data.title || "");
            setCompany(data.company || COMPANIES[0]);
            setLocation(data.location || LOCATIONS[0]);
            setTypes(data.employeeTypes || []);
            setDesc(data.jobDescription || "");
            setDept(data.department || "");
            setL1(data.l1Department || "");
            setExpMin(data.experienceMin || 0);
            setExpMax(data.experienceMax || 5);
            if (data.expiresOn) {
              setExpires(data.expiresOn.split("T")[0]);
            }
          }
        })
        .catch(err => {
          console.error("Failed to fetch vacancy", err);
          setError("Could not load vacancy details. Please check your connection.");
        });
    }
  }, [id, isEdit]);

  const today = new Date().toISOString().split("T")[0];

  const toggleType = (t) =>
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const url = isEdit
      ? `http://localhost:5000/api/hr/vacancies/${id}`
      : "http://localhost:5000/api/hr/vacancies";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, company, location, employeeTypes, department,
          l1Department, jobDescription, experienceMin, experienceMax, expiresOn,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save vacancy");
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to save job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1">
      {/* ── Main Content ── */}
      <main
        className="min-h-screen flex flex-col items-center pb-16 px-4"
        style={{ background: "linear-gradient(135deg,#f8fafc 0%,#f1f5f9 60%,#e0f2fe 100%)" }}
      >
        <div className="w-full max-w-2xl py-10">
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400
                       hover:text-blue-600 transition-colors mb-4 uppercase tracking-widest"
          >
            <ChevronLeft size={14} /> Back to Dashboard
          </button>

          <h1 className="text-3xl font-black text-gray-800 tracking-tight">
            {isEdit ? "Edit Vacancy" : "Create Job Vacancy"}
          </h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">
            {isEdit
              ? "Update the details and requirements for this position."
              : "Fill in the details below to publish a new job opportunity."}
          </p>
        </div>

        <form
          onSubmit={submit}
          className="w-full max-w-2xl space-y-6"
        >
          {/* ── Card wrapper ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-7">

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm
                              bg-red-50 border border-red-100 text-red-600">
                <AlertCircle size={15} /> {error}
              </div>
            )}

            {/* Job Title */}
            <div>
              <Label icon={Briefcase} text="Job Title" color="#2563eb" />
              <input value={title} onChange={(e) => setJobTitle(e.target.value)}
                required placeholder="e.g. Senior Frontend Engineer" className={inputCls} />
            </div>

            {/* Company */}
            <div>
              <Label icon={Building2} text="Company Name" color="#059669" />
              <div className="flex flex-col sm:flex-row gap-3">
                {COMPANIES.map((c) => (
                  <label
                    key={c}
                    className={`flex items-center gap-2.5 flex-1 px-4 py-3 rounded-xl border cursor-pointer
                                text-sm transition-all duration-200
                                ${company === c
                        ? "bg-blue-50 border-blue-300 text-blue-700"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-200"}`}
                  >
                    <input type="radio" checked={company === c} onChange={() => setCompany(c)}
                      className="accent-blue-600" />
                    {c}
                  </label>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <Label icon={MapPin} text="Location" color="#0891b2" />
              <select value={location} onChange={(e) => setLocation(e.target.value)}
                className={inputCls}>
                {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>

            {/* Employee Types */}
            <div>
              <Label icon={Users} text="Employee Type" color="#7c3aed" />
              <div className="flex flex-wrap gap-2">
                {EMP_TYPES.map((t) => (
                  <button
                    type="button" key={t} onClick={() => toggleType(t)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200
                      ${employeeTypes.includes(t)
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-gray-50 text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Department */}
            <div>
              <Label icon={Layers} text="Department" color="#d97706" />
              <input
                value={department}
                onChange={(e) => setDept(e.target.value)}
                placeholder="e.g. HR, Sales, IT"
                className={inputCls}
              />
            </div>

            {/* Experience */}
            <div>
              <Label icon={Clock} text="Experience Range (Years)" color="#059669" />
              <div className="flex gap-3">
                <div className="flex-1">
                  <input type="number" value={experienceMin} min={0}
                    onChange={(e) => setExpMin(e.target.value)}
                    placeholder="Min" required className={inputCls} />
                  <p className="text-[10px] text-gray-400 mt-1 ml-1">Minimum</p>
                </div>
                <div className="flex-1">
                  <input type="number" value={experienceMax} min={0}
                    onChange={(e) => setExpMax(e.target.value)}
                    placeholder="Max" required className={inputCls} />
                  <p className="text-[10px] text-gray-400 mt-1 ml-1">Maximum</p>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <Label icon={FileText} text="Job Description" color="#e11d48" />
              <textarea
                value={jobDescription}
                onChange={(e) => setDesc(e.target.value)}
                rows={6} required
                placeholder="Enter job responsibilities, requirements, skills…"
                className={`${inputCls} resize-none`}
              />
            </div>

            {/* L1 Department */}
            <div>
              <Label icon={Layers} text="L1 Department" color="#7c3aed" />
              <input value={l1Department} onChange={(e) => setL1(e.target.value)}
                placeholder="e.g. Engineering" className={inputCls} />
            </div>

            {/* Expiry */}
            <div>
              <Label icon={CalendarX2} text="Expires On" color="#f43f5e" />
              <input type="date" value={expiresOn} min={today}
                onChange={(e) => setExpires(e.target.value)}
                required className={inputCls} />
            </div>

          </div>

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl
                       text-sm font-bold text-white transition-all duration-200
                       disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg,#2563eb,#7c3aed)",
              boxShadow: "0 4px 18px rgba(99,102,241,0.3)",
            }}
          >
            <Send size={15} />
            {submitting
              ? (isEdit ? "Updating…" : "Publishing…")
              : (isEdit ? "Update Vacancy" : "Publish Job")}
          </button>

        </form>
      </main>

      {success && (
        <SuccessModal onClose={() => { setSuccess(false); navigate("/home"); }} />
      )}
    </div>
  );
}