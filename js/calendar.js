window.MovieAlarmCalendar = (() => {
const { escapeHtml, formatFullDate, formatMonthLabel, parseDateString, toDateInputValue } = window.MovieAlarmUtils;

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function groupMoviesByDate(movies) {
  return movies.reduce((accumulator, movie) => {
    if (!movie.releaseDate) {
      return accumulator;
    }

    if (!accumulator[movie.releaseDate]) {
      accumulator[movie.releaseDate] = [];
    }

    accumulator[movie.releaseDate].push(movie);
    return accumulator;
  }, {});
}

function renderCalendar({ container, monthDate, groupedMovies, selectedDate }) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const firstGridDate = new Date(firstDay);
  firstGridDate.setDate(firstDay.getDate() - firstDay.getDay());

  const fragments = WEEKDAYS.map((weekday) => `<div class="weekday">${weekday}</div>`);

  for (let offset = 0; offset < 42; offset += 1) {
    const currentDate = new Date(firstGridDate);
    currentDate.setDate(firstGridDate.getDate() + offset);

    const dateKey = toDateInputValue(currentDate);
    const movies = groupedMovies[dateKey] || [];
    const inCurrentMonth = currentDate.getMonth() === monthDate.getMonth();
    const selectedClass = selectedDate === dateKey ? "selected" : "";
    const hasMoviesClass = movies.length ? "has-movies" : "";

    const pills = movies
      .slice(0, 2)
      .map((movie) => `<div class="day-movie-pill">${escapeHtml(movie.title)}</div>`)
      .join("");

    const extra = movies.length > 2 ? `<div class="day-movie-pill">+${movies.length - 2}편</div>` : "";

    fragments.push(`
      <button
        type="button"
        class="calendar-day ${inCurrentMonth ? "" : "outside"} ${selectedClass} ${hasMoviesClass}"
        data-date="${dateKey}"
        aria-label="${formatFullDate(dateKey)}"
      >
        <span class="day-number">${currentDate.getDate()}</span>
        <div class="day-movies">${pills}${extra}</div>
      </button>
    `);
  }

  container.innerHTML = fragments.join("");
}

function renderMovieList({ container, dateKey, groupedMovies }) {
  const movies = groupedMovies[dateKey] || [];

  if (!dateKey) {
    container.className = "movie-list empty-state";
    container.textContent = "달력에서 날짜를 선택하면 영화 목록이 표시됩니다.";
    return { totalMovies: 0, totalPages: 0 };
  }

  if (!movies.length) {
    container.className = "movie-list empty-state";
    container.textContent = "선택한 날짜에는 표시할 영화가 없습니다.";
    return { totalMovies: 0, totalPages: 0 };
  }

  container.className = "movie-list";
  container.innerHTML = movies
    .map(
      (movie) => `
        <article class="movie-card">
          ${
            movie.posterUrl
              ? `<img class="movie-poster" src="${escapeHtml(movie.posterUrl)}" alt="${escapeHtml(movie.title)} 포스터" />`
              : `<div class="movie-poster movie-poster-fallback">포스터 없음</div>`
          }
          <div>
            <h3 class="movie-title">${escapeHtml(movie.title)}</h3>
            <p class="movie-meta">
              개봉일 ${escapeHtml(movie.releaseDate)} · 평점 ${Number(movie.voteAverage).toFixed(1)} · 원어 ${escapeHtml(movie.originalLanguage.toUpperCase())}
            </p>
            <p class="movie-overview">${escapeHtml(movie.overview)}</p>
          </div>
        </article>
      `,
    )
    .join("");

  return {
    totalMovies: movies.length,
    totalPages: 1,
    page: 1,
  };
}

function getMonthLabel(monthDate) {
  return formatMonthLabel(monthDate);
}

function buildSelectedDateLabel(dateKey) {
  return dateKey ? `${formatFullDate(dateKey)} 개봉 영화` : "날짜를 선택하세요";
}

function isDateInMonth(dateKey, monthDate) {
  const date = parseDateString(dateKey);
  return date.getFullYear() === monthDate.getFullYear() && date.getMonth() === monthDate.getMonth();
}

return {
  groupMoviesByDate,
  renderCalendar,
  renderMovieList,
  getMonthLabel,
  buildSelectedDateLabel,
  isDateInMonth,
};
})();
