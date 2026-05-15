window.MovieAlarmApi = (() => {
const { getMonthRange } = window.MovieAlarmUtils;

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w342";
const TMDB_READ_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZmI0MjU3MGViM2JhNWUxZTg3Nzg4YTU1NTM1MmFjZiIsIm5iZiI6MTc3ODgzMDIzMS4zNTAwMDAxLCJzdWIiOiI2YTA2Y2I5NzkxZDg1ZGZjYzJlYmZiNzYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.-DVijnOisuzxCtJ9o9VtQFSmZwYR8aZry2eXGkEel-s";
const MAX_PAGES = 10;

function normalizeMovie(movie) {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview || "줄거리 정보가 없습니다.",
    posterPath: movie.poster_path || "",
    posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : "",
    releaseDate: movie.release_date,
    voteAverage: movie.vote_average || 0,
    originalLanguage: movie.original_language || "",
  };
}

async function fetchMoviesByMonth({ monthDate }) {
  const { startString, endString } = getMonthRange(monthDate);
  const headers = {
    Authorization: `Bearer ${TMDB_READ_ACCESS_TOKEN}`,
    Accept: "application/json",
  };
  const collectedMovies = [];
  let totalPages = 1;

  for (let page = 1; page <= Math.min(totalPages, MAX_PAGES); page += 1) {
    const params = new URLSearchParams({
      include_adult: "false",
      include_video: "false",
      language: "ko-KR",
      page: String(page),
      region: "KR",
      "release_date.gte": startString,
      "release_date.lte": endString,
      sort_by: "release_date.asc",
      with_origin_country: "KR",
      with_original_language: "ko",
      with_release_type: "2|3",
    });

    const response = await fetch(`${TMDB_BASE_URL}/discover/movie?${params.toString()}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`TMDB 요청 실패 (${response.status})`);
    }

    const data = await response.json();
    totalPages = Number(data.total_pages) || 1;

    if (Array.isArray(data.results)) {
      collectedMovies.push(...data.results.map(normalizeMovie));
    }
  }

  return collectedMovies;
}

return {
  fetchMoviesByMonth,
};
})();
