import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useVacancies from "./useVacancies";
import {
  Users,
  Briefcase,
  LayoutDashboard,
  TrendingUp,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  ChevronRight,
  Activity,
  Award,
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler
);

const COLORS = [
  "#6366F1", // Indigo
  "#0EA5E9", // Sky
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
];

/* -------------------- Components -------------------- */

const GlassCard = ({ children, className = "", hover = true }) => (
  <motion.div
    whileHover={hover ? { y: -4, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.08)" } : {}}
    className={`relative overflow-hidden bg-white border border-gray-100 rounded-[32px] p-7 shadow-sm ${className}`}
  >
    {children}
  </motion.div>
);

const KPICard = ({ title, value, icon: Icon, gradient, percentage }) => (
  <GlassCard className="flex flex-col justify-between h-full group">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg shadow-indigo-200/50 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      {percentage && (
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-50 text-indigo-600 border border-indigo-50 tracking-wider">
          {percentage}
        </span>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-gray-400 text-[11px] font-extrabold tracking-widest uppercase">
        {title}
      </p>
      <h3 className="text-3xl font-black text-gray-800 tracking-tight">
        {value}
      </h3>
    </div>
    {/* Decorative background element */}
    <div className={`absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br ${gradient} opacity-[0.03] blur-2xl rounded-full group-hover:opacity-[0.08] transition-opacity`} />
  </GlassCard>
);

const SkeletonCard = () => (
  <div className="bg-white border border-gray-100 rounded-[32px] p-8 h-[180px] animate-pulse">
    <div className="flex justify-between items-start mb-8">
      <div className="w-12 h-12 bg-gray-50 rounded-2xl" />
      <div className="w-16 h-6 bg-gray-50 rounded-full" />
    </div>
    <div className="space-y-3">
      <div className="w-24 h-3 bg-gray-50 rounded-full" />
      <div className="w-32 h-8 bg-gray-50 rounded-xl" />
    </div>
  </div>
);

export default function Analytics() {
  const { vacancies, loading } = useVacancies();
  const navigate = useNavigate();

  /* -------------------- Animated Counter -------------------- */
  function useAnimatedNumber(target, duration = 1500) {
    const [value, setValue] = useState(0);

    useEffect(() => {
      let start = null;
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setValue(Math.floor(easeOutQuart * target));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, [target, duration]);

    return value;
  }

  /* -------------------- Stats Logic -------------------- */
  const stats = useMemo(() => {
    const map = {};
    (vacancies || []).forEach((v) => {
      const dept =
        v.department ||
        v.departmentName ||
        v.department_type ||
        v.department?.name ||
        "Other";
      map[dept] = (map[dept] || 0) + 1;
    });

    const labels = Object.keys(map);
    const counts = labels.map((l) => map[l]);
    const total = counts.reduce((a, b) => a + b, 0);

    let mostActiveLabel = "-";
    let mostActiveCount = 0;
    if (labels.length) {
      const idx = counts.indexOf(Math.max(...counts));
      mostActiveLabel = labels[idx];
      mostActiveCount = counts[idx];
    }

    const percentage = total > 0 ? Math.round((mostActiveCount / total) * 100) : 0;

    return { labels, counts, total, mostActiveLabel, mostActiveCount, percentage };
  }, [vacancies]);

  const totalAnimated = useAnimatedNumber(stats.total);

  /* -------------------- ATS Jobs Analysis -------------------- */
  const jobsAvg = useMemo(() => {
    if (!vacancies?.length) return { labels: [], avgs: [], raw: [] };

    const arr = vacancies.map((v) => {
      const scores = (v.atsScores || []).map((s) =>
        typeof s.score === "number" ? s.score : Number(s.score || 0)
      );
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      return { id: v._id, title: v.title || "Untitled", avg };
    });

    arr.sort((a, b) => b.avg - a.avg);
    const top = arr.slice(0, 8);

    return {
      labels: top.map((t) => (t.title.length > 20 ? t.title.slice(0, 17) + "..." : t.title)),
      avgs: top.map((t) => Math.round((t.avg + Number.EPSILON) * 10) / 10),
      raw: top,
    };
  }, [vacancies]);

  /* -------------------- Chart Configurations -------------------- */
  const pieData = {
    labels: stats.labels,
    datasets: [
      {
        data: stats.counts,
        backgroundColor: COLORS,
        borderColor: "#ffffff",
        borderWidth: 6,
        hoverOffset: 12,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          padding: 30,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 11, weight: '600', family: 'Inter' }
        }
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#1e293b',
        bodyColor: '#64748b',
        borderColor: '#f1f5f9',
        borderWidth: 2,
        padding: 16,
        cornerRadius: 16,
        displayColors: true,
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
        bodyFont: { weight: '600' }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { size: 11, weight: '600' } }
      },
      y: {
        beginAtZero: true,
        grid: { color: "#f8fafc" },
        ticks: { color: "#94a3b8", font: { size: 11, weight: '600' }, stepSize: 1 }
      },
    },
  };

  const barData = {
    labels: stats.labels,
    datasets: [
      {
        label: "Vacancies",
        data: stats.counts,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, '#6366F115');
          gradient.addColorStop(1, '#6366F1');
          return gradient;
        },
        borderRadius: 12,
        barThickness: 32,
      },
    ],
  };

  const atsBarData = {
    labels: jobsAvg.labels,
    datasets: [
      {
        label: "Avg Score",
        data: jobsAvg.avgs,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, '#0EA5E915');
          gradient.addColorStop(1, '#0EA5E9');
          return gradient;
        },
        borderRadius: 12,
        barThickness: 40,
      },
    ],
  };

  const exportCSV = () => {
    const rows = [["Job Title", "Avg ATS"]].concat(jobsAvg.raw.map((r) => [r.title, r.avg]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "intelligence_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-8 pb-16 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2.5 mb-2.5"
          >
            <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100">
              <Activity className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="text-indigo-600 font-black tracking-widest text-[10px] uppercase">Talent Intelligence</span>
          </motion.div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">
            Recruitment <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500">Analytics</span>
          </h1>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={exportCSV}
          className="flex items-center gap-2.5 bg-white text-gray-700 px-6 py-3 rounded-2xl text-[13px] font-bold border border-gray-200 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md self-start md:self-center"
        >
          <Download className="w-4 h-4 text-indigo-500" />
          Download Report
        </motion.button>
      </div>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <AnimatePresence mode="wait">
          {loading ? (
            [1, 2, 3].map((i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <KPICard
                title="Active Vacancies"
                value={totalAnimated}
                icon={Briefcase}
                gradient="from-indigo-600 to-indigo-400"
              />
              <KPICard
                title="Most Demanding Module"
                value={stats.mostActiveLabel}
                percentage={`${stats.percentage}% growth`}
                icon={TrendingUp}
                gradient="from-emerald-500 to-emerald-400"
              />
              <KPICard
                title="Engaged Modules"
                value={stats.labels.length}
                icon={LayoutDashboard}
                gradient="from-amber-500 to-amber-400"
              />
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Main Charts Area */}
      <div className="grid lg:grid-cols-5 gap-8 mb-12">
        {/* Department Distribution Chart */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <PieChartIcon className="w-5 h-5 text-indigo-500" />
            </div>
            <h3 className="text-lg font-black text-gray-800">Module Split</h3>
          </div>
          <div className="h-[360px] relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
            ) : (
              <Pie data={pieData} options={chartOptions} />
            )}
          </div>
        </GlassCard>

        {/* Vacancies Trend Chart */}
        <GlassCard className="lg:col-span-3">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2 bg-sky-50 rounded-xl">
              <BarChart3 className="w-5 h-5 text-sky-500" />
            </div>
            <h3 className="text-lg font-black text-gray-800">Vacancies per Module</h3>
          </div>
          <div className="h-[360px]">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
              </div>
            ) : (
              <Bar data={barData} options={chartOptions} />
            )}
          </div>
        </GlassCard>
      </div>

      {/* ATS Performance Section */}
      <GlassCard hover={false} className="lg:p-10 border-indigo-50/50 bg-gradient-to-b from-white to-gray-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-50 rounded-xl">
                <Award className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-800">Average ATS Score</h3>
            </div>
            <p className="text-gray-400 text-sm font-medium">Average ATS score performance across active roles</p>
          </div>
          {/* <div className="px-5 py-2.5 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-600 text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            High Fidelity Analysis
          </div> */}
        </div>

        <div className="h-[440px]">
          {loading ? (
            <div className="w-full h-full bg-gray-50 rounded-3xl animate-pulse" />
          ) : (
            <Bar
              data={atsBarData}
              options={{
                ...chartOptions,
                onClick: (evt, elems) => {
                  if (elems.length) {
                    const idx = elems[0].index;
                    const vacancy = jobsAvg.raw[idx];
                    if (vacancy?.id) navigate(`/recruitment/${vacancy.id}`);
                  }
                }
              }}
            />
          )}
        </div>

        <div className="mt-12 pt-10 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* <div className="space-y-1.5">
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block">Benchmarking</span>
            <span className="text-xl text-emerald-600 font-black">Score 80+</span>
            <p className="text-[11px] text-gray-400">Target Proficiency</p>
          </div> */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block">Total Sample</span>
            <span className="text-xl text-gray-800 font-black">{vacancies?.length || 0} Openings</span>
            <p className="text-[11px] text-gray-400">Analyzed Vacancies</p>
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block">Global Index</span>
            <span className="text-xl text-indigo-600 font-black">
              {jobsAvg.avgs.length ? (jobsAvg.avgs.reduce((a, b) => a + b, 0) / jobsAvg.avgs.length).toFixed(1) : "0.0"}
            </span>
            <p className="text-[11px] text-gray-400">Weighted Average</p>
          </div>
          {/* <div className="space-y-1.5">
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block">Update Frequency</span>
            <div className="flex items-center gap-3">
              <span className="text-xl text-gray-800 font-black">Real-time</span>
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
            </div>
            <p className="text-[11px] text-gray-400">Syncing with ATS</p>
          </div> */}
        </div>
      </GlassCard>
    </div>
  );
}
