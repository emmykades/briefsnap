// Entry check for the freelancer-facing tool (Setup/Questionnaire/Brief builder).
// Client-facing pages (the questionnaire a client fills out, the brief they read)
// are not gated — those are reached via their own unique share link.
const ACCESS_KEY = import.meta.env.VITE_ACCESS_KEY;
const STORAGE_KEY = 'briefsnap_access';

export function checkAccess() {
  if (!ACCESS_KEY) return true;

  const params = new URLSearchParams(window.location.search);
  const urlKey = params.get('key');

  if (urlKey === ACCESS_KEY) {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // localStorage may be unavailable; access still works for this page load.
    }
    return true;
  }

  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}
