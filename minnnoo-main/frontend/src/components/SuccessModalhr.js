import { useEffect, useRef } from "react";
import { CheckCircle2, X } from "lucide-react";

export default function SuccessModalhr({ onClose }) {
  const btnRef = useRef();
  useEffect(() => { btnRef.current?.focus(); }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.18)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-emerald-100 px-8 py-10 text-center space-y-5"
        style={{ animation: "popUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}
      >
        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition">
          <X size={16} />
        </button>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center
                          bg-emerald-50 border border-emerald-200"
            style={{ boxShadow: "0 0 20px rgba(16,185,129,0.15)" }}>
            <CheckCircle2 size={32} color="#059669" strokeWidth={2} />
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-xl font-extrabold text-gray-800">Applied Successfully!</h2>
          <p className="text-gray-400 text-sm mt-1.5">Your application has been submitted. Good luck! 🚀</p>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100" />

        {/* Done */}
        <button
          ref={btnRef}
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white
                     transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
          style={{
            background: "linear-gradient(135deg,#059669,#3b82f6)",
            boxShadow: "0 4px 14px rgba(5,150,105,0.25)",
          }}
        >
          Done
        </button>
      </div>

      <style>{`
        @keyframes popUp {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}