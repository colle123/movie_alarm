const { getMonthLabel, groupMoviesByDate, isDateInMonth, renderCalendar, renderMovieList } = window.MovieAlarmCalendar;
const { fetchMoviesByMonth } = window.MovieAlarmApi;
const { isPersistentStorageAvailable, readJson, writeJson } = window.MovieAlarmUtils;

const APP_STATE_KEY = "app_state";

const elements = {
  connectionStatus: document.querySelector("#connection-status"),
  dashboard: document.querySelector("#dashboard"),
  monthLabel: document.querySelector("#month-label"),
  prevMonthButton: document.querySelector("#prev-month-button"),
  nextMonthButton: document.querySelector("#next-month-button"),
  calendarStatus: document.querySelector("#calendar-status"),
  calendarGrid: document.querySelector("#calendar-grid"),
  moviePopup: document.querySelector("#movie-popup"),
  closePopupButton: document.querySelector("#close-popup-button"),
  movieList: document.querySelector("#movie-list"),
};

const state = {
  appData: null,
  monthDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  selectedDate: "",
  movies: [],
  groupedMovies: {},
  alarmIntervalId: null,
  popupAnchorDate: "",
};

function getAppData() {
  return readJson(APP_STATE_KEY, { notifiedDates: [] }) || { notifiedDates: [] };
}

function saveAppData() {
  writeJson(APP_STATE_KEY, {
    notifiedDates: Array.isArray(state.appData?.notifiedDates) ? state.appData.notifiedDates : [],
  });
}

function setStatus(message, tone = "normal") {
  elements.calendarStatus.textContent = message;
  elements.calendarStatus.style.color = tone === "error" ? "#b2291f" : tone === "success" ? "#1e7a57" : "";
}

function setConnectionStatus(message, tone = "normal") {
  elements.connectionStatus.textContent = message;
  elements.connectionStatus.style.color = tone === "error" ? "#b2291f" : tone === "success" ? "#1e7a57" : "";
}

function getTodayDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameMonth(leftDate, rightDate) {
  return leftDate.getFullYear() === rightDate.getFullYear() && leftDate.getMonth() === rightDate.getMonth();
}

async function loadMovies() {
  setConnectionStatus(
    isPersistentStorageAvailable()
      ? "TMDB 연동됨"
      : "TMDB 연동됨 · 임시 저장 모드",
    "success",
  );
  setStatus("영화 정보를 불러오는 중입니다...");

  try {
    const movies = await fetchMoviesByMonth({
      monthDate: state.monthDate,
    });

    state.movies = movies;
    state.groupedMovies = groupMoviesByDate(movies);

    if (state.selectedDate && !isDateInMonth(state.selectedDate, state.monthDate)) {
      state.selectedDate = "";
      state.popupAnchorDate = "";
      elements.moviePopup.classList.add("hidden");
    }

    setStatus(`${movies.length}개의 영화를 불러왔습니다.`, "success");
    renderCalendar({
      container: elements.calendarGrid,
      monthDate: state.monthDate,
      groupedMovies: state.groupedMovies,
      selectedDate: state.selectedDate,
    });
    renderSelectedDate();
    repositionMoviePopup();
  } catch (error) {
    state.movies = [];
    state.groupedMovies = {};
    setConnectionStatus("TMDB 연동 실패", "error");
    setStatus(error.message || "영화 정보를 불러오지 못했습니다.", "error");
    renderCalendar({
      container: elements.calendarGrid,
      monthDate: state.monthDate,
      groupedMovies: state.groupedMovies,
      selectedDate: state.selectedDate,
    });
    renderSelectedDate();
    repositionMoviePopup();
  }
}

function renderSelectedDate() {
  renderMovieList({
    container: elements.movieList,
    dateKey: state.selectedDate,
    groupedMovies: state.groupedMovies,
  });
}

function findPopupAnchorElement() {
  if (!state.popupAnchorDate) {
    return null;
  }

  return elements.calendarGrid.querySelector(`[data-date="${state.popupAnchorDate}"]`);
}

function positionMoviePopup(anchorElement) {
  if (!anchorElement) {
    return;
  }

  const popup = elements.moviePopup;
  const gap = 14;
  const viewportPadding = 12;

  popup.style.left = "0px";
  popup.style.top = "0px";
  popup.style.right = "auto";
  popup.style.bottom = "auto";

  const viewportWidth = window.innerWidth;
  const mobileLayout = viewportWidth <= 640;

  if (mobileLayout) {
    popup.style.left = `${viewportPadding}px`;
    popup.style.right = `${viewportPadding}px`;
    popup.style.top = "auto";
    popup.style.bottom = `${viewportPadding}px`;
    return;
  }

  const anchorRect = anchorElement.getBoundingClientRect();
  const popupRect = popup.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  let left = anchorRect.right + gap;
  let top = anchorRect.top;

  if (left + popupRect.width > viewportWidth - viewportPadding) {
    left = anchorRect.left - popupRect.width - gap;
  }

  if (left < viewportPadding) {
    left = viewportPadding;
  }

  if (top + popupRect.height > viewportHeight - viewportPadding) {
    top = viewportHeight - popupRect.height - viewportPadding;
  }

  if (top < viewportPadding) {
    top = viewportPadding;
  }

  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
}

