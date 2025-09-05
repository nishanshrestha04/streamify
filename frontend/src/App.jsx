import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toastConfig } from "./utils/toast.jsx";
import Register from "./pages/Register";
import Navbar from "./Components/Navbar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import CreateVideo from "./pages/CreateVideo";
import VideoWatch from "./pages/VideoWatch";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Sidebar from "./Components/Sidebar";
import SearchResults from "./pages/SearchResults";
import api from "./api";

// Wrapper component to ensure VideoWatch remounts on ID change
function VideoWatchWrapper() {
  const { id } = useParams();
  return <VideoWatch key={id} />;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = loading, false = not logged in, true = logged in
  const [userDetail, setUser] = useState(null);

  // Fetch current user data when logged in
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const loggedIn = !!token;
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      fetchCurrentUser();
    } else {
      setUser(null);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('auth/user/');
      console.log('🔍 fetchCurrentUser API response:', response.data);
      console.log('📸 Profile photo in response:', response.data.profile_photo);
      setUser(response.data);
    } catch (err) {
      console.error('Failed to fetch current user:', err);
      // If user fetch fails, user is likely not authenticated
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    // Define allowed paths and path patterns
    const allowedPaths = ["/", "/login", "/register", "/create-video", "/profile", "/edit-profile"];
    const currentPath = window.location.pathname;
    
    // Check if current path is allowed
    const isAllowedPath = allowedPaths.includes(currentPath) ||
                         currentPath.startsWith("/watch/") ||
                         currentPath.startsWith("/profile/") ||
                         currentPath.startsWith("/@");
    
    if (!isAllowedPath) {
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
          <Navbar isLoggedIn={isLoggedIn} toggleSidebar={toggleSidebar} userDetail={userDetail} />
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
                      <Login setIsLoggedIn={setIsLoggedIn} setUser={setUser} fetchCurrentUser={fetchCurrentUser} />
                    )
                  }
                />
                <Route path="/" element={<Home />} />
                <Route 
                  path="/watch/:id" 
                  element={<VideoWatchWrapper />} 
                />
                <Route 
                  path="/create-video" 
                  element={
                    isLoggedIn === null ? (
                      <div className="min-h-screen bg-gray-50 dark:bg-[#181818] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                    ) : isLoggedIn ? <CreateVideo /> : <Navigate to="/login" replace />
                  } 
                />
                <Route path="/search" element={<SearchResults />} />
                <Route 
                  path="/profile" 
                  element={
                    isLoggedIn === null ? (
                      <div className="min-h-screen bg-gray-50 dark:bg-[#181818] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                    ) : isLoggedIn ? <Profile onUserUpdate={setUser} currentUser={userDetail} /> : <Navigate to="/login" replace />
                  } 
                />
                <Route 
                  path="/edit-profile" 
                  element={
                    isLoggedIn === null ? (
                      <div className="min-h-screen bg-gray-50 dark:bg-[#181818] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                    ) : isLoggedIn ? <EditProfile onUserUpdate={setUser} /> : <Navigate to="/login" replace />
                  } 
                />
                <Route path="/@:username" element={<Profile onUserUpdate={setUser} currentUser={userDetail} />} />
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
      <ToastContainer {...toastConfig} />
    </Router>
  );
}

export default App;