import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getMovieById,
    getShowsByMovie,
    getShowsByMovieAndCity,
    getReviewsByMovie,
    addReview,
    createBooking,
} from "../services/api";
import { useAuth } from "../context/AuthContext";

const MovieDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn, user } = useAuth();

    const [movie, setMovie] = useState(null);
    const [city, setCity] = useState("");
    const [shows, setShows] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("book");

    const [selectedShow, setSelectedShow] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [bookingDone, setBookingDone] = useState(null);
    const [bookingError, setBookingError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const movieRes = await getMovieById(id);
                setMovie(movieRes.data);

                // auto load all shows for this movie
                const showsRes = await getShowsByMovie(id);
                setShows(showsRes.data);

                const reviewRes = await getReviewsByMovie(id);
                setReviews(reviewRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleCitySearch = async () => {
        try {
            if (!city.trim()) {
                const showsRes = await getShowsByMovie(id);
                setShows(showsRes.data);
            } else {
                const res = await getShowsByMovieAndCity(id, city);
                setShows(res.data);
            }
            setSelectedShow(null);
            setSelectedSeats([]);
        } catch (err) {
            console.error(err);
        }
    };

    const toggleSeat = (seat) => {
        if (seat.status === "BOOKED") return;
        setSelectedSeats((prev) =>
            prev.find((s) => s.id === seat.id)
                ? prev.filter((s) => s.id !== seat.id)
                : [...prev, seat]
        );
    };

    const handleBooking = async () => {
        if (!isLoggedIn) { navigate("/login"); return; }
        if (selectedSeats.length === 0) {
            setBookingError("Please select at least one seat.");
            return;
        }
        setBookingError("");
        try {
            const bookingRequest = {
                userId: user?.id,
                ShowId: selectedShow.id,
                seatIds: selectedSeats.map((s) => s.id),
                paymentMethod: "CARD",
            };
            const res = await createBooking(bookingRequest);
            setBookingDone(res.data);
        } catch (err) {
            setBookingError(err.response?.data?.message || "Booking failed.");
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!isLoggedIn) { navigate("/login"); return; }
        try {
            await addReview({ ...reviewForm, movieId: Number(id), userId: user?.id });
            const reviewRes = await getReviewsByMovie(id);
            setReviews(reviewRes.data);
            setReviewForm({ rating: 5, comment: "" });
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <p style={styles.msg}>Loading...</p>;
    if (!movie) return <p style={styles.msg}>Movie not found.</p>;

    if (bookingDone) {
        return (
            <div style={styles.page}>
                <div style={styles.successCard}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
                    <h2>Booking Confirmed!</h2>
                    <p><strong>Booking #:</strong> {bookingDone.bookingNumber}</p>
                    <p><strong>Seats:</strong> {selectedSeats.map((s) => s.seat?.seatNumber).join(", ")}</p>
                    <p><strong>Total:</strong> ₹{bookingDone.totalAmount}</p>
                    <button style={styles.redBtn} onClick={() => navigate("/my-bookings")}>
                        View My Bookings
                    </button>
                </div>
            </div>
        );
    }

    const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

    return (
        <div style={styles.page}>

            {/* Movie Header */}
            <div style={styles.header}>
                <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    style={{ width: "160px", height: "220px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 }}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/160x220?text=No+Poster"; }}
                />
                <div style={styles.details}>
                    <h1 style={styles.title}>{movie.title}</h1>
                    <p style={styles.meta}>
                        {movie.genre} • {movie.language} • {movie.durationMins} mins
                    </p>
                    <p style={styles.desc}>{movie.description}</p>
                    <p style={styles.rating}>⭐ {movie.rating || "N/A"} / 10</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
                <button
                    style={{ ...styles.tab, ...(activeTab === "book" ? styles.activeTab : {}) }}
                    onClick={() => setActiveTab("book")}
                >
                    🎟️ Book Ticket
                </button>
                <button
                    style={{ ...styles.tab, ...(activeTab === "review" ? styles.activeTab : {}) }}
                    onClick={() => setActiveTab("review")}
                >
                    ⭐ Reviews ({reviews.length})
                </button>
            </div>

            {/* BOOK TICKET TAB */}
            {activeTab === "book" && (
                <div style={styles.section}>

                    {!selectedShow && (
                        <>
                            <h3 style={styles.sectionTitle}>🏟️ Theaters Showing This Movie</h3>

                            {/* City Filter */}
                            <div style={styles.cityRow}>
                                <input
                                    style={styles.input}
                                    placeholder="Filter by city (e.g. Delhi)..."
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleCitySearch()}
                                />
                                <button style={styles.redBtn} onClick={handleCitySearch}>Filter</button>
                                <button style={styles.grayBtn} onClick={() => {
                                    setCity("");
                                    getShowsByMovie(id).then((r) => setShows(r.data));
                                }}>Clear</button>
                            </div>

                            {/* Theater List */}
                            {shows.length === 0 ? (
                                <p style={styles.noData}>No shows available.</p>
                            ) : (
                                shows.map((show) => (
                                    <div key={show.id} style={styles.showCard}>
                                        <div>
                                            <strong style={styles.theaterName}>
                                                🏟️ {show.screen?.theater?.name}
                                            </strong>
                                            <p style={styles.showMeta}>
                                                📍 {show.screen?.theater?.city} &nbsp;|&nbsp;
                                                🖥️ Screen: {show.screen?.name} &nbsp;|&nbsp;
                                                🕐 {new Date(show.startTime).toLocaleString()}
                                            </p>
                                            <p style={styles.availableText}>
                                                ✅ {show.availableSeats?.length || 0} seats available
                                            </p>
                                        </div>
                                        <button
                                            style={styles.redBtn}
                                            onClick={() => {
                                                setSelectedShow(show);
                                                setSelectedSeats([]);
                                                setBookingError("");
                                            }}
                                        >
                                            Select Seats
                                        </button>
                                    </div>
                                ))
                            )}
                        </>
                    )}

                    {/* Seat Map */}
                    {selectedShow && (
                        <>
                            <div style={styles.showInfoBar}>
                                <div>
                                    <strong style={{ color: "#fff" }}>{selectedShow.screen?.theater?.name}</strong>
                                    <p style={styles.showMeta}>
                                        {selectedShow.screen?.name} &nbsp;|&nbsp;
                                        {new Date(selectedShow.startTime).toLocaleString()}
                                    </p>
                                </div>
                                <button style={styles.grayBtn} onClick={() => { setSelectedShow(null); setSelectedSeats([]); }}>
                                    ← Back
                                </button>
                            </div>

                            {/* Legend */}
                            <div style={styles.legend}>
                                <span style={styles.legendItem}>
                                    <span style={{ ...styles.dot, background: "#2ecc71" }}></span> Available
                                </span>
                                <span style={styles.legendItem}>
                                    <span style={{ ...styles.dot, background: "#e74c3c" }}></span> Booked
                                </span>
                                <span style={styles.legendItem}>
                                    <span style={{ ...styles.dot, background: "#f39c12" }}></span> Selected
                                </span>
                            </div>

                            {/* Screen */}
                            <div style={styles.screen}>🎬 SCREEN</div>

                            {/* Seats */}
                            <div style={styles.seatsGrid}>
                                {selectedShow.availableSeats?.length > 0 ? (
                                    selectedShow.availableSeats.map((seat) => {
                                        const isSelected = selectedSeats.find((s) => s.id === seat.id);
                                        const isBooked = seat.status === "BOOKED";
                                        return (
                                            <div
                                                key={seat.id}
                                                style={{
                                                    ...styles.seat,
                                                    background: isBooked ? "#e74c3c" : isSelected ? "#f39c12" : "#2ecc71",
                                                    cursor: isBooked ? "not-allowed" : "pointer",
                                                    opacity: isBooked ? 0.6 : 1,
                                                }}
                                                onClick={() => toggleSeat(seat)}
                                                title={`${seat.seat?.seatNumber} - ${seat.seat?.seatType} - ₹${seat.price}`}
                                            >
                                                {seat.seat?.seatNumber}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p style={styles.noData}>No seats available for this show.</p>
                                )}
                            </div>

                            {/* Summary */}
                            {selectedSeats.length > 0 && (
                                <div style={styles.summary}>
                                    <p style={{ color: "#fff" }}>
                                        Selected: <strong>{selectedSeats.map((s) => s.seat?.seatNumber).join(", ")}</strong>
                                    </p>
                                    <p style={{ color: "#fff" }}>Total: <strong>₹{totalPrice}</strong></p>
                                    {bookingError && <p style={{ color: "#e74c3c", marginTop: "8px" }}>{bookingError}</p>}
                                    <button
                                        style={{ ...styles.redBtn, marginTop: "12px", width: "100%" }}
                                        onClick={handleBooking}
                                    >
                                        ✅ Confirm Booking
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* REVIEW TAB */}
            {activeTab === "review" && (
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Reviews</h3>

                    {reviews.length === 0 ? (
                        <p style={styles.noData}>No reviews yet. Be the first!</p>
                    ) : (
                        reviews.map((r, i) => (
                            <div key={i} style={styles.reviewCard}>
                                <strong>⭐ {r.rating}/10</strong>
                                <p style={{ marginTop: "6px", color: "#ccc" }}>{r.comment}</p>
                            </div>
                        ))
                    )}

                    {isLoggedIn ? (
                        <form onSubmit={handleReviewSubmit} style={styles.reviewForm}>
                            <h4 style={{ marginBottom: "12px", color: "#fff" }}>Add Your Review</h4>
                            <label style={styles.label}>Rating</label>
                            <select
                                style={styles.input}
                                value={reviewForm.rating}
                                onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                            <label style={styles.label}>Comment</label>
                            <textarea
                                style={{ ...styles.input, height: "80px", resize: "vertical" }}
                                placeholder="Write your review..."
                                value={reviewForm.comment}
                                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                            />
                            <button style={styles.redBtn} type="submit">Submit Review</button>
                        </form>
                    ) : (
                        <p style={styles.noData}>
                            <span style={{ color: "#cc0000", cursor: "pointer" }} onClick={() => navigate("/login")}>
                                Login
                            </span>{" "}to write a review.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    page: { padding: "24px 32px", maxWidth: "900px", margin: "0 auto", color: "#fff" },
    msg: { textAlign: "center", marginTop: "40px", color: "#999" },
    header: { display: "flex", gap: "24px", marginBottom: "28px" },
    posterBox: { width: "160px", height: "220px", background: "#1e1e2e", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "56px", flexShrink: 0 },
    details: { flex: 1 },
    title: { fontSize: "28px", color: "#fff", marginBottom: "8px" },
    meta: { color: "#aaa", fontSize: "14px", marginBottom: "10px" },
    desc: { color: "#ccc", lineHeight: "1.6", marginBottom: "12px" },
    rating: { fontSize: "18px", color: "#f5a623" },
    tabs: { display: "flex", gap: "12px", marginBottom: "20px" },
    tab: { padding: "10px 24px", background: "#1e1e2e", color: "#aaa", border: "1px solid #333", borderRadius: "8px", cursor: "pointer", fontSize: "15px" },
    activeTab: { background: "#cc0000", color: "#fff", border: "1px solid #cc0000" },
    section: { background: "#1e1e2e", borderRadius: "12px", padding: "24px", marginBottom: "20px" },
    sectionTitle: { fontSize: "18px", marginBottom: "16px", color: "#fff" },
    cityRow: { display: "flex", gap: "10px", marginBottom: "16px" },
    input: { display: "block", width: "100%", padding: "10px 12px", border: "1px solid #333", borderRadius: "6px", fontSize: "14px", marginBottom: "10px", boxSizing: "border-box", background: "#121212", color: "#fff" },
    redBtn: { padding: "10px 20px", background: "#cc0000", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", whiteSpace: "nowrap" },
    grayBtn: { padding: "10px 16px", background: "#444", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", whiteSpace: "nowrap" },
    showCard: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", border: "1px solid #333", borderRadius: "10px", marginBottom: "12px", background: "#121212" },
    theaterName: { fontSize: "16px", color: "#fff", display: "block", marginBottom: "6px" },
    showMeta: { fontSize: "13px", color: "#aaa", marginTop: "4px" },
    availableText: { fontSize: "12px", color: "#2ecc71", marginTop: "6px" },
    noData: { color: "#888", fontSize: "14px" },
    showInfoBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", padding: "14px 16px", background: "#121212", borderRadius: "8px" },
    legend: { display: "flex", gap: "20px", marginBottom: "16px" },
    legendItem: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#aaa" },
    dot: { width: "14px", height: "14px", borderRadius: "3px", display: "inline-block" },
    screen: { background: "#333", color: "#aaa", textAlign: "center", padding: "8px", borderRadius: "6px", marginBottom: "24px", fontSize: "13px", letterSpacing: "4px" },
    seatsGrid: { display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px", justifyContent: "center" },
    seat: { width: "52px", height: "42px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold", color: "#fff", userSelect: "none" },
    summary: { background: "#121212", padding: "16px", borderRadius: "8px", marginTop: "8px" },
    reviewCard: { background: "#121212", padding: "14px", borderRadius: "8px", marginBottom: "12px" },
    reviewForm: { marginTop: "20px", borderTop: "1px solid #333", paddingTop: "16px" },
    label: { display: "block", fontSize: "13px", color: "#aaa", marginBottom: "6px" },
    successCard: { background: "#1e1e2e", padding: "48px", borderRadius: "12px", textAlign: "center", maxWidth: "400px", margin: "80px auto", color: "#fff" },
};

export default MovieDetail;