function openMoviePopup() {
  const movies = state.selectedDate ? state.groupedMovies[state.selectedDate] || [] : [];
  if (!state.selectedDate || !movies.length) {
    elements.moviePopup.classList.add("hidden");
    state.popupAnchorDate = "";
    return;
  }

  state.popupAnchorDate = state.selectedDate;
  elements.moviePopup.classList.remove("hidden");

  window.requestAnimationFrame(() => {
    const anchorElement = findPopupAnchorElement();
    if (!anchorElement) {
      elements.moviePopup.classList.add("hidden");
      state.popupAnchorDate = "";
      return;
    }

    positionMoviePopup(anchorElement);
  });
}

function repositionMoviePopup() {
  if (elements.moviePopup.classList.contains("hidden") || !state.popupAnchorDate) {
    return;
  }

  const anchorElement = findPopupAnchorElement();
  if (!anchorElement) {
    elements.moviePopup.classList.add("hidden");
    state.popupAnchorDate = "";
    return;
  }

  positionMoviePopup(anchorElement);
}

function refreshCalendar() {
  elements.monthLabel.textContent = getMonthLabel(state.monthDate);
  renderCalendar({
    container: elements.calendarGrid,
    monthDate: state.monthDate,
    groupedMovies: state.groupedMovies,
    selectedDate: state.selectedDate,
  });
}

function syncLoggedInState() {
  refreshCalendar();
  renderSelectedDate();
  loadMovies();
}

function hydrateApp() {
  state.appData = getAppData();
  syncLoggedInState();
}

async function getTodaysMoviesForNotification(todayKey) {
  const today = new Date();
  if (isSameMonth(state.monthDate, today)) {
    return state.groupedMovies[todayKey] || [];
  }

  const movies = await fetchMoviesByMonth({ monthDate: new Date(today.getFullYear(), today.getMonth(), 1) });
  const groupedMovies = groupMoviesByDate(movies);
  return groupedMovies[todayKey] || [];
}

function startAlarmWatcher() {
  if (state.alarmIntervalId) {
    window.clearInterval(state.alarmIntervalId);
  }

  state.alarmIntervalId = window.setInterval(async () => {
    if (!state.appData) {
      return;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const todayKey = getTodayDateKey();
    const alreadyNotified = Array.isArray(state.appData.notifiedDates)
      && state.appData.notifiedDates.includes(todayKey);

    if (currentHour >= 10 && !alreadyNotified) {
      try {
        const todaysMovies = await getTodaysMoviesForNotification(todayKey);
        if (todaysMovies.length) {
          notifyReleaseMovies(todayKey, todaysMovies);
        }

        state.appData.notifiedDates = [...(state.appData.notifiedDates || []), todayKey];
        saveAppData();
      } catch (error) {
        setStatus("오늘 개봉 영화 알림 확인에 실패했습니다.", "error");
      }
    }
  }, 30000);
}

function notifyReleaseMovies(dateKey, movies) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const titles = movies.slice(0, 3).map((movie) => movie.title).join(", ");
  const suffix = movies.length > 3 ? ` 외 ${movies.length - 3}편` : "";
  const body = `${dateKey} 개봉 영화: ${titles}${suffix}`;
  new Notification("오늘 오전 10시 개봉 영화 알림", { body });
}

function initializeEvents() {
  elements.prevMonthButton.addEventListener("click", async () => {
    state.monthDate = new Date(state.monthDate.getFullYear(), state.monthDate.getMonth() - 1, 1);
    refreshCalendar();
    await loadMovies();
  });

  elements.nextMonthButton.addEventListener("click", async () => {
    state.monthDate = new Date(state.monthDate.getFullYear(), state.monthDate.getMonth() + 1, 1);
    refreshCalendar();
    await loadMovies();
  });

  elements.calendarGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".calendar-day");
    if (!button) {
      return;
    }

    const clickedDate = button.dataset.date || "";
    const isSameDate = state.selectedDate === clickedDate;
    const isPopupOpen = !elements.moviePopup.classList.contains("hidden");

    if (isSameDate && isPopupOpen) {
      elements.moviePopup.classList.add("hidden");
      state.popupAnchorDate = "";
      return;
    }

    state.selectedDate = clickedDate;
    refreshCalendar();
    renderSelectedDate();
    openMoviePopup();
  });

  elements.closePopupButton.addEventListener("click", () => {
    elements.moviePopup.classList.add("hidden");
    state.popupAnchorDate = "";
  });

  window.addEventListener("resize", repositionMoviePopup);
  window.addEventListener("scroll", repositionMoviePopup, { passive: true });
}

function init() {
  elements.monthLabel.textContent = getMonthLabel(state.monthDate);
  setConnectionStatus("TMDB 연동 확인 중");
  initializeEvents();
  hydrateApp();
  startAlarmWatcher();

  if (window.location.protocol === "file:") {
    setConnectionStatus("TMDB 연동됨 · 파일 실행 환경", "success");
  }
}

init();
