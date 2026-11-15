import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();

    return (
        <div>
            {/* Hero */}
            <div style={styles.hero}>
                <h1 style={styles.heroTitle}>Book Movie Tickets Online</h1>
                <p style={styles.heroSub}>Find shows near you and book instantly</p>
                <button style={styles.heroBtn} onClick={() => navigate("/movies")}>
                    Browse Movies
                </button>
            </div>

            {/* Quick Links */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Explore</h2>
                <div style={styles.grid}>
                    <div style={styles.card} onClick={() => navigate("/movies")}>
                        <div style={styles.icon}>🎬</div>
                        <h3>Movies</h3>
                        <p>Browse now showing & upcoming movies</p>
                    </div>
                    <div style={styles.card} onClick={() => navigate("/theaters")}>
                        <div style={styles.icon}>🏟️</div>
                        <h3>Theaters</h3>
                        <p>Find theaters near your city</p>
                    </div>
                    <div style={styles.card} onClick={() => navigate("/my-bookings")}>
                        <div style={styles.icon}>🎟️</div>
                        <h3>My Bookings</h3>
                        <p>View and manage your bookings</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    hero: { background: "linear-gradient(135deg, #cc0000, #880000)", color: "#fff", padding: "80px 32px", textAlign: "center" },
    heroTitle: { fontSize: "40px", fontWeight: "bold", marginBottom: "12px" },
    heroSub: { fontSize: "18px", opacity: 0.85, marginBottom: "28px" },
    heroBtn: { padding: "14px 36px", background: "#fff", color: "#cc0000", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" },
    section: { padding: "40px 32px", maxWidth: "900px", margin: "0 auto" },
    sectionTitle: { fontSize: "22px", marginBottom: "24px", color: "#333" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" },
    card: { background: "#fff", padding: "28px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", cursor: "pointer", textAlign: "center", transition: "transform 0.2s" },
    icon: { fontSize: "40px", marginBottom: "12px" },
};

export default Home;