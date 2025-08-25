import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Navbar from "./Components/Navbar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Sidebar from "./Components/Sidebar";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);

    // Force browser to "/" on reload if not already there
    if (
      window.location.pathname !== "/" &&
      window.location.pathname !== "/login" &&
      window.location.pathname !== "/register"
    ) {
      window.location.replace("/");
    }
  }, []);

  // Custom hook to get current location
  function usePath() {
    const location = useLocation();
    return location.pathname;
  }

  function Layout() {
    const path = usePath();
    const hideNavbar = path === "/login" || path === "/register";
    const showSidebar = !hideNavbar;
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

    return (
      <div className="bg-white dark:bg-[#212121]">
        {!hideNavbar && (
          <Navbar isLoggedIn={isLoggedIn} toggleSidebar={toggleSidebar} />
        )}
        <div className="flex">
          {showSidebar && (
            <Sidebar isCollapsed={sidebarCollapsed} isLoggedIn={isLoggedIn} />
          )}
          <main className={`flex-1 min-h-screen bg-white dark:bg-[#212121] ${
            showSidebar ? (sidebarCollapsed ? "ml-20" : "ml-60") : ""
          }`}>
            <Routes>
              <Route
                path="/register"
                element={
                  isLoggedIn ? <Navigate to="/" replace /> : <Register />
                }
              />
              <Route
                path="/login"
                element={
                  isLoggedIn ? (
                    <Navigate to="/" replace />
                  ) : (
                    <Login setIsLoggedIn={setIsLoggedIn} />
                  )
                }
              />
              <Route path="/" element={<Home />} />
              <Route path="/shorts" element={<div className="p-4">Shorts Page</div>} />
              <Route path="/subscriptions" element={<div className="p-4">Subscriptions Page</div>} />
              <Route path="/history" element={<div className="p-4">History Page</div>} />
              <Route path="/watch-later" element={<div className="p-4">Watch Later Page</div>} />
              <Route path="/liked" element={<div className="p-4">Liked Videos Page</div>} />
              <Route path="/downloads" element={<div className="p-4">Downloads Page</div>} />
              <Route path="/settings" element={<div className="p-4">Settings Page</div>} />
              <Route path="/help" element={<div className="p-4">Help Page</div>} />
              <Route path="/feedback" element={<div className="p-4">Feedback Page</div>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;