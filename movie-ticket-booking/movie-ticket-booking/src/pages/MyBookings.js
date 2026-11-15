import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBookingsByUser, cancelBooking } from "../services/api";
import { useAuth } from "../context/AuthContext";

const MyBookings = () => {
    const { isLoggedIn, user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoggedIn) { navigate("/login"); return; }
        fetchBookings();
    }, [isLoggedIn]);

    // GET /api/bookings/user/{userId}
    const fetchBookings = async () => {
        try {
            const res = await getBookingsByUser(user?.id);
            setBookings(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // PUT /api/bookings/cancel/{id}
    const handleCancel = async (id) => {
        if (!window.confirm("Cancel this booking?")) return;
        try {
            await cancelBooking(id);
            fetchBookings(); // refresh list
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <p style={{ textAlign: "center", marginTop: "40px" }}>Loading bookings...</p>;

    return (
        <div style={styles.page}>
            <h2 style={styles.heading}>My Bookings</h2>

            {bookings.length === 0 ? (
                <div style={styles.empty}>
                    <p>No bookings yet.</p>
                    <button style={styles.btn} onClick={() => navigate("/movies")}>Browse Movies</button>
                </div>
            ) : (
                <div style={styles.list}>
                    {bookings.map((b) => (
                        <div key={b.id} style={styles.card}>
                            <div style={styles.cardLeft}>
                                <h3 style={styles.movie}>{b.movieTitle || "Movie"}</h3>
                                <p style={styles.meta}>Booking #: <strong>{b.bookingNumber}</strong></p>
                                <p style={styles.meta}>Seats: {b.seatNumbers?.join(", ")}</p>
                                <p style={styles.meta}>Amount: ₹{b.totalAmount}</p>
                                <span style={{ ...styles.status, background: b.status === "CANCELLED" ? "#ccc" : "#28a745" }}>
                                    {b.status}
                                </span>
                            </div>
                            <div>
                                {b.status !== "CANCELLED" && (
                                    <button style={styles.cancelBtn} onClick={() => handleCancel(b.id)}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    page: { padding: "24px 32px", maxWidth: "800px", margin: "0 auto" },
    heading: { fontSize: "24px", marginBottom: "20px", color: "#333" },
    list: { display: "flex", flexDirection: "column", gap: "16px" },
    card: { background: "#fff", borderRadius: "10px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" },
    cardLeft: {},
    movie: { fontSize: "18px", color: "#222", marginBottom: "8px" },
    meta: { fontSize: "13px", color: "#666", marginBottom: "4px" },
    status: { display: "inline-block", padding: "3px 10px", borderRadius: "12px", color: "#fff", fontSize: "12px", marginTop: "8px" },
    cancelBtn: { padding: "8px 18px", background: "#cc0000", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" },
    empty: { textAlign: "center", marginTop: "60px", color: "#999" },
    btn: { marginTop: "16px", padding: "10px 24px", background: "#cc0000", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" },
};

export default MyBookings;