import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(form.email, form.password); // calls POST /api/users/login
            navigate("/movies");
        } catch (err) {
            setError("Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h2 style={styles.title}>Login</h2>
                {error && <p style={styles.error}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        style={styles.input} type="email" name="email"
                        placeholder="Email" value={form.email} onChange={handleChange} required
                    />
                    <input
                        style={styles.input} type="password" name="password"
                        placeholder="Password" value={form.password} onChange={handleChange} required
                    />
                    <button style={styles.btn} type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
                <p style={styles.footer}>
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
};

const styles = {
    page: { minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" },
    card: { background: "#fff", padding: "40px", borderRadius: "10px", width: "360px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" },
    title: { marginBottom: "24px", color: "#cc0000", textAlign: "center" },
    input: { display: "block", width: "100%", padding: "10px 12px", marginBottom: "14px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" },
    btn: { width: "100%", padding: "12px", background: "#cc0000", color: "#fff", border: "none", borderRadius: "6px", fontSize: "15px", cursor: "pointer" },
    error: { color: "red", marginBottom: "12px", fontSize: "13px" },
    footer: { textAlign: "center", marginTop: "16px", fontSize: "13px" },
};

export default Login;