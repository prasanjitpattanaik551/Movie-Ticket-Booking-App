import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetail from "./pages/MovieDetail";
import BookingPage from "./pages/BookingPage";
import MyBookings from "./pages/MyBookings";
import Theaters from "./pages/Theaters";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserProfile from "./pages/Userprofile";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/movies"        element={<Movies />} />
          <Route path="/movies/:id"    element={<MovieDetail />} />
          <Route path="/booking/:showId" element={<BookingPage />} />
          <Route path="/my-bookings"   element={<MyBookings />} />
          <Route path="/theaters"      element={<Theaters />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/register"      element={<Register />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;