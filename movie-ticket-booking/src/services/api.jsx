import axios from "axios";

const BASE_URL = "http://localhost:8081/api";

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─────────────────────────────────────────
// USER APIs  →  /api/users
// ─────────────────────────────────────────
export const registerUser = (userDto) =>
    api.post("/users/register", userDto);

export const loginUser = (loginRequestDto) =>
    api.post("/users/login", loginRequestDto);

export const getUserById = (id) =>
    api.get(`/users/${id}`);

export const getAllUsers = () =>
    api.get("/users");

export const updateUser = (id, userDto) =>
    api.put(`/users/${id}`, userDto);

export const deleteUser = (id) =>
    api.delete(`/users/${id}`);

// ─────────────────────────────────────────
// MOVIE APIs  →  /api/movies
// ─────────────────────────────────────────
export const getAllMovies = () =>
    api.get("/movies");

export const getMovieById = (id) =>
    api.get(`/movies/${id}`);

export const createMovie = (movieDto) =>
    api.post("/movies", movieDto);

export const updateMovie = (id, movieDto) =>
    api.put(`/movies/${id}`, movieDto);

export const deleteMovie = (id) =>
    api.delete(`/movies/${id}`);

export const getMoviesByLanguage = (language) =>
    api.get(`/movies/language/${language}`);

export const getMoviesByGenre = (genre) =>
    api.get(`/movies/genre/${genre}`);

export const searchMovies = (title) =>
    api.get(`/movies/search?title=${title}`);

// ─────────────────────────────────────────
// SHOW APIs  →  /api/shows
// ─────────────────────────────────────────
export const getAllShows = () =>
    api.get("/shows");

export const getShowById = (id) =>
    api.get(`/shows/${id}`);

export const getShowsByMovie = (movieId) =>
    api.get(`/shows/movie/${movieId}`);

export const getShowsByMovieAndCity = (movieId, city) =>
    api.get(`/shows/movie/${movieId}/city/${city}`);

export const getShowsByDateRange = (start, end) =>
    api.get(`/shows/range?start=${start}&end=${end}`);

export const createShow = (showDto) =>
    api.post("/shows", showDto);

export const getAllSeatsForShow = (showId) =>
    api.get(`/shows/${showId}/seats`);

// ─────────────────────────────────────────
// THEATER APIs  →  /api/theaters
// ─────────────────────────────────────────
export const getAllTheaters = () =>
    api.get("/theaters");

export const getTheaterById = (id) =>
    api.get(`/theaters/${id}`);

export const getTheatersByCity = (city) =>
    api.get(`/theaters/city/${city}`);

export const createTheater = (theaterDto) =>
    api.post("/theaters", theaterDto);

export const updateTheater = (id, theaterDto) =>
    api.put(`/theaters/${id}`, theaterDto);

export const deleteTheater = (id) =>
    api.delete(`/theaters/${id}`);

// ─────────────────────────────────────────
// BOOKING APIs  →  /api/bookings
// ─────────────────────────────────────────
export const createBooking = (bookingRequestDto) =>
    api.post("/bookings", bookingRequestDto);

export const getBookingById = (id) =>
    api.get(`/bookings/${id}`);

export const getBookingByNumber = (bookingNumber) =>
    api.get(`/bookings/number/${bookingNumber}`);

export const getBookingsByUser = (userId) =>
    api.get(`/bookings/user/${userId}`);

export const cancelBooking = (id) =>
    api.put(`/bookings/cancel/${id}`);

export const createOrder = (bookingRequestDto) =>
    api.post("/bookings/create-order", bookingRequestDto);

export const confirmBooking = (orderId, bookingRequestDto) =>
    api.post(`/bookings/confirm?orderId=${orderId}`, bookingRequestDto);

// ─────────────────────────────────────────
// REVIEW APIs  →  /api/reviews
// ─────────────────────────────────────────
export const addReview = (reviewDto) =>
    api.post("/reviews", reviewDto);

export const getReviewsByMovie = (movieId) =>
    api.get(`/reviews/movie/${movieId}`);

export const getReviewsByUser = (userId) =>
    api.get(`/reviews/user/${userId}`);


export const sendOtp = (email) =>
    api.post(`/users/send-otp?email=${email}`);

export const verifyOtp = (email, otp) =>
    api.post(`/users/verify-otp?email=${email}&otp=${otp}`);

export default api;