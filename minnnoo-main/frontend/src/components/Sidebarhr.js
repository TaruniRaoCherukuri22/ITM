import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus2,
  BriefcaseBusiness,
  Trophy,
  LogOut,
} from "lucide-react";

const navItems = [
  { to: "/home", label: "Dashboard", Icon: LayoutDashboard, color: "#2563eb" },
  { to: "/create-job", label: "Create Job", Icon: FilePlus2, color: "#7c3aed" },
  { to: "/vacancies", label: "Vacancies", Icon: BriefcaseBusiness, color: "#0891b2" },
  { to: "/top-employees", label: "Top Employees", Icon: Trophy, color: "#d97706" },
  { to: "/topcards", label: "All Jobs", Icon: BriefcaseBusiness, color: "#059669" },
  {to: "/analytics", label: "Analytics", Icon: BriefcaseBusiness, color: "#059669" }
];

export default function Sidebarhr() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/hr-login");
  };

  return (
    <aside
      className="w-64 min-h-screen flex flex-col shrink-0"
      style={{
        background: "#ffffff",
        borderRight: "1px solid #e2e8f0",
        boxShadow: "4px 0 24px rgba(0,0,0,0.06)",
      }}
    >
      {/* ── Brand ── */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white"
            style={{
              background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
              boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
            }}
          >
            HR
          </div>
          <p className="text-base font-extrabold tracking-wide text-gray-800">
            HR Panel
          </p>
        </div>
      </div>

      {/* ── Nav links ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, label, Icon, color }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
               ${isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`
            }
            style={({ isActive }) =>
              isActive
                ? {
                  background: `${color}12`,
                  border: `1px solid ${color}30`,
                }
                : { border: "1px solid transparent" }
            }
          >
            {({ isActive }) => (
              <>
                {/* Icon box */}
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                  style={
                    isActive
                      ? { background: `${color}18`, border: `1px solid ${color}40` }
                      : { background: "#f8fafc" }
                  }
                >
                  <Icon
                    size={15}
                    color={isActive ? color : "#9ca3af"}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                </span>

                <span style={isActive ? { color } : {}}>{label}</span>

                {/* Active dot */}
                {isActive && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: color }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Divider ── */}
      <div className="mx-4 h-px bg-gray-100" />

      {/* ── Logout ── */}
      <div className="px-3 py-4">
        <button
          onClick={logout}
          className="group w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                     text-rose-500 border border-transparent
                     hover:bg-rose-50 hover:border-rose-100
                     transition-all duration-200"
        >
          <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50
                           group-hover:bg-rose-100 transition-all duration-200">
            <LogOut size={15} color="#f43f5e" strokeWidth={1.8} />
          </span>
          Logout
        </button>
      </div>
    </aside>
  );
}
