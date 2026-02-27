import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Menu, ChevronDown, User, LogOut, MessageSquareText } from "lucide-react";
import HRChatbot from "../components/HrChatbot.jsx";  // HR bot


export default function HrTopbar({ setSidebarOpen }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showHrBot, setShowHrBot] = useState(false);     // HR chatbot

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  let user = null;
  try {
    const stored = localStorage.getItem("user");
    if (stored && stored !== "undefined") user = JSON.parse(stored);
  } catch { user = null; }

  /* ── Fetch notifications ── */
  const userId = user?._id || user?.id;
  useEffect(() => {
    //const userId = user?._id || user?.id;
    if (!userId) return;
    fetch(`http://localhost:5000/api/notifications/user/${userId}`)
      .then((r) => r.json())
      .then((d) => setNotifications(Array.isArray(d) ? d : []))
      .catch(() => { });
  }, []);

  /* ── Close on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = (user?.name || "HR").charAt(0).toUpperCase();
  const unread = notifications.filter((n) => !n.read).length;
  const toggleHrBot = () => {
    setShowHrBot(prev => !prev);
    // if (!showHrBot) setShowUserBot(false);
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-6 py-3
                 bg-white border-b border-gray-100"
      style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.06)" }}
    >
      {/* ── Left: toggle + title ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen((p) => !p)}
          className="w-9 h-9 flex items-center justify-center rounded-xl
                     text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
        >
          <Menu size={20} />
        </button>

        <h2 className="text-base font-bold text-gray-800 hidden sm:block">
          HR Dashboard
        </h2>
      </div>

      {/* ── Right ── */}
      <div className="flex items-center gap-3">

        {/* Welcome pill */}
        <span className="hidden md:flex items-center gap-1.5 text-xs text-gray-400
                         bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
          👋 <span className="text-gray-700 font-medium">{user?.name || "HR"}</span>
        </span>

        {/* ── Notification bell ── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications((p) => !p)}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl
                       text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 bg-white border border-gray-100
                         rounded-2xl shadow-xl py-2 z-50"
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-50">
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-widest">
                  Notifications
                </h3>
                {unread > 0 && (
                  <span className="text-[10px] bg-red-50 text-red-500 border border-red-100
                                   px-2 py-0.5 rounded-full font-medium">
                    {unread} new
                  </span>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n._id}
                      className="px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                      <p className="text-sm text-gray-700 leading-snug">{n.message}</p>
                      {n.vacancyId?.title && (
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Job: {n.vacancyId.title}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={toggleHrBot}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all duration-300 shadow-sm
            ${showHrBot
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-200"
              : "bg-white text-gray-700 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30"
            }`}
        >
          <MessageSquareText size={18} className={showHrBot ? "animate-pulse" : "text-blue-500"} />
          <span className="text-xs">HR Assist</span>
        </button>

        {/* ── Profile dropdown ── */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl
                       hover:bg-gray-100 transition-all duration-200"
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}
            >
              {initials}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[90px] truncate">
              {user?.name || "HR"}
            </span>
            <ChevronDown
              size={13}
              color="#9ca3af"
              className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100
                            rounded-2xl shadow-xl py-1.5 z-50">
              {/* <button
                onClick={() => { setDropdownOpen(false); navigate("/profile"); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm
                           text-gray-700 hover:bg-gray-50 transition"
              >
                <User size={14} color="#6b7280" /> My Profile
              </button> */}
              <div className="my-1 mx-3 h-px bg-gray-100" />
              <button
                onClick={() => { localStorage.removeItem("user"); navigate("/hr-login"); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm
                           text-red-500 hover:bg-red-50 transition"
              >
                <LogOut size={14} color="#f43f5e" /> Logout
              </button>
            </div>
          )}
        </div>
        {showHrBot && (
          <div className="fixed bottom-10 right-10 z-50">
            <HRChatbot
              userId={userId}
              onClose={() => setShowHrBot(false)}
            />
          </div>
        )}
      </div>
    </header>
  );
}