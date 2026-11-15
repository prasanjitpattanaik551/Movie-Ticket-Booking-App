import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getShowById, createBooking } from "../services/api";
import { useAuth } from "../context/AuthContext";

const BookingPage = () => {
    const { showId } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn, user } = useAuth();

    const [show, setShow] = useState(null);
    const [seats, setSeats] = useState("");   // comma-separated seat numbers
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(null);
    const [error, setError] = useState("");

    // Redirect to login if not logged in
    useEffect(() => {
        if (!isLoggedIn) navigate("/login");
    }, [isLoggedIn]);

    // GET /api/shows/{id}
    useEffect(() => {
        const fetchShow = async () => {
            try {
                const res = await getShowById(showId);
                setShow(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchShow();
    }, [showId]);

    // POST /api/bookings
    const handleBook = async () => {
        if (!seats.trim()) {
            setError("Please enter seat numbers.");
            return;
        }
        setError("");
        const seatList = seats.split(",").map((s) => s.trim());

        const bookingRequest = {
            showId: Number(showId),
            seatNumbers: seatList,
            // userId will be resolved by backend from JWT token
        };

        try {
            const res = await createBooking(bookingRequest);
            setBooking(res.data); // BookingDto returned
        } catch (err) {
            setError(err.response?.data?.message || "Booking failed. Seats may be unavailable.");
        }
    };

    if (loading) return <p style={{ textAlign: "center", marginTop: "40px" }}>Loading show...</p>;
    if (!show) return <p style={{ textAlign: "center" }}>Show not found.</p>;

    // ── Booking Confirmed Screen ──
    if (booking) {
        return (
            <div style={styles.page}>
                <div style={styles.successCard}>
                    <div style={styles.tick}>✅</div>
                    <h2>Booking Confirmed!</h2>
                    <p><strong>Booking Number:</strong> {booking.bookingNumber}</p>
                    <p><strong>Show:</strong> {show.movieTitle}</p>
                    <p><strong>Seats:</strong> {booking.seatNumbers?.join(", ")}</p>
                    <p><strong>Total Amount:</strong> ₹{booking.totalAmount}</p>
                    <button style={styles.btn} onClick={() => navigate("/my-bookings")}>
                        View My Bookings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h2 style={styles.title}>Book Tickets</h2>

                {/* Show Info */}
                <div style={styles.showInfo}>
                    <p><strong>Movie:</strong> {show.movieTitle}</p>
                    <p><strong>Theater:</strong> {show.theaterName}</p>
                    <p><strong>Screen:</strong> {show.screenName}</p>
                    <p><strong>Time:</strong> {show.showTime}</p>
                    <p><strong>Price per seat:</strong> ₹{show.price}</p>
                </div>

                {/* Seat Input */}
                <label style={styles.label}>Enter Seat Numbers (comma-separated)</label>
                <input
                    style={styles.input}
                    placeholder="e.g. A1, A2, B3"
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                />

                {error && <p style={styles.error}>{error}</p>}

                <button style={styles.btn} onClick={handleBook}>
                    Confirm Booking
                </button>
            </div>
        </div>
    );
};

const styles = {
    page: { minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" },
    card: { background: "#fff", padding: "36px", borderRadius: "12px", width: "420px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" },
    title: { color: "#cc0000", marginBottom: "20px" },
    showInfo: { background: "#f9f9f9", padding: "14px", borderRadius: "8px", marginBottom: "20px", lineHeight: "2", fontSize: "14px" },
    label: { display: "block", fontSize: "14px", color: "#555", marginBottom: "6px" },
    input: { display: "block", width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", marginBottom: "16px", boxSizing: "border-box" },
    btn: { width: "100%", padding: "12px", background: "#cc0000", color: "#fff", border: "none", borderRadius: "6px", fontSize: "15px", cursor: "pointer" },
    error: { color: "red", fontSize: "13px", marginBottom: "10px" },
    successCard: { background: "#fff", padding: "48px", borderRadius: "12px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.1)", maxWidth: "400px" },
    tick: { fontSize: "48px", marginBottom: "16px" },
};

export default BookingPage;