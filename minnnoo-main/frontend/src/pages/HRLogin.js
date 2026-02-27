// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function HRLogin({ setUser }) {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   // Hardcoded HR credentials
//   const HR_CREDENTIALS = {
//     email: "hr@example.com",
//     password: "hr123",
//     role: "hr",
//     name: "HR Admin"
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (email === HR_CREDENTIALS.email && password === HR_CREDENTIALS.password) {
//       // Save user in localStorage
//       localStorage.setItem("user", JSON.stringify(HR_CREDENTIALS));
//       navigate("/hr-dashboard"); // go to HR dashboard
//     } else {
//       setError("Invalid email or password");
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white p-8 rounded shadow-md w-96 space-y-4"
//       >
//         <h2 className="text-2xl font-bold text-center mb-4">HR Login</h2>

//         {error && <p className="text-red-500">{error}</p>}

//         <div>
//           <label className="block mb-1 font-semibold">Email</label>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full border px-3 py-2 rounded"
//             placeholder="hr@example.com"
//             required
//           />
//         </div>

//         <div>
//           <label className="block mb-1 font-semibold">Password</label>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full border px-3 py-2 rounded"
//             placeholder="hr123"
//             required
//           />
//         </div>

//         <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
//           Login
//         </button>
//       </form>
//     </div>
//   );
// }



import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HRLogin({ setUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Hardcoded HR credentials
  const HR_CREDENTIALS = {
    email: "hr@gmail.com",
    password: "hr123",
    role: "hr",
    name: "HR Admin",
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === HR_CREDENTIALS.email && password === HR_CREDENTIALS.password) {
      // Save HR info in localStorage (no token)
      localStorage.setItem("user", JSON.stringify(HR_CREDENTIALS));
       setUser(HR_CREDENTIALS); //
      navigate("/home"); // go to HR dashboard
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center mb-4">HR Login</h2>

        {error && <p className="text-red-500">{error}</p>}

        <div>
          <label className="block mb-1 font-semibold">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="hr@example.com"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="hr123"
            required
          />
        </div>

        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
          Login
        </button>
      </form>
    </div>
  );
}
