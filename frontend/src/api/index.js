import axios from 'axios';

// ─── Axios instance ────────────────────────────────────────────────────────
const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authRegister = (body) => api.post('/api/auth/register', body);
export const authLogin    = (body) => api.post('/api/auth/login',    body);

// ─── Movies ───────────────────────────────────────────────────────────────
export const getPopularMovies = ()       => api.get('/api/movies/popular');
export const searchMovies     = (query)  => api.get('/api/movies/search', { params: { query } });
export const syncMovie      = (tmdbId)  => api.post(`/api/movies/sync/${tmdbId}`);
export const getMovie       = (id)      => api.get(`/api/movies/${id}`);
export const filterMovies   = (params)  => api.get('/api/movies/filter', { params });
export const getMovieCast   = (id)      => api.get(`/api/movies/${id}/cast`);
export const likeMovie      = (id)      => api.post(`/api/movies/${id}/like`);
export const unlikeMovie    = (id)      => api.delete(`/api/movies/${id}/like`);
export const getLikeStatus  = (id)      => api.get(`/api/movies/${id}/like/status`);

// ─── Reviews ──────────────────────────────────────────────────────────────
export const createReview   = (body)         => api.post('/api/reviews', body);
export const updateReview   = (id, body)     => api.put(`/api/reviews/${id}`, body);
export const deleteReview   = (id)           => api.delete(`/api/reviews/${id}`);
export const getMovieReviews = (movieId, page = 0, size = 20) =>
    api.get(`/api/reviews/movie/${movieId}`, { params: { page, size } });
export const getUserReviews  = (username, page = 0, size = 20) =>
    api.get(`/api/reviews/user/${username}`, { params: { page, size } });

// ─── Diary ────────────────────────────────────────────────────────────────
export const createDiaryEntry = (body)    => api.post('/api/diary', body);
export const deleteDiaryEntry = (id)      => api.delete(`/api/diary/${id}`);
export const getDiary         = (username, page = 0, size = 20) =>
    api.get(`/api/diary/${username}`, { params: { page, size } });

// ─── Watchlist ────────────────────────────────────────────────────────────
export const addToWatchlist      = (movieId)  => api.post(`/api/watchlist/${movieId}`);
export const removeFromWatchlist = (movieId)  => api.delete(`/api/watchlist/${movieId}`);
export const getMyWatchlist      = (page = 0, size = 20) =>
    api.get('/api/watchlist', { params: { page, size } });
export const getUserWatchlist    = (username, page = 0, size = 20) =>
    api.get(`/api/watchlist/${username}`, { params: { page, size } });

// ─── Watched ──────────────────────────────────────────────────────────────
export const markWatched      = (movieId) => api.post(`/api/watched/${movieId}`);
export const unmarkWatched    = (movieId) => api.delete(`/api/watched/${movieId}`);
export const getWatchedStatus = (movieId) => api.get(`/api/watched/${movieId}/status`);
export const getWatchedCount  = (username)=> api.get(`/api/watched/count/${username}`);

// ─── Social ───────────────────────────────────────────────────────────────
export const followUser    = (username) => api.post(`/api/users/${username}/follow`);
export const unfollowUser  = (username) => api.delete(`/api/users/${username}/follow`);
export const getFollowers  = (username) => api.get(`/api/social/followers/${username}`);
export const getFollowing  = (username) => api.get(`/api/social/following/${username}`);

// ─── Feed ─────────────────────────────────────────────────────────────────
export const getFeed = (page = 0, size = 20) =>
    api.get('/api/feed', { params: { page, size } });

// ─── Lists ────────────────────────────────────────────────────────────────
export const createList       = (body)            => api.post('/api/lists', body);
export const addMovieToList   = (listId, movieId) => api.post(`/api/lists/${listId}/movies/${movieId}`);
export const removeFromList   = (listId, movieId) => api.delete(`/api/lists/${listId}/movies/${movieId}`);
export const deleteList       = (listId)          => api.delete(`/api/lists/${listId}`);
export const getUserLists     = (username)        => api.get(`/api/lists/user/${username}`);
export const getList          = (listId)          => api.get(`/api/lists/${listId}`);

// ─── People ───────────────────────────────────────────────────────────────
export const getPerson        = (id) => api.get(`/api/people/${id}`);
export const getFilmography   = (id) => api.get(`/api/people/${id}/filmography`);

// ─── Users ────────────────────────────────────────────────────────────────
export const searchUsers     = (query, page = 0, size = 20) =>
    api.get('/api/users/search', { params: { query, page, size } });
export const getUserProfile  = (username) => api.get(`/api/users/${username}`);
export const updateMyProfile  = (body)     => api.put('/api/users/me', body);
export const getUserStats     = (username) => api.get(`/api/users/${username}/stats`);

// ─── Admin ────────────────────────────────────────────────────────────────
export const adminGetUsers    = ()       => api.get('/api/admin/users');
export const adminDeleteUser  = (id)     => api.delete(`/api/admin/users/${id}`);
export const adminPromoteUser = (id)     => api.put(`/api/admin/users/${id}/promote`);
export const adminGetMovies   = ()       => api.get('/api/admin/movies');
export const adminDeleteMovie = (id)     => api.delete(`/api/admin/movies/${id}`);