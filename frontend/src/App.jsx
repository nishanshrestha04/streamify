import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Navbar from "./Components/Navbar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import CreateVideo from "./pages/CreateVideo";
import VideoWatch from "./pages/VideoWatch";
import Sidebar from "./Components/Sidebar";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);

    // Force browser to "/" on reload if not already there
    const allowedPaths = ["/", "/login", "/register", "/create-video"];
    const isWatchPath = window.location.pathname.startsWith("/watch/");
    
    if (!allowedPaths.includes(window.location.pathname) && !isWatchPath) {
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
    const isVideoWatchPage = path.startsWith("/watch/");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
      if (isVideoWatchPage) {
        // On video watch page, toggle overlay sidebar
        setSidebarOpen(!sidebarOpen);
      } else {
        // On other pages, toggle collapsed state
        setSidebarCollapsed(!sidebarCollapsed);
      }
    };

    // Close overlay sidebar when clicking outside on video watch page
    const handleOverlayClick = () => {
      if (isVideoWatchPage && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    return (
      <div className="bg-white dark:bg-[#212121]">
        {!hideNavbar && (
          <Navbar isLoggedIn={isLoggedIn} toggleSidebar={toggleSidebar} />
        )}
        <div className="flex relative">
          {/* Regular sidebar for non-video pages */}
          {!hideNavbar && !isVideoWatchPage && (
            <Sidebar isCollapsed={sidebarCollapsed} isLoggedIn={isLoggedIn} />
          )}
          
          {/* Overlay sidebar for video watch page */}
          {isVideoWatchPage && sidebarOpen && (
            <div className="fixed top-16 left-0 h-[calc(100vh-64px)] z-50">
              <Sidebar isCollapsed={false} isLoggedIn={isLoggedIn} />
            </div>
          )}

          <main className={`flex-1 min-h-screen bg-white dark:bg-[#212121] relative ${
            !hideNavbar && !isVideoWatchPage 
              ? (sidebarCollapsed ? "ml-20" : "ml-60") 
              : ""
          }`}>
            {/* Invisible clickable area to close sidebar when clicking outside */}
            {isVideoWatchPage && sidebarOpen && (
              <div
                className="absolute inset-0 z-30"
                onClick={handleOverlayClick}
              ></div>
            )}
            
            <div className="relative z-10">
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
                <Route path="/watch/:id" element={<VideoWatch />} />
                <Route 
                  path="/create-video" 
                  element={
                    isLoggedIn ? <CreateVideo /> : <Navigate to="/login" replace />
                  } 
                />
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
            </div>
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