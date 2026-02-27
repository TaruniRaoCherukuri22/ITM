export function logoutUser() {
  localStorage.clear();
  window.location.href = "/login";
}
