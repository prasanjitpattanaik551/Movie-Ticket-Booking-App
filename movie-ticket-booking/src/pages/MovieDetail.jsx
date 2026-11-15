import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getMovieById,
    getShowsByMovie,
    getShowsByMovieAndCity,
    getReviewsByMovie,
    addReview,
    createOrder,
    confirmBooking,
    getAllSeatsForShow,
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

    // Seat selection state
    const [selectedShow, setSelectedShow] = useState(null);
    const [allSeats, setAllSeats] = useState([]);
    const [seatsLoading, setSeatsLoading] = useState(false);
    const [selectedSeats, setSelectedSeats] = useState([]);

    // Payment state
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [orderData, setOrderData] = useState(null);      // from create-order API
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [bookingDone, setBookingDone] = useState(null);
    const [bookingError, setBookingError] = useState("");
    const [aiMessage, setAiMessage] = useState("");

    // Group shows by theater
    const groupByTheater = (shows) => {
        const map = {};
        shows.forEach((show) => {
            const theaterId = show.screen?.theater?.id;
            if (!map[theaterId]) {
                map[theaterId] = { theater: show.screen?.theater, shows: [] };
            }
            map[theaterId].shows.push(show);
        });
        return Object.values(map);
    };

    // Group seats by type then row
    const groupSeatsByType = (seats) => {
        const map = {};
        seats.forEach((seat) => {
            const type = seat.seat?.seatType || "REGULAR";
            if (!map[type]) map[type] = [];
            map[type].push(seat);
        });
        return map;
    };

    const groupByRow = (seats) => {
        const map = {};
        seats.forEach((seat) => {
            const row = seat.seat?.seatNumber?.charAt(0) || "A";
            if (!map[row]) map[row] = [];
            map[row].push(seat);
        });
        Object.keys(map).forEach((row) => {
            map[row].sort((a, b) => {
                const numA = parseInt(a.seat?.seatNumber?.slice(1));
                const numB = parseInt(b.seat?.seatNumber?.slice(1));
                return numA - numB;
            });
        });
        return map;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const movieRes = await getMovieById(id);
                setMovie(movieRes.data);
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
            const res = city.trim()
                ? await getShowsByMovieAndCity(id, city)
                : await getShowsByMovie(id);
            setShows(res.data);
            setSelectedShow(null);
            setAllSeats([]);
            setSelectedSeats([]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectShow = async (show) => {
        setSelectedShow(show);
        setSelectedSeats([]);
        setBookingError("");
        setSeatsLoading(true);
        try {
            const res = await getAllSeatsForShow(show.id);
            setAllSeats(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setSeatsLoading(false);
        }
    };

    const toggleSeat = (seat) => {
        if (seat.status === "BOOKED" || seat.status === "LOCKED") return;
        setSelectedSeats((prev) =>
            prev.find((s) => s.id === seat.id)
                ? prev.filter((s) => s.id !== seat.id)
                : [...prev, seat]
        );
    };

    // ── STEP 1: Call create-order → get orderId + AI message ──
    const handleProceedToPayment = async () => {
        if (!isLoggedIn) { navigate("/login"); return; }
        if (selectedSeats.length === 0) {
            setBookingError("Please select at least one seat.");
            return;
        }
        setBookingError("");
        setPaymentLoading(true);
        try {
            const bookingRequest = {
                userId: user?.id,
                ShowId: selectedShow.id,
                seatIds: selectedSeats.map((s) => s.id),
                paymentMethod: "ONLINE",
            };
            const res = await createOrder(bookingRequest);
            setOrderData(res.data);
            setAiMessage(res.data.aiMessage);
            setShowPaymentForm(true);
        } catch (err) {
            setBookingError("Failed to initiate payment. Please try again.");
        } finally {
            setPaymentLoading(false);
        }
    };

    // ── STEP 2: Confirm payment → create booking ──
    const handleConfirmPayment = async () => {
        setPaymentLoading(true);
        setBookingError("");
        try {
            const bookingRequest = {
                userId: user?.id,
                ShowId: selectedShow.id,
                seatIds: selectedSeats.map((s) => s.id),
                paymentMethod: "ONLINE",
            };
            const res = await confirmBooking(orderData.orderId, bookingRequest);
            setBookingDone(res.data);
            setShowPaymentForm(false);
        } catch (err) {
            setBookingError("Booking failed. Please try again.");
        } finally {
            setPaymentLoading(false);
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

    const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);
    const theaterGroups = groupByTheater(shows);

    // ── Booking Success Screen ──
    if (bookingDone) {
        return (
            <div style={styles.page}>
                <div style={styles.successCard}>
                    <div style={{ fontSize: "52px", marginBottom: "16px" }}>✅</div>
                    <h2 style={{ color: "#fff", marginBottom: "12px" }}>Booking Confirmed!</h2>
                    {aiMessage && (
                        <div style={styles.aiBox}>
                            <p style={styles.aiText}>🤖 {aiMessage}</p>
                        </div>
                    )}
                    <div style={styles.successDetails}>
                        <p style={styles.successText}><strong>Booking #:</strong> {bookingDone.bookingNumber}</p>
                        <p style={styles.successText}><strong>Movie:</strong> {movie.title}</p>
                        <p style={styles.successText}><strong>Theater:</strong> {selectedShow?.screen?.theater?.name}</p>
                        <p style={styles.successText}><strong>Seats:</strong> {selectedSeats.map((s) => s.seat?.seatNumber).join(", ")}</p>
                        <p style={styles.successText}><strong>Amount Paid:</strong> ₹{bookingDone.totalAmount}</p>
                        <p style={styles.successText}><strong>Order ID:</strong> {orderData?.orderId}</p>
                    </div>
                    <p style={{ color: "#aaa", fontSize: "13px", marginTop: "10px" }}>
                        📧 Confirmation email sent to {user?.email}
                    </p>
                    <button
                        style={{ ...styles.redBtn, marginTop: "20px", width: "100%" }}
                        onClick={() => navigate("/my-bookings")}
                    >
                        View My Bookings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>

            {/* ── Movie Header ── */}
            <div style={styles.header}>
                <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    style={styles.posterImg}
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/160x220?text=No+Poster"; }}
                />
                <div style={styles.details}>
                    <h1 style={styles.title}>{movie.title}</h1>
                    <p style={styles.meta}>{movie.genre} • {movie.language} • {movie.durationMins} mins</p>
                    <p style={styles.desc}>{movie.description}</p>
                    <p style={styles.rating}>⭐ {movie.rating || "N/A"} / 10</p>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div style={styles.tabs}>
                <button
                    style={{ ...styles.tab, ...(activeTab === "book" ? styles.activeTab : {}) }}
                    onClick={() => { setActiveTab("book"); setSelectedShow(null); setAllSeats([]); setSelectedSeats([]); setShowPaymentForm(false); }}
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

            {/* ── BOOK TICKET TAB ── */}
            {activeTab === "book" && (
                <>
                    {/* ── PAYMENT FORM POPUP ── */}
                    {showPaymentForm && orderData && (
                        <div style={styles.overlay}>
                            <div style={styles.paymentCard}>
                                <h2 style={styles.payTitle}>💳 Payment Details</h2>

                                {/* AI Message */}
                                {aiMessage && (
                                    <div style={styles.aiBox}>
                                        <p style={styles.aiText}>🤖 {aiMessage}</p>
                                    </div>
                                )}

                                {/* Order Summary */}
                                <div style={styles.orderSummary}>
                                    <p style={styles.summaryRow}>
                                        <span style={{ color: "#aaa" }}>Movie</span>
                                        <span>{movie.title}</span>
                                    </p>
                                    <p style={styles.summaryRow}>
                                        <span style={{ color: "#aaa" }}>Theater</span>
                                        <span>{selectedShow?.screen?.theater?.name}</span>
                                    </p>
                                    <p style={styles.summaryRow}>
                                        <span style={{ color: "#aaa" }}>Seats</span>
                                        <span>{selectedSeats.map((s) => s.seat?.seatNumber).join(", ")}</span>
                                    </p>
                                    <p style={styles.summaryRow}>
                                        <span style={{ color: "#aaa" }}>Order ID</span>
                                        <span style={{ color: "#f39c12" }}>{orderData.orderId}</span>
                                    </p>
                                    <p style={{ ...styles.summaryRow, borderTop: "1px solid #333", paddingTop: "10px", marginTop: "6px" }}>
                                        <span style={{ color: "#fff", fontWeight: "bold" }}>Total Amount</span>
                                        <span style={{ color: "#f39c12", fontSize: "20px", fontWeight: "bold" }}>₹{orderData.amount}</span>
                                    </p>
                                </div>

                                {/* User Details (pre-filled) */}
                                <div style={styles.userDetails}>
                                    <p style={styles.userRow}>👤 <strong>{orderData.userName}</strong></p>
                                    <p style={styles.userRow}>📧 {orderData.userEmail}</p>
                                    <p style={styles.userRow}>📞 {orderData.userPhone || "Not set"}</p>
                                </div>

                                {bookingError && <p style={styles.errorText}>{bookingError}</p>}

                                <div style={styles.payBtnRow}>
                                    <button
                                        style={styles.cancelPayBtn}
                                        onClick={() => { setShowPaymentForm(false); setBookingError(""); }}
                                        disabled={paymentLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        style={styles.confirmPayBtn}
                                        onClick={handleConfirmPayment}
                                        disabled={paymentLoading}
                                    >
                                        {paymentLoading ? "Processing..." : `✅ Pay ₹${orderData.amount}`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── SEAT MAP VIEW ── */}
                    {selectedShow ? (
                        <div style={styles.section}>
                            <div style={styles.showInfoBar}>
                                <div>
                                    <strong style={{ color: "#fff", fontSize: "16px" }}>
                                        {selectedShow.screen?.theater?.name}
                                    </strong>
                                    <p style={styles.showMeta}>
                                        🖥️ {selectedShow.screen?.name} &nbsp;|&nbsp;
                                        🕐 {new Date(selectedShow.startTime).toLocaleString()}
                                    </p>
                                </div>
                                <button style={styles.grayBtn} onClick={() => { setSelectedShow(null); setAllSeats([]); setSelectedSeats([]); }}>
                                    ← Back
                                </button>
                            </div>

                            {seatsLoading ? (
                                <p style={styles.msg}>Loading seats...</p>
                            ) : (
                                <>
                                    <div style={styles.screenBar}>
                                        <div style={styles.screenLine}></div>
                                        <p style={styles.screenText}>All eyes this way please!</p>
                                    </div>

                                    <div style={styles.legend}>
                                        <span style={styles.legendItem}><span style={{ ...styles.dot, background: "#2ecc71", border: "2px solid #27ae60" }}></span> Available</span>
                                        <span style={styles.legendItem}><span style={{ ...styles.dot, background: "#555", border: "2px solid #444" }}></span> Sold</span>
                                        <span style={styles.legendItem}><span style={{ ...styles.dot, background: "#f39c12", border: "2px solid #e67e22" }}></span> Selected</span>
                                    </div>

                                    {Object.entries(groupSeatsByType(allSeats)).map(([type, seats]) => {
                                        const rowMap = groupByRow(seats);
                                        const pricePerSeat = seats[0]?.price;
                                        return (
                                            <div key={type} style={styles.typeSection}>
                                                <p style={styles.typeLabel}>₹{pricePerSeat} &nbsp; {type}</p>
                                                {Object.entries(rowMap).sort().map(([row, rowSeats]) => (
                                                    <div key={row} style={styles.seatRow}>
                                                        <span style={styles.rowLabel}>{row}</span>
                                                        <div style={styles.seatsInRow}>
                                                            {rowSeats.map((seat) => {
                                                                const isSelected = selectedSeats.find((s) => s.id === seat.id);
                                                                const isBooked = seat.status === "BOOKED" || seat.status === "LOCKED";
                                                                return (
                                                                    <div
                                                                        key={seat.id}
                                                                        style={{
                                                                            ...styles.seat,
                                                                            background: isBooked ? "#555" : isSelected ? "#f39c12" : "transparent",
                                                                            border: isBooked ? "2px solid #444" : isSelected ? "2px solid #e67e22" : "2px solid #2ecc71",
                                                                            color: isBooked ? "#888" : isSelected ? "#fff" : "#2ecc71",
                                                                            cursor: isBooked ? "not-allowed" : "pointer",
                                                                        }}
                                                                        onClick={() => toggleSeat(seat)}
                                                                        title={`${seat.seat?.seatNumber} - ₹${seat.price}`}
                                                                    >
                                                                        {seat.seat?.seatNumber?.slice(1)}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}

                                    {/* Booking Summary */}
                                    {selectedSeats.length > 0 && (
                                        <div style={styles.summary}>
                                            <p style={{ color: "#fff" }}>
                                                {selectedSeats.length} Ticket(s) &nbsp;|&nbsp;
                                                Seats: <strong>{selectedSeats.map((s) => s.seat?.seatNumber).join(", ")}</strong>
                                            </p>
                                            <p style={{ color: "#fff", marginTop: "6px" }}>
                                                Total: <strong style={{ color: "#f39c12", fontSize: "18px" }}>₹{totalPrice}</strong>
                                            </p>
                                            {bookingError && <p style={styles.errorText}>{bookingError}</p>}
                                            <button
                                                style={{ ...styles.redBtn, marginTop: "14px", width: "100%", padding: "14px", fontSize: "16px" }}
                                                onClick={handleProceedToPayment}
                                                disabled={paymentLoading}
                                            >
                                                {paymentLoading ? "Processing..." : `💳 Proceed to Pay ₹${totalPrice}`}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        /* ── THEATER + TIMING VIEW ── */
                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>🏟️ Select Theater & Show Time</h3>

                            <div style={styles.cityRow}>
                                <input
                                    style={styles.input}
                                    placeholder="Filter by city (e.g. Delhi)..."
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleCitySearch()}
                                />
                                <button style={styles.redBtn} onClick={handleCitySearch}>Filter</button>
                                <button style={styles.grayBtn} onClick={() => { setCity(""); getShowsByMovie(id).then((r) => setShows(r.data)); }}>Clear</button>
                            </div>

                            {theaterGroups.length === 0 ? (
                                <p style={styles.noData}>No shows available.</p>
                            ) : (
                                theaterGroups.map(({ theater, shows: theaterShows }) => (
                                    <div key={theater?.id} style={styles.theaterCard}>
                                        <div style={styles.theaterHeader}>
                                            <strong style={styles.theaterName}>🏟️ {theater?.name}</strong>
                                            <p style={styles.theaterMeta}>📍 {theater?.city} — {theater?.address}</p>
                                        </div>
                                        <div style={styles.timingsRow}>
                                            {theaterShows.map((show) => (
                                                <button
                                                    key={show.id}
                                                    style={styles.timeBtn}
                                                    onClick={() => handleSelectShow(show)}
                                                >
                                                    {new Date(show.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ── REVIEW TAB ── */}
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
                                {[1,2,3,4,5,6,7,8,9,10].map((n) => <option key={n} value={n}>{n}</option>)}
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
                            <span style={{ color: "#cc0000", cursor: "pointer" }} onClick={() => navigate("/login")}>Login</span> to write a review.
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
    posterImg: { width: "160px", height: "220px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 },
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
    theaterCard: { background: "#121212", borderRadius: "10px", padding: "16px", marginBottom: "14px", border: "1px solid #2a2a2a" },
    theaterHeader: { marginBottom: "12px" },
    theaterName: { fontSize: "16px", color: "#fff" },
    theaterMeta: { fontSize: "13px", color: "#888", marginTop: "4px" },
    timingsRow: { display: "flex", flexWrap: "wrap", gap: "10px" },
    timeBtn: { padding: "8px 16px", background: "transparent", border: "2px solid #2ecc71", color: "#2ecc71", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" },
    showInfoBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", padding: "14px 16px", background: "#121212", borderRadius: "8px" },
    showMeta: { fontSize: "13px", color: "#aaa", marginTop: "4px" },
    screenBar: { textAlign: "center", marginBottom: "24px" },
    screenLine: { height: "6px", background: "linear-gradient(to right, transparent, #aaa, transparent)", borderRadius: "50%", marginBottom: "8px" },
    screenText: { fontSize: "12px", color: "#888", letterSpacing: "2px" },
    legend: { display: "flex", gap: "20px", marginBottom: "20px", justifyContent: "center" },
    legendItem: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#aaa" },
    dot: { width: "16px", height: "16px", borderRadius: "4px", display: "inline-block" },
    typeSection: { marginBottom: "24px" },
    typeLabel: { fontSize: "13px", color: "#aaa", marginBottom: "10px", fontWeight: "bold" },
    seatRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" },
    rowLabel: { width: "20px", fontSize: "13px", color: "#888", textAlign: "center", flexShrink: 0 },
    seatsInRow: { display: "flex", flexWrap: "wrap", gap: "6px" },
    seat: { width: "36px", height: "32px", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold", userSelect: "none", transition: "all 0.15s" },
    summary: { background: "#121212", padding: "16px", borderRadius: "8px", marginTop: "20px", borderTop: "1px solid #333" },
    errorText: { color: "#e74c3c", fontSize: "13px", marginTop: "8px" },

    // Payment overlay
    overlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    paymentCard: { background: "#1e1e2e", borderRadius: "16px", padding: "32px", width: "460px", maxWidth: "95vw", border: "1px solid #333", maxHeight: "90vh", overflowY: "auto" },
    payTitle: { fontSize: "22px", color: "#fff", marginBottom: "16px", textAlign: "center" },
    aiBox: { background: "#121212", border: "1px solid #cc0000", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px" },
    aiText: { color: "#f39c12", fontSize: "13px", lineHeight: "1.6", fontStyle: "italic" },
    orderSummary: { background: "#121212", borderRadius: "8px", padding: "16px", marginBottom: "16px" },
    summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff", fontSize: "14px", marginBottom: "8px" },
    userDetails: { background: "#0f0f0f", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px" },
    userRow: { color: "#ccc", fontSize: "13px", marginBottom: "6px" },
    payBtnRow: { display: "flex", gap: "12px", marginTop: "8px" },
    cancelPayBtn: { flex: 1, padding: "12px", background: "#444", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px" },
    confirmPayBtn: { flex: 2, padding: "12px", background: "#cc0000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px", fontWeight: "bold" },

    // Success
    successCard: { background: "#1e1e2e", padding: "40px", borderRadius: "16px", textAlign: "center", maxWidth: "480px", margin: "60px auto" },
    successDetails: { background: "#121212", borderRadius: "8px", padding: "16px", margin: "16px 0", textAlign: "left" },
    successText: { color: "#ccc", marginBottom: "8px", fontSize: "14px" },

    noData: { color: "#888", fontSize: "14px" },
    reviewCard: { background: "#121212", padding: "14px", borderRadius: "8px", marginBottom: "12px" },
    reviewForm: { marginTop: "20px", borderTop: "1px solid #333", paddingTop: "16px" },
    label: { display: "block", fontSize: "13px", color: "#aaa", marginBottom: "6px" },
};

export default MovieDetail;