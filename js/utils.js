window.MovieAlarmUtils = (() => {
const APP_PREFIX = "movie_alarm";
const memoryStorage = new Map();

function getStorageBackend() {
  try {
    const probeKey = `${APP_PREFIX}_probe`;
    localStorage.setItem(probeKey, "ok");
    localStorage.removeItem(probeKey);
    return localStorage;
  } catch (error) {
    return {
      getItem(key) {
        return memoryStorage.has(key) ? memoryStorage.get(key) : null;
      },
      setItem(key, value) {
        memoryStorage.set(key, value);
      },
      removeItem(key) {
        memoryStorage.delete(key);
      },
    };
  }
}

function toStorageKey(key) {
  return `${APP_PREFIX}_${key}`;
}

function readJson(key, fallback) {
  try {
    const value = getStorageBackend().getItem(toStorageKey(key));
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJson(key, value) {
  getStorageBackend().setItem(toStorageKey(key), JSON.stringify(value));
}

function removeStoredValue(key) {
  getStorageBackend().removeItem(toStorageKey(key));
}

function createUserKey(username) {
  return `user_${username.toLowerCase()}`;
}

function sanitizeUsername(username) {
  return username.trim().replace(/\s+/g, "_").slice(0, 24);
}

function getMonthRange(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    start,
    end,
    startString: toDateInputValue(start),
    endString: toDateInputValue(end),
  };
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateString(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatMonthLabel(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
  }).format(date);
}

function formatFullDate(dateString) {
  const date = parseDateString(dateString);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function isPersistentStorageAvailable() {
  return getStorageBackend() === localStorage;
}

return {
  toStorageKey,
  readJson,
  writeJson,
  removeStoredValue,
  createUserKey,
  sanitizeUsername,
  getMonthRange,
  toDateInputValue,
  parseDateString,
  formatMonthLabel,
  formatFullDate,
  formatDateTime,
  escapeHtml,
  createId,
  isPersistentStorageAvailable,
};
})();
