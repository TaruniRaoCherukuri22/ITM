import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login({ setUser }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();


  const handleLogin = async (e) => {
  e.preventDefault();

  const res = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
console.log("🔵 FULL LOGIN RESPONSE:", data);
console.log("🔵 accessToken:", data.accessToken);
console.log("🔵 refreshToken:", data.refreshToken);

  if (res.ok) {
      localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);

  console.log(
  "🟢 STORED accessToken:",
  localStorage.getItem("accessToken")
);
console.log(
  "🟢 STORED refreshToken:",
  localStorage.getItem("refreshToken")
);
    localStorage.setItem("user", JSON.stringify(data.user)); // save in storage
    setUser(data.user); // update App.js state
    navigate("/dashboard"); // navigate to dashboard
  } else {
    alert(data.message);
  }
};


return (
  <div className="min-h-screen flex items-center justify-center 
                  bg-gradient-to-br from-[#0b1020] via-[#0e1630] to-black 
                  text-gray-200">

    {/* Card */}
    <form
      onSubmit={handleLogin}
      className="relative w-96 p-8 rounded-2xl
                 bg-white/5 backdrop-blur-xl
                 border border-white/10
                 shadow-2xl
                 hover:shadow-blue-500/20
                 transition-all duration-300
                 hover:scale-[1.02]"
    >
      {/* Glow */}
      <div className="absolute -inset-1 rounded-2xl 
                      bg-gradient-to-r from-blue-500/20 to-purple-500/20 
                      blur opacity-30 -z-10" />

      <h2 className="text-3xl font-bold mb-2 text-center">
        Welcome Back 👋
      </h2>
      <p className="text-sm text-gray-400 text-center mb-6">
        Login to access your dashboard
      </p>

      {/* Email */}
      <div className="mb-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 rounded-lg
                     bg-black/40 border border-white/10
                     text-gray-200 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50
                     transition-all"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {/* Password */}
      <div className="mb-6">
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 rounded-lg
                     bg-black/40 border border-white/10
                     text-gray-200 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-purple-500/50
                     transition-all"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {/* Button */}
      <button
        type="submit"
        className="w-full py-3 rounded-xl font-semibold
                   bg-gradient-to-r from-blue-600 to-purple-600
                   hover:from-blue-500 hover:to-purple-500
                   transition-all duration-300
                   hover:shadow-lg hover:shadow-blue-500/30
                   active:scale-95"
      >
        Login
      </button>

      {/* Signup */}
      <p className="text-sm text-gray-400 text-center mt-6">
        Don’t have an account?{" "}
        <Link
          to="/signup"
          className="text-blue-400 hover:text-blue-300 hover:underline transition"
        >
          Signup
        </Link>
      </p>
    </form>
  </div>
);
}
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <form
//         onSubmit={handleLogin}
//         className="bg-white p-8 rounded-lg shadow w-96"
//       >
//         <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

//         <input
//           type="email"
//           placeholder="Email"
//           className="w-full border px-4 py-2 rounded mb-4"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           className="w-full border px-4 py-2 rounded mb-4"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />

//         <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mb-4">
//           Login
//         </button>

//         <p className="text-sm text-gray-500 text-center">
//           Don't have an account?{" "}
//           <Link to="/signup" className="text-blue-600 hover:underline">
//             Signup
//           </Link>
//         </p>
//       </form>
//     </div>
//   );
// }
