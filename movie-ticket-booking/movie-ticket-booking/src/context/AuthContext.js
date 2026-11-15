import React, { createContext, useContext, useState } from "react";
import { loginUser, registerUser, getAllUsers } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
    });

    const isLoggedIn = !!user;

    // POST /api/users/login
    const login = async (email, password) => {
        const response = await loginUser({ email, password });
        if (response.data === "Login successful") {
            // fetch all users and find by email to get id
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
        } else {
            throw new Error("Login failed");
        }
    };

    // POST /api/users/register
    const register = async (userDto) => {
        const response = await registerUser(userDto);
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);