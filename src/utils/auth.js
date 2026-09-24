const KEY = 'pv_user';

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
}

export function saveUser(data) {
  localStorage.setItem(KEY, JSON.stringify({ ...getUser(), ...data }));
}

export function clearUser() {
  localStorage.removeItem(KEY);
}

export function isLoggedIn() {
  return !!getUser();
}
