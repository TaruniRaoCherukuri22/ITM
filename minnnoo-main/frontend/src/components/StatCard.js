// export default function StatCard({ title, value, accent }) {
//   const colors = {
//     green: "text-green-400 bg-green-500/10",
//     blue: "text-blue-400 bg-blue-500/10",
//     yellow: "text-yellow-400 bg-yellow-500/10",
//     purple: "text-purple-400 bg-purple-500/10"
//   };

//   return (
//     <div className="bg-[#11162a] rounded-2xl p-5 border border-white/10 shadow-lg">
//       <p className="text-sm text-gray-400">{title}</p>
//       <h3 className={`text-3xl font-bold mt-2 ${colors[accent]}`}>
//         {value}
//       </h3>
//     </div>
//   );
// }

export default function StatCard({ title, value, accent }) {
  const accentMap = {
    green: {
      border: "border-emerald-200",
      glow: "from-emerald-50/70",
      text: "text-emerald-700",
    },
    blue: {
      border: "border-blue-200",
      glow: "from-blue-50/70",
      text: "text-blue-700",
    },
    yellow: {
      border: "border-amber-200",
      glow: "from-amber-50/70",
      text: "text-amber-700",
    },
    purple: {
      border: "border-purple-200",
      glow: "from-purple-50/70",
      text: "text-purple-700",
    },
  };

  const styles = accentMap[accent];

  return (
    <div
      className={`
        relative overflow-hidden
        bg-white
        border ${styles.border}
        rounded-2xl
        p-6
        shadow-sm
        hover:shadow-lg
        hover:-translate-y-0.5
        transition-all duration-300
      `}
    >
      {/* 🔥 Soft highlight glow */}
      <div
        className={`
          absolute inset-0
          bg-gradient-to-b ${styles.glow} to-transparent
          pointer-events-none
        `}
      />

     <p className="relative text-sm font-semibold text-gray-500">
  {title}
</p>

<h3 className={`relative mt-2 text-3xl font-extrabold ${styles.text}`}>
  {value || 0}
</h3>
    </div>
  );
}