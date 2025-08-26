import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlignJustify,
  Search,
  CircleUserRound,
  Bell,
  Plus,
  User,
  LogOut,
} from "lucide-react";
import logo_dark from "../assets/logo-dark.svg";
import logo_light from "../assets/logo-light.svg";
import profileImg from "/logo.svg";

const Navbar = ({ isLoggedIn, toggleSidebar }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.reload();
  };

  return (
    <div className="navbar px-4 py-3 flex justify-between items-center bg-white dark:bg-[#212121] sticky top-0 z-30">
      <div className="left flex items-center gap-3">
        <span className="ham-burger cursor-pointer" onClick={toggleSidebar}>
          <AlignJustify />
        </span>
        <div className="logo cursor-pointer" onClick={() => navigate("/")}>
          <img src={logo_light} alt="logo" className="w-40 block dark:hidden" />
          <img src={logo_dark} alt="logo" className="w-40 hidden dark:block" />
        </div>
      </div>
      <div className="middle w-1/3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="w-full border border-[#c6c6c6] dark:border-[hsl(0,0%,18.82%)] rounded-full px-4 py-2 pr-12 focus:outline-blue-600 focus:border-none bg-white dark:bg-[#232323] text-black dark:text-white"
          />
          <button
            type="button"
            className="cursor-pointer flex items-center justify-center absolute right-0 top-1/2  -translate-y-1/2 bg-[#c6c6c6] dark:bg-[hsla(0,0%,100%,.08)] rounded-r-full w-15 px-4 h-full"
          >
            <Search size={20} className="text-black dark:text-white" />
          </button>
        </div>
      </div>
      <div className="right flex items-center gap-3">
        {isLoggedIn ? (
          <>
            <button 
              className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full border border-[#c6c6c6] dark:border-[hsl(0,0%,18.82%)] text-black dark:text-white transition"
              onClick={() => navigate("/create-video")}
            >
              <Plus />
              Create
            </button>
            <button className="cursor-pointer flex items-center px-3 py-2 rounded-full text-black dark:text-white transition">
              <Bell />
            </button>
            <div className="relative" ref={dropdownRef}>
              <button
                className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full text-black dark:text-white transition"
                onClick={() => setDropdownOpen((open) => !open)}
              >
                <img
                  src={profileImg}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#232323] border border-[#c6c6c6] dark:border-[hsl(0,0%,18.82%)] rounded-lg shadow-lg z-50">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <img
                      src={profileImg}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-black dark:text-white">Profile</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">user@example.com</div>
                    </div>
                  </div>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    onClick={() => navigate("/profile")}
                  >
                    <User size={18} />
                    View Profile
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <button
              className="cursor-pointer flex items-center justify-center gap-3 border border-[#c6c6c6] dark:border-[hsl(0,0%,18.82%)] px-4 py-2 rounded-full transition text-black dark:text-white"
              onClick={() => navigate("/login")}
            >
              <CircleUserRound />
              Sign in
            </button>
            <button
              className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full border border-[#c6c6c6] dark:border-[hsl(0,0%,18.82%)] text-black dark:text-white transition"
              onClick={() => navigate("/register")}
            >
              <Plus />
              Create User
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;