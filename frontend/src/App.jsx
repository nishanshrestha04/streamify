import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Register from "./pages/Register";
import Navbar from "./Components/Navbar";
import Login from "./pages/Login";
import Home from "./pages/Home";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  // Custom hook to get current location
  function usePath() {
    const location = useLocation();
    return location.pathname;
  }

  function Layout() {
    const path = usePath();
    // Hide Navbar on /login and /register
    const hideNavbar = path === "/login" || path === "/register";
    return (
      <>
        {!hideNavbar && <Navbar isLoggedIn={isLoggedIn} />}
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </>
    );
  }

  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;