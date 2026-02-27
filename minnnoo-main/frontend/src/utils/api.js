// const API_URL = "http://localhost:5000";


// export async function apiFetch(url, options = {}) {
//   let accessToken = localStorage.getItem("accessToken");

//   let res = await fetch(url, {
//     ...options,
//     headers: {
//       ...options.headers,
//       Authorization: "Bearer " + accessToken,
//     },
//   });

//   // Access token expired
//   if (res.status === 401) {
//     const refreshToken = localStorage.getItem("refreshToken");

//     const refreshRes = await fetch(
//       "http://localhost:5000/api/auth/refresh",
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ refreshToken }),
//       }
//     );

//     // Refresh token expired → logout
//     if (!refreshRes.ok) {
//       logoutUser();
//       throw new Error("Session expired");
//     }

//     const data = await refreshRes.json();
//     localStorage.setItem("accessToken", data.accessToken);

//     // Retry original request
//     return apiFetch(url, options);
//   }

//   return res;
// }


// export const fetchWithAuth = async (url, options = {}) => {
//   let accessToken = localStorage.getItem("accessToken");

//   let res = await fetch(url, {
//     ...options,
//     headers: {
//       ...options.headers,
//       Authorization: `Bearer ${accessToken}`,
//     },
//   });

//   // If access token expired
//   if (res.status === 401) {
//     const refreshToken = localStorage.getItem("refreshToken");

//     const refreshRes = await fetch(`${API_URL}/api/auth/refresh-token`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ refreshToken }),
//     });

//     const data = await refreshRes.json();

//     if (refreshRes.ok) {
//       localStorage.setItem("accessToken", data.accessToken);

//       // retry original request
//       return fetch(url, {
//         ...options,
//         headers: {
//           ...options.headers,
//           Authorization: `Bearer ${data.accessToken}`,
//         },
//       });
//     } else {
//       // refresh expired → logout
//       localStorage.clear();
//       window.location.href = "/login";
//     }
//   }

//   return res;
// };



import { logoutUser } from "./auth";

const API_URL = "http://localhost:5000";

export async function apiFetch(endpoint, options = {}) {
  let accessToken = localStorage.getItem("accessToken");

  let res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // 🔴 Access token expired
  if (res.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      logoutUser();
      throw new Error("No refresh token");
    }

    const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    // 🔴 Refresh token expired (3 mins over)
    if (!refreshRes.ok) {
      logoutUser();
      throw new Error("Session expired");
    }

    const data = await refreshRes.json();
    localStorage.setItem("accessToken", data.accessToken);

    // 🟢 Retry original request ONCE
    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        Authorization: `Bearer ${data.accessToken}`,
      },
    });
  }

  return res;
}
