const TOKEN_KEY = "das_token";
const USER_KEY = "das_user";
const PROFILE_KEY = "das_profile";

export function saveAuth({ token, user, profile }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (profile) localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function getProfile() {
  const raw = localStorage.getItem(PROFILE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function isLoggedIn() {
  return Boolean(getToken() && getUser());
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(PROFILE_KEY);
}

