import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center
                  bg-gradient-to-br from-[#0b1020] via-[#0e1630] to-black
                  text-gray-200">

    {/* Card */}
    <form
      onSubmit={handleSignup}
      className="relative w-96 p-8 rounded-2xl
                 bg-white/5 backdrop-blur-xl
                 border border-white/10
                 shadow-2xl
                 hover:shadow-green-500/20
                 transition-all duration-300
                 hover:scale-[1.02]"
    >
      {/* Glow */}
      <div className="absolute -inset-1 rounded-2xl
                      bg-gradient-to-r from-green-500/20 to-emerald-500/20
                      blur opacity-30 -z-10" />

      <h2 className="text-3xl font-bold mb-2 text-center">
        Create Account ✨
      </h2>
      <p className="text-sm text-gray-400 text-center mb-6">
        Join us and start your journey
      </p>

      {/* Name */}
      <input
        type="text"
        placeholder="Full Name"
        className="w-full px-4 py-3 rounded-lg mb-4
                   bg-black/40 border border-white/10
                   text-gray-200 placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-green-500/50
                   transition-all"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      {/* Email */}
      <input
        type="email"
        placeholder="Email"
        className="w-full px-4 py-3 rounded-lg mb-4
                   bg-black/40 border border-white/10
                   text-gray-200 placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-emerald-500/50
                   transition-all"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {/* Password */}
      <input
        type="password"
        placeholder="Password"
        className="w-full px-4 py-3 rounded-lg mb-6
                   bg-black/40 border border-white/10
                   text-gray-200 placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-teal-500/50
                   transition-all"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {/* Button */}
      <button
        type="submit"
          className="w-full py-3 rounded-xl font-semibold
                   bg-gradient-to-r from-blue-600 to-purple-600
                   hover:from-blue-500 hover:to-purple-500
                   transition-all duration-300
                   hover:shadow-lg hover:shadow-blue-500/30
                   active:scale-95"
        // className="w-full py-3 rounded-xl font-semibold
        //            bg-gradient-to-r from-green-600 to-emerald-600
        //            hover:from-green-500 hover:to-emerald-500
        //            transition-all duration-300
        //            hover:shadow-lg hover:shadow-green-500/30
        //            active:scale-95"
      >
        Signup
      </button>

      {/* Login */}
      <p className="text-sm text-gray-400 text-center mt-6">
        Already have an account?{" "}
        <Link
          to="/login"
                    className="text-blue-400 hover:text-blue-300 hover:underline transition"
          // className="text-green-400 hover:text-green-300 hover:underline transition"
        >
          Login
        </Link>
      </p>
    </form>
  </div>
);
}

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <form
//         onSubmit={handleSignup}
//         className="bg-white p-8 rounded-lg shadow w-96"
//       >
//         <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>

//         <input
//           type="text"
//           placeholder="Full Name"
//           className="w-full border px-4 py-2 rounded mb-4"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           required
//         />

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

//         <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 mb-4">
//           Signup
//         </button>

//         <p className="text-sm text-gray-500 text-center">
//           Already have an account?{" "}
//           <Link to="/login" className="text-blue-600 hover:underline">
//             Login
//           </Link>
//         </p>
//       </form>
//     </div>
//   );
// }
