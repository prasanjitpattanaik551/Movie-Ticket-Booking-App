import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await register(form); // calls POST /api/users/register
            navigate("/login");
        } catch (err) {
            setError("Registration failed. Email may already exist.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h2 style={styles.title}>Create Account</h2>
                {error && <p style={styles.error}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        style={styles.input} type="text" name="name"
                        placeholder="Full Name" value={form.name} onChange={handleChange} required
                    />
                    <input
                        style={styles.input} type="email" name="email"
                        placeholder="Email" value={form.email} onChange={handleChange} required
                    />
                    <input
                        style={styles.input} type="password" name="password"
                        placeholder="Password" value={form.password} onChange={handleChange} required
                    />
                    <button style={styles.btn} type="submit" disabled={loading}>
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>
                <p style={styles.footer}>
                    Already have an account? <Link to="/login">Login</Link>
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

export default Register;