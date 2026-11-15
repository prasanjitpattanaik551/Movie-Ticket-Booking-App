import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { isLoggedIn, logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav style={styles.nav}>
            <Link to="/" style={styles.logo}>🎬MovieTicketBookingApp</Link>

            <div style={styles.links}>
                <Link to="/movies" style={styles.link}>Movies</Link>
                <Link to="/theaters" style={styles.link}>Theaters</Link>

                {isLoggedIn ? (
                    <>
                        <Link to="/my-bookings" style={styles.link}>My Bookings</Link>
                        <Link to="/profile" style={styles.link}>Profile</Link>
                        {/* <span style={styles.email}>{user?.email}</span> */}
                        <button onClick={handleLogout} style={styles.btn}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={styles.link}>Login</Link>
                        <Link to="/register" style={styles.btnLink}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

const styles = {
    nav: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 40px",
        background: "linear-gradient(90deg, #0B0F19, #111827)",
        color: "#F9FAFB",
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
    },

    logo: {
        color: "#D4AF37", // GOLD ✨
        textDecoration: "none",
        fontWeight: "700",
        fontSize: "22px",
        letterSpacing: "1px",
    },

    links: {
        display: "flex",
        alignItems: "center",
        gap: "24px",
    },

    link: {
        color: "#E5E7EB",
        textDecoration: "none",
        fontSize: "14px",
        transition: "0.3s",
    },

    btnLink: {
        color: "#D4AF37",
        textDecoration: "none",
        fontSize: "14px",
        border: "1px solid #D4AF37",
        padding: "6px 16px",
        borderRadius: "8px",
        transition: "0.3s",
    },

    btn: {
        background: "linear-gradient(135deg, #D4AF37, #FACC15)",
        border: "none",
        color: "#111827",
        padding: "6px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "600",
        transition: "0.3s",
    },

    email: {
        fontSize: "13px",
        color: "#9CA3AF",
    },
};

export default Navbar;