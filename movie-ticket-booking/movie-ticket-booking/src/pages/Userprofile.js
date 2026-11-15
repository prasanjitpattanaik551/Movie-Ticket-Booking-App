import React, { useEffect, useState } from "react";
import { getUserById, updateUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

const UserProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({});
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // GET /api/users/{id}
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getUserById(user?.id);
                setProfile(res.data);
                setForm({
                    name: res.data.name,
                    email: res.data.email,
                    phoneNumber: res.data.phoneNumber,
                });
            } catch (err) {
                setError("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };
        if (user?.id) fetchProfile();
        else setLoading(false);
    }, [user]);

    // PUT /api/users/{id}
    const handleUpdate = async (e) => {
        e.preventDefault();
        setSuccess("");
        setError("");
        try {
            const res = await updateUser(user?.id, form);
            setProfile(res.data);
            setEditMode(false);
            setSuccess("Profile updated successfully!");
        } catch (err) {
            setError("Failed to update profile.");
        }
    };

    if (loading) return <p style={styles.msg}>Loading profile...</p>;

    return (
        <div style={styles.page}>
            <div style={styles.card}>

                {/* Avatar */}
                <div style={styles.avatarBox}>
                    <div style={styles.avatar}>
                        {profile?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <h2 style={styles.name}>{profile?.name}</h2>
                    <p style={styles.emailText}>{profile?.email}</p>
                </div>

                <hr style={styles.divider} />

                {success && <p style={styles.success}>{success}</p>}
                {error && <p style={styles.error}>{error}</p>}

                {/* View Mode */}
                {!editMode ? (
                    <div style={styles.infoBox}>
                        <div style={styles.infoRow}>
                            <span style={styles.label}>👤 Name</span>
                            <span style={styles.value}>{profile?.name}</span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.label}>📧 Email</span>
                            <span style={styles.value}>{profile?.email}</span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.label}>📞 Phone</span>
                            <span style={styles.value}>{profile?.phoneNumber || "Not set"}</span>
                        </div>
                        <button style={styles.editBtn} onClick={() => setEditMode(true)}>
                            ✏️ Edit Profile
                        </button>
                    </div>
                ) : (
                    // Edit Mode
                    <form onSubmit={handleUpdate} style={styles.form}>
                        <label style={styles.fieldLabel}>Name</label>
                        <input
                            style={styles.input} value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                        <label style={styles.fieldLabel}>Email</label>
                        <input
                            style={styles.input} type="email" value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                        <label style={styles.fieldLabel}>Phone Number</label>
                        <input
                            style={styles.input} value={form.phoneNumber || ""}
                            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                        />
                        <div style={styles.btnRow}>
                            <button style={styles.saveBtn} type="submit">Save</button>
                            <button style={styles.cancelBtn} type="button" onClick={() => setEditMode(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

const styles = {
    page: { minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" },
    card: { background: "#fff", borderRadius: "16px", padding: "40px", width: "420px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" },
    avatarBox: { textAlign: "center", marginBottom: "20px" },
    avatar: { width: "80px", height: "80px", borderRadius: "50%", background: "#cc0000", color: "#fff", fontSize: "36px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" },
    name: { fontSize: "20px", color: "#222", marginBottom: "4px" },
    emailText: { fontSize: "13px", color: "#888" },
    divider: { border: "none", borderTop: "1px solid #eee", margin: "20px 0" },
    infoBox: {},
    infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f0f0f0" },
    label: { fontSize: "14px", color: "#888" },
    value: { fontSize: "14px", color: "#333", fontWeight: "500" },
    editBtn: { marginTop: "20px", width: "100%", padding: "12px", background: "#cc0000", color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", cursor: "pointer" },
    form: {},
    fieldLabel: { display: "block", fontSize: "13px", color: "#666", marginBottom: "6px" },
    input: { display: "block", width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", marginBottom: "14px", boxSizing: "border-box" },
    btnRow: { display: "flex", gap: "10px", marginTop: "4px" },
    saveBtn: { flex: 1, padding: "12px", background: "#cc0000", color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", cursor: "pointer" },
    cancelBtn: { flex: 1, padding: "12px", background: "#888", color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", cursor: "pointer" },
    success: { color: "green", fontSize: "13px", marginBottom: "12px", textAlign: "center" },
    error: { color: "red", fontSize: "13px", marginBottom: "12px", textAlign: "center" },
    msg: { textAlign: "center", marginTop: "40px", color: "#999" },
};

export default UserProfile;