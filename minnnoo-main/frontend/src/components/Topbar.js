import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, ChevronDown, UserCircle, LogOut, Menu } from "lucide-react";

export default function Topbar({ setSidebarOpen }) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadOnly, setUnreadOnly] = useState(true);

  const [query, setQuery] = useState("");
const [results, setResults] = useState([]);
const [searchOpen, setSearchOpen] = useState(false);
const searchRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  let user = null;
  try {
    const stored = localStorage.getItem("user");
    if (stored && stored !== "undefined" && stored !== "null") {
      user = JSON.parse(stored);
    }
  } catch {
    user = null;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;
  const visibleNotifications = unreadOnly
    ? notifications.filter((n) => !n.read)
    : notifications;

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!userId) return;
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/notifications/user/${userId}`);
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error("Notification fetch error", err);
      }
    };
    fetchNotifications();
  }, []);


  useEffect(() => {
  if (!query.trim()) {
    setResults([]);
    return;
  }

  const timer = setTimeout(async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/users/search?q=${query}`
      );
      const data = await res.json();
      setResults(data);
      setSearchOpen(true);
    } catch (err) {
      console.error("Search error", err);
    }
  }, 300);

  return () => clearTimeout(timer);
}, [query]);



useEffect(() => {
  const handler = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setSearchOpen(false);
    }
  };
  document.addEventListener("mousedown", handler);
  return () => document.removeEventListener("mousedown", handler);
}, []);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAsRead = async (n) => {
    if (n.read) return;
    await fetch(`http://localhost:5000/api/notifications/read/${n._id}`, { method: "PATCH" });
    setNotifications((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
    setUnreadOnly(false);
  };

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3
                    bg-white border-b border-gray-200 shadow-sm">

      {/* ── LEFT ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="w-8 h-8 flex items-center justify-center rounded-lg
                     text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
        >
          <Menu size={18} />
        </button>

      <div className="relative" ref={searchRef}>
  <Search
    size={14}
    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
  />

  <input
    type="text"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Search for people…"
    className="bg-gray-50 text-sm text-gray-700
               border border-gray-200 rounded-xl
               pl-9 pr-4 py-2 w-72
               focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
  />

  {/* 🔽 Search Results */}
  {searchOpen && results.length > 0 && (
    <div className="absolute mt-2 w-full bg-white rounded-xl
                    border border-gray-200 shadow-lg z-50 overflow-hidden">
                      {results.map((u) => (
  <div
    key={u._id}
    onClick={() => {
      navigate(`/users/${u._id}`); // ✅ NEW PAGE
      setSearchOpen(false);
      setQuery("");
    }}
    className="px-4 py-3 cursor-pointer
               hover:bg-indigo-50 transition"
  >
    <p className="text-sm font-semibold text-gray-800">{u.name}</p>
    <p className="text-xs text-gray-400">{u.email}</p>
  </div>
))}
      {/* {results.map((u) => (
        <div
          key={u._id}
          onClick={() => {
            navigate(`/profile/${u._id}`);
            setSearchOpen(false);
            setQuery("");
          }}
          className="px-4 py-3 cursor-pointer
                     hover:bg-indigo-50 transition"
        >
          <p className="text-sm font-semibold text-gray-800">{u.name}</p>
          <p className="text-xs text-gray-400">{u.email}</p>
        </div>
      ))} */}
    </div>
  )}

  {searchOpen && query && results.length === 0 && (
    <div className="absolute mt-2 w-full bg-white rounded-xl
                    border border-gray-200 shadow-lg p-4 text-sm text-gray-400">
      No users found
    </div>
  )}
</div>
      </div>

      {/* ── RIGHT ── */}
      <div className="flex items-center gap-3">
        {/* Welcome */}
        <span className="text-sm text-gray-500 hidden sm:block">
          Welcome back,{" "}
          <span className="text-gray-800 font-semibold">{user?.name || "Guest"}</span> 👋
        </span>

        {/* ── Notification Bell ── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications((p) => !p)}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl
                       text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full
                           flex items-center justify-center text-[10px] font-bold text-white bg-red-500"
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-96 rounded-2xl border border-gray-200
                         shadow-xl overflow-hidden z-50 bg-white"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-indigo-500" />
                  <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold
                                     bg-indigo-50 text-indigo-600">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
                  <span>Unread only</span>
                  <div
                    onClick={() => setUnreadOnly((p) => !p)}
                    className={`relative w-8 h-4 rounded-full cursor-pointer transition-colors duration-200
                      ${unreadOnly ? "bg-indigo-500" : "bg-gray-200"}`}
                  >
                    <span
                      className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-200
                        ${unreadOnly ? "left-4" : "left-0.5"}`}
                    />
                  </div>
                </label>
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto">
                {visibleNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Bell size={28} className="text-gray-300" />
                    <p className="text-sm text-gray-400">No notifications</p>
                  </div>
                ) : (
                  visibleNotifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => markAsRead(n)}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer
                        border-b border-gray-50 last:border-0 transition-colors duration-150
                        ${n.read ? "hover:bg-gray-50" : "bg-indigo-50/50 hover:bg-indigo-50"}`}
                    >
                      <div className="mt-1.5 shrink-0">
                        {n.read
                          ? <span className="w-2 h-2 block rounded-full bg-gray-200" />
                          : <span className="w-2 h-2 block rounded-full bg-indigo-500" />
                        }
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${n.read ? "text-gray-500" : "text-gray-800 font-medium"}`}>
                          {n.message}
                        </p>
                        {n.vacancyId?.title && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            📋 {n.vacancyId.title}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Profile Menu ── */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((p) => !p)}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl
                       hover:bg-gray-100 transition-all duration-200"
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=4f46e5&color=fff&size=64`}
              alt="avatar"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
            />
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-52 rounded-2xl border border-gray-200
                         shadow-xl py-1.5 overflow-hidden z-50 bg-white"
            >
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || "Guest"}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email || ""}</p>
              </div>

              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                           text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                onClick={() => { setProfileOpen(false); navigate("/profile"); }}
              >
                <UserCircle size={15} className="text-indigo-500" />
                My Profile
              </button>

              <div className="mx-3 my-1 h-px bg-gray-100" />

              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                           text-red-500 hover:bg-red-50 transition-colors"
                onClick={() => { localStorage.removeItem("user"); window.location.href = "/login"; }}
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}