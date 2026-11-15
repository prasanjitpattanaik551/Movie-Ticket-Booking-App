import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { sendOtp, verifyOtp } from "../services/api";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1); // 1 = email, 2 = OTP
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // STEP 1 — Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await sendOtp(email);
            setMessage("OTP sent to " + email);
            setStep(2);
        } catch (err) {
            setError("Email not found. Please register first.");
        } finally {
            setLoading(false);
        }
    };

    // STEP 2 — Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const response = await verifyOtp(email, otp);
            const token = response.data; // JWT token

            // Store token and user in AuthContext
            await login(email, token);
            navigate("/movies");
        } catch (err) {
            setError(err.response?.data || "Invalid or expired OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h2 style={styles.title}>Login</h2>

                {step === 1 ? (
                    // ── Step 1: Enter Email ──
                    <form onSubmit={handleSendOtp}>
                        <p style={styles.subtitle}>Enter your email to receive OTP</p>
                        {error && <p style={styles.error}>{error}</p>}
                        <input
                            style={styles.input}
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button style={styles.btn} type="submit" disabled={loading}>
                            {loading ? "Sending OTP..." : "Send OTP"}
                        </button>
                    </form>
                ) : (
                    // ── Step 2: Enter OTP ──
                    <form onSubmit={handleVerifyOtp}>
                        {message && <p style={styles.success}>{message}</p>}
                        {error && <p style={styles.error}>{error}</p>}
                        <p style={styles.subtitle}>Enter the 6-digit OTP sent to <strong>{email}</strong></p>
                        <input
                            style={styles.input}
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            required
                        />
                        <button style={styles.btn} type="submit" disabled={loading}>
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                        <button
                            style={styles.resendBtn}
                            type="button"
                            onClick={() => { setStep(1); setOtp(""); setError(""); setMessage(""); }}
                        >
                            ← Change Email
                        </button>
                    </form>
                )}

                <p style={styles.footer}>
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
};

const styles = {
    page: { minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" },
    card: { background: "#fff", padding: "40px", borderRadius: "10px", width: "380px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" },
    title: { marginBottom: "8px", color: "#cc0000", textAlign: "center" },
    subtitle: { fontSize: "13px", color: "#666", marginBottom: "16px", textAlign: "center" },
    input: { display: "block", width: "100%", padding: "10px 12px", marginBottom: "14px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" },
    btn: { width: "100%", padding: "12px", background: "#cc0000", color: "#fff", border: "none", borderRadius: "6px", fontSize: "15px", cursor: "pointer", marginBottom: "10px" },
    resendBtn: { width: "100%", padding: "10px", background: "#f5f5f5", color: "#555", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", cursor: "pointer" },
    error: { color: "red", marginBottom: "12px", fontSize: "13px", textAlign: "center" },
    success: { color: "green", marginBottom: "12px", fontSize: "13px", textAlign: "center" },
    footer: { textAlign: "center", marginTop: "16px", fontSize: "13px" },
};

export default Login;