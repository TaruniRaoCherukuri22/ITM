// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;



// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import Sidebar from "./components/Sidebar";
// import Dashboard from "./components/Dashboard";
// // import Profile from "./Profile";
// // import Login from "./Login";

// function App() {
//   return (
//     <Router>
//       <div className="flex min-h-screen bg-gray-100">
//         {/* Sidebar */}
//         <Sidebar />

//         {/* Main Content */}
//         <div className="flex-1 overflow-hidden">
//           <Routes>
//             <Route path="/" element={<Navigate to="/dashboard" />} />
//             <Route path="/dashboard" element={<Dashboard />} />
//             {/* <Route path="/profile" element={<Profile />} /> */}
//             {/* <Route path="/login" element={<Login />} /> */}
//           </Routes>
//         </div>
//       </div>
//     </Router>
//   );
// }

// export default App;



// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import Dashboard from "./components/Dashboard";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
// import Profile from "./components/Profile";
// import Topbar from "./components/Topbar";
// function App() {
//   const user = JSON.parse(localStorage.getItem("user"));

//   return (
//     <Router>
//       <Routes>
//         <Route
//           path="/login"
//           element={user ? <Navigate to="/dashboard" /> : <Login />}
//         />
//         <Route
//           path="/signup"
//           element={user ? <Navigate to="/dashboard" /> : <Signup />}
//         />
//         <Route
//           path="/dashboard"
//           element={user ? <Dashboard /> : <Navigate to="/login" />}
//         />
//         <Route
//       path="/profile"
//       element={user ? <Profile /> : <Navigate to="/login" />}
//     />
//         <Route path="*" element={<Navigate to="/login" />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;




import { BrowserRouter as Router, Routes, Route, Navigate, UNSAFE_WithComponentProps } from "react-router-dom";
import { useState } from "react";
import Dashboard from "./components/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CreateJob from "./components/CreateJob";
import Profile from "./components/Profile";
import HRLogin from "./pages/HRLogin";
import Home from "./components/Home";
import ApplyJob from "./components/ApplyJob";
import Vacancies from "./pages/Vacancies";
import HrDashboard from "./components/HrDashboard";
import TopEmployeesHR from "./components/TopEmployeesHR";
import Recruitment from "./pages/Recruitment";
import TopEmployees from "./components/TopEmployees";
import VacancyCandidates from "./components/VacancyCandidates";
import TopCards from "./components/TopCards"
import UserProfileView from "./components/UserProfileView";
import HRLayout from "./layouts/HRLayout"; // ✅ Added import

import Analytics from "./components/Analytics";
// import ApplyJob from "./components/ApplyJob";
// import mongoose from "mongoose";
// import MatchedApplications from "./components/MatchedApplications";
function App() {
  const storedUser = localStorage.getItem("user");
  const [user, setUser] = useState(
    storedUser && storedUser !== "undefined" && storedUser !== "null"
      ? JSON.parse(storedUser)
      : null
  );

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login setUser={setUser} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            user ? (
              <Navigate to="/dashboard" />
            ) : (
              <Signup setUser={setUser} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />

        {/* <Route path="/profile/:userId" element={<Profile />} /> */}
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/login" />}
        />

        <Route
          path="/hr-login"
          element={<HRLogin setUser={setUser} />}
        />

        {/* Group HR Routes under HRLayout */}
        <Route element={<HRLayout />}>
          <Route
            path="/create-job"
            element={
              user?.role === "hr"
                ? <CreateJob />
                : <Navigate to="/hr-login" />
            }
          />
          <Route
            path="/edit-job/:id"
            element={
              user?.role === "hr"
                ? <CreateJob />
                : <Navigate to="/hr-login" />
            }
          />
          <Route
            path="/hr/vacancies/:vacancyId/candidates"
            element={<VacancyCandidates />}
          />
          <Route
            path="/hr-dashboard"
            element={
              user?.role === "hr" ? <HrDashboard /> : <Navigate to="/hr-login" />
            }
          />
          <Route path="/vacancies" element={<Vacancies />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/home" element={<Home />} />
          <Route
            path="/top-employees"
            element={user ? <TopEmployeesHR /> : <Navigate to="/login" />}
          />
          <Route
            path="/topcards"
            element={user ? <TopCards /> : <Navigate to="/login" />}
          />
        </Route>

        <Route
          path="/recruitment"
          element={user ? <Recruitment /> : <Navigate to="/login" />}
        />

        <Route path="/apply/:jobId" element={<ApplyJob />} />

        <Route path="/users/:userId" element={<UserProfileView />} />

        <Route
          path="/top-emp"
          element={user ? <TopEmployees /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;




// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import { useState } from "react";

// /* ===== Pages ===== */
// import Home from "./components/Home";
// // import JobList from "./pages/JobList";
// import CreateJob from "./components/CreateJob";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
// import HRLogin from "./pages/HRLogin";
// import Recruitment from "./pages/Recruitment";
// // import Employees from "./pages/Employees";
// // import Applications from "./pages/Applications";
// import Vacancies from "./pages/Vacancies";

// /* ===== Components ===== */
// import Layout from "./Layout";
// import Dashboard from "./components/Dashboard";
// // import Profile from "./components/Profile";
// import HrDashboard from "./components/HrDashboard";

// /* ===== Styles ===== */
// import "./App.css";

// export default function App() {
//   const storedUser = localStorage.getItem("user");

//   const [user, setUser] = useState(
//     storedUser && storedUser !== "undefined" && storedUser !== "null"
//       ? JSON.parse(storedUser)
//       : null
//   );

//   return (
//     <Router>
//       <Routes>

//         {/* ===== DEFAULT ===== */}
//         <Route path="/" element={<Navigate to="/hr-login" />} />

//         {/* ===== AUTH ROUTES ===== */}
//         <Route
//           path="/login"
//           element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />}
//         />

//         <Route
//           path="/signup"
//           element={user ? <Navigate to="/dashboard" /> : <Signup setUser={setUser} />}
//         />

//         <Route
//           path="/hr-login"
//           element={<HRLogin setUser={setUser} />}
//         />

//         {/* ===== PROTECTED ROUTES (WITH LAYOUT) ===== */}
//         <Route element={user ? <Layout /> : <Navigate to="/hr-login" />}>

//           {/* Common */}
//           <Route path="/dashboard" element={<Dashboard />} />
//           {/* <Route path="/profile" element={<Profile />} /> */}

//           {/* HR ONLY */}
//           <Route
//             path="/hr-dashboard"
//             element={
//               user?.role === "hr"
//                 ? <HrDashboard />
//                 : <Navigate to="/hr-login" />
//             }
//           />

//           <Route
//             path="/create-job"
//             element={
//               user?.role === "hr"
//                 ? <CreateJob />
//                 : <Navigate to="/hr-login" />
//             }
//           />

//           <Route path="/recruitment" element={<Recruitment />} />
//           {/* <Route path="/employees" element={<Employees />} /> */}
//           {/* <Route path="/applications" element={<Applications />} /> */}
//           <Route path="/vacancies" element={<Vacancies />} />
//         </Route>

//         {/* ===== PUBLIC ROUTES ===== */}
//         <Route path="/home" element={<Home />} />
//         {/* <Route path="/jobs" element={<JobList />} /> */}

//         {/* ===== FALLBACK ===== */}
//         <Route path="*" element={<Navigate to="/hr-login" />} />

//       </Routes>
//     </Router>
//   );
// }
