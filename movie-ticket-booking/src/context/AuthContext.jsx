import React, { createContext, useContext, useState } from "react";
import { loginUser, registerUser, getAllUsers } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
    });

    const [token, setToken] = useState(() => localStorage.getItem("token") || null);

    const isLoggedIn = !!token;

    // POST /api/users/login → now returns JWT token
    // Change login to accept token directly
    const login = async (email, token) => {
        localStorage.setItem("token", token);
        setToken(token);

        // Fetch user details
        const usersRes = await getAllUsers();
        const matchedUser = usersRes.data.find((u) => u.email === email);
        const userInfo = {
            id: matchedUser.id,
            name: matchedUser.name,
            email: matchedUser.email,
            phoneNumber: matchedUser.phoneNumber,
        };
        localStorage.setItem("user", JSON.stringify(userInfo));
        setUser(userInfo);
    };

    // POST /api/users/register
    const register = async (userDto) => {
        const response = await registerUser(userDto);
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);