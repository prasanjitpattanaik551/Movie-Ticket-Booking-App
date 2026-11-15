import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllMovies, searchMovies, getMoviesByGenre, getMoviesByLanguage } from "../services/api";

const Movies = () => {
    const [movies, setMovies] = useState([]);
    const [search, setSearch] = useState("");
    const [genre, setGenre] = useState("");
    const [language, setLanguage] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Load all movies on mount → GET /api/movies
    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        setLoading(true);
        try {
            const res = await getAllMovies();
            setMovies(res.data);
        } catch (err) {
            console.error("Failed to load movies", err);
        } finally {
            setLoading(false);
        }
    };

    // Search → GET /api/movies/search?title=
    const handleSearch = async () => {
        if (!search.trim()) return fetchMovies();
        setLoading(true);
        try {
            const res = await searchMovies(search);
            setMovies(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Filter by genre → GET /api/movies/genre/{genre}
    const handleGenreFilter = async (g) => {
        setGenre(g);
        setLoading(true);
        try {
            const res = g ? await getMoviesByGenre(g) : await getAllMovies();
            setMovies(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Filter by language → GET /api/movies/language/{language}
    const handleLanguageFilter = async (l) => {
        setLanguage(l);
        setLoading(true);
        try {
            const res = l ? await getMoviesByLanguage(l) : await getAllMovies();
            setMovies(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <h2 style={styles.heading}>Now Showing</h2>

            {/* Search Bar */}
            <div style={styles.searchBar}>
                <input
                    style={styles.searchInput} placeholder="Search movies..."
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <button style={styles.searchBtn} onClick={handleSearch}>Search</button>
            </div>

            {/* Filters */}
            <div style={styles.filters}>
                <select style={styles.select} value={genre} onChange={(e) => handleGenreFilter(e.target.value)}>
                    <option value="">All Genres</option>
                    <option value="Action">Action</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Drama">Drama</option>
                    <option value="Horror">Horror</option>
                    <option value="Romance">Romance</option>
                </select>
                <select style={styles.select} value={language} onChange={(e) => handleLanguageFilter(e.target.value)}>
                    <option value="">All Languages</option>
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                    <option value="Odia">Odia</option>
                    <option value="Japanese">Japanese</option>
                </select>
            </div>

            {/* Movie Grid */}
            {loading ? (
                <p style={styles.msg}>Loading movies...</p>
            ) : movies.length === 0 ? (
                <p style={styles.msg}>No movies found.</p>
            ) : (
                <div style={styles.grid}>
                    {movies.map((movie) => (
                        <div key={movie.id} style={styles.card} onClick={() => navigate(`/movies/${movie.id}`)}>
                            <img
                                src={movie.posterUrl}
                                alt={movie.title}
                                style={{ width: "100%", height: "300px", objectFit: "cover" }}
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/200x160?text=No+Poster"; }}
                            />
                            <div style={styles.info}>
                                <h3 style={styles.title}>{movie.title}</h3>
                                <p style={styles.meta}>{movie.genre} • {movie.language}</p>
                                <p style={styles.rating}>⭐ {movie.rating || "N/A"}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    page: { padding: "24px 32px", maxWidth: "1100px", margin: "0 auto" },
    heading: { fontSize: "24px", marginBottom: "20px", color: "#333" },
    searchBar: { display: "flex", gap: "10px", marginBottom: "16px" },
    searchInput: { flex: 1, padding: "10px 14px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" },
    searchBtn: { padding: "10px 20px", background: "#cc0000", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" },
    filters: { display: "flex", gap: "12px", marginBottom: "24px" },
    select: { padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" },
    card: { background: "#fff", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", overflow: "hidden", cursor: "pointer", transition: "transform 0.2s", ":hover": { transform: "scale(1.03)" } },
    poster: { background: "#222", height: "160px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" },
    info: { padding: "12px" },
    title: { fontSize: "15px", fontWeight: "bold", marginBottom: "4px", color: "#222" },
    meta: { fontSize: "12px", color: "#888", marginBottom: "4px" },
    rating: { fontSize: "13px", color: "#f5a623" },
    msg: { textAlign: "center", color: "#999", marginTop: "40px" },
};

export default Movies;