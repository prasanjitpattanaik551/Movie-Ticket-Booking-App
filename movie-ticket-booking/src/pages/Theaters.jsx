import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllTheaters, getTheatersByCity, getShowsByMovie, getAllShows } from "../services/api";

const Theaters = () => {
    const [theaters, setTheaters] = useState([]);
    const [city, setCity] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedTheater, setSelectedTheater] = useState(null);
    const [theaterShows, setTheaterShows] = useState([]);
    const [showsLoading, setShowsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTheaters();
    }, []);

    const fetchTheaters = async () => {
        setLoading(true);
        try {
            const res = await getAllTheaters();
            setTheaters(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCityFilter = async () => {
        if (!city.trim()) return fetchTheaters();
        setLoading(true);
        try {
            const res = await getTheatersByCity(city);
            setTheaters(res.data);
            setSelectedTheater(null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // When user clicks a theater, load all shows and filter by theater
    const handleTheaterClick = async (theater) => {
        setSelectedTheater(theater);
        setShowsLoading(true);
        try {
            const res = await getAllShows();
            // filter shows that belong to this theater
            const filtered = res.data.filter(
                (show) => show.screen?.theater?.id === theater.id
            );
            setTheaterShows(filtered);
        } catch (err) {
            console.error(err);
        } finally {
            setShowsLoading(false);
        }
    };

    // Group shows by movie
    const groupByMovie = (shows) => {
        const map = {};
        shows.forEach((show) => {
            const movieId = show.movie?.id;
            if (!map[movieId]) {
                map[movieId] = {
                    movie: show.movie,
                    shows: [],
                };
            }
            map[movieId].shows.push(show);
        });
        return Object.values(map);
    };

    return (
        <div style={styles.page}>

            {/* Theater List View */}
            {!selectedTheater && (
                <>
                    <h2 style={styles.heading}>Theaters</h2>

                    <div style={styles.filterRow}>
                        <input
                            style={styles.input}
                            placeholder="Filter by city..."
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCityFilter()}
                        />
                        <button style={styles.redBtn} onClick={handleCityFilter}>Search</button>
                        <button style={styles.grayBtn} onClick={() => { setCity(""); fetchTheaters(); }}>Clear</button>
                    </div>

                    {loading ? (
                        <p style={styles.msg}>Loading theaters...</p>
                    ) : theaters.length === 0 ? (
                        <p style={styles.msg}>No theaters found.</p>
                    ) : (
                        <div style={styles.grid}>
                            {theaters.map((t) => (
                                <div
                                    key={t.id}
                                    style={styles.card}
                                    onClick={() => handleTheaterClick(t)}
                                >
                                    <h3 style={styles.theaterName}>🏟️ {t.name}</h3>
                                    <p style={styles.meta}>📍 {t.city}</p>
                                    <p style={styles.meta}>{t.address}</p>
                                    <p style={styles.clickHint}>Click to see movies →</p>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Theater Detail - Movies Running */}
            {selectedTheater && (
                <>
                    <div style={styles.theaterHeader}>
                        <div>
                            <h2 style={styles.heading}>🏟️ {selectedTheater.name}</h2>
                            <p style={styles.meta}>📍 {selectedTheater.city} — {selectedTheater.address}</p>
                        </div>
                        <button style={styles.grayBtn} onClick={() => { setSelectedTheater(null); setTheaterShows([]); }}>
                            ← Back
                        </button>
                    </div>

                    <h3 style={styles.subHeading}>Movies Now Showing</h3>

                    {showsLoading ? (
                        <p style={styles.msg}>Loading movies...</p>
                    ) : theaterShows.length === 0 ? (
                        <p style={styles.msg}>No movies currently showing at this theater.</p>
                    ) : (
                        <div style={styles.movieList}>
                            {groupByMovie(theaterShows).map(({ movie, shows }) => (
                                <div key={movie?.id} style={styles.movieCard}>
                                    {/* Movie Poster + Info */}
                                    <div style={styles.movieLeft}>
                                        <img
                                            src={movie?.posterUrl}
                                            alt={movie?.title}
                                            style={styles.poster}
                                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/80x110?text=No+Poster"; }}
                                        />
                                        <div>
                                            <h3 style={styles.movieTitle}>{movie?.title}</h3>
                                            <p style={styles.movieMeta}>{movie?.genre} • {movie?.language} • {movie?.durationMins} mins</p>

                                            {/* Show timings */}
                                            <div style={styles.timings}>
                                                {shows.map((show) => (
                                                    <span
                                                        key={show.id}
                                                        style={styles.timeTag}
                                                        onClick={() => navigate(`/movies/${movie?.id}`)}
                                                        title="Click to book"
                                                    >
                            🕐 {new Date(show.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        style={styles.redBtn}
                                        onClick={() => navigate(`/movies/${movie?.id}`)}
                                    >
                                        Book Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const styles = {
    page: { padding: "24px 32px", maxWidth: "1000px", margin: "0 auto", color: "#fff" },
    heading: { fontSize: "24px", marginBottom: "8px", color: "#fff" },
    subHeading: { fontSize: "18px", marginBottom: "16px", color: "#aaa" },
    meta: { fontSize: "13px", color: "#aaa", marginBottom: "4px" },
    filterRow: { display: "flex", gap: "10px", marginBottom: "24px" },
    input: { flex: 1, padding: "10px 14px", border: "1px solid #333", borderRadius: "6px", fontSize: "14px", background: "#1e1e2e", color: "#fff" },
    redBtn: { padding: "10px 20px", background: "#cc0000", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", whiteSpace: "nowrap" },
    grayBtn: { padding: "10px 16px", background: "#444", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", whiteSpace: "nowrap" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" },
    card: { background: "#1e1e2e", padding: "20px", borderRadius: "10px", cursor: "pointer", border: "1px solid #333", transition: "border 0.2s" },
    theaterName: { fontSize: "16px", color: "#fff", marginBottom: "8px" },
    clickHint: { fontSize: "12px", color: "#cc0000", marginTop: "12px" },

    theaterHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" },

    movieList: { display: "flex", flexDirection: "column", gap: "16px" },
    movieCard: { background: "#1e1e2e", borderRadius: "12px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #333" },
    movieLeft: { display: "flex", gap: "16px", alignItems: "flex-start" },
    poster: { width: "70px", height: "100px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 },
    movieTitle: { fontSize: "18px", color: "#fff", marginBottom: "6px" },
    movieMeta: { fontSize: "13px", color: "#aaa", marginBottom: "10px" },
    timings: { display: "flex", flexWrap: "wrap", gap: "8px" },
    timeTag: { padding: "4px 10px", background: "#121212", border: "1px solid #444", borderRadius: "4px", fontSize: "12px", color: "#ccc", cursor: "pointer" },

    msg: { textAlign: "center", color: "#888", marginTop: "40px" },
};

export default Theaters;