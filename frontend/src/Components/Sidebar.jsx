import React from "react";
import { Home, Users, History, Clock, ThumbsUp, Download, Settings, HelpCircle, Flag, CircleUserRound, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ isCollapsed, isLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const mainMenuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Users, label: "Subscriptions", path: "/subscriptions" },
  ];

  // Only show History for non-logged in users
  const libraryItems = isLoggedIn 
    ? [
        { icon: History, label: "History", path: "/history" },
        { icon: Clock, label: "Watch later", path: "/watch-later" },
        { icon: ThumbsUp, label: "Liked videos", path: "/liked" },
        { icon: Download, label: "Downloads", path: "/downloads" },
      ]
    : [
        { icon: History, label: "History", path: "/history" },
      ];

  const bottomItems = isLoggedIn 
    ? [
        { icon: Settings, label: "Settings", path: "/settings" },
        { icon: HelpCircle, label: "Help", path: "/help" },
        { icon: Flag, label: "Send feedback", path: "/feedback" },
      ]
    : [];

  const renderMenuItem = (item, isActive, showLabel = true) => {
    const Icon = item.icon;
    return (
      <button
        key={item.path}
        onClick={() => navigate(item.path)}
        className={`w-full flex items-center cursor-pointer ${
          isCollapsed ? "justify-center px-2 py-3" : "gap-6 px-6 py-2"
        } hover:bg-gray-100 dark:hover:bg-[#3a3a3a] transition-colors duration-200 ${
          isActive ? "bg-gray-100 dark:bg-[#3a3a3a]" : ""
        }`}
        title={isCollapsed ? item.label : ""}
      >
        <Icon 
          size={24} 
          className={`transition-colors duration-200 flex-shrink-0 ${
            isActive 
              ? "text-black dark:text-white" 
              : "text-gray-700 dark:text-gray-300"
          }`}
        />
        {!isCollapsed && showLabel && (
          <span className={`text-sm font-medium transition-colors duration-200 ${
            isActive 
              ? "text-black dark:text-white font-semibold" 
              : "text-gray-900 dark:text-gray-100"
          }`}>
            {item.label}
          </span>
        )}
      </button>
    );
  };

  const renderCollapsedYouItem = () => {
    const isActive = location.pathname === "/history";
    return (
      <button
        key="you-collapsed"
        onClick={() => navigate("/history")}
        className={`w-full flex flex-col items-center justify-center cursor-pointer px-2 py-4 hover:bg-gray-100 dark:hover:bg-[#3a3a3a] transition-colors duration-200 ${
          isActive ? "bg-gray-100 dark:bg-[#3a3a3a]" : ""
        }`}
        title="You"
      >
        <CircleUserRound 
          size={24} 
          className={`transition-colors duration-200 ${
            isActive 
              ? "text-black dark:text-white" 
              : "text-gray-700 dark:text-gray-300"
          }`}
        />
        <span className={`text-xs mt-1 transition-colors duration-200 ${
          isActive 
            ? "text-black dark:text-white font-semibold" 
            : "text-gray-700 dark:text-gray-300"
        }`}>
          You
        </span>
      </button>
    );
  };

  return (
    <div
      className={`fixed top-16 left-0 h-[calc(100vh-64px)] bg-white dark:bg-[#212121] overflow-y-auto transition-all duration-300 z-20 ${
        isCollapsed ? "w-20" : "w-60"
      }`}
    >
      <div className="pt-2">
        {/* Main Menu */}
        <div className={isCollapsed ? "space-y-2" : ""}>
          {mainMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return isCollapsed ? (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex flex-col items-center justify-center cursor-pointer px-2 py-4 hover:bg-gray-100 dark:hover:bg-[#3a3a3a] transition-colors duration-200 ${
                  isActive ? "bg-gray-100 dark:bg-[#3a3a3a]" : ""
                }`}
                title={item.label}
              >
                <item.icon 
                  size={24} 
                  className={`transition-colors duration-200 ${
                    isActive 
                      ? "text-black dark:text-white" 
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                />
                <span className={`text-xs mt-1 transition-colors duration-200 ${
                  isActive 
                    ? "text-black dark:text-white font-semibold" 
                    : "text-gray-700 dark:text-gray-300"
                }`}>
                  {item.label}
                </span>
              </button>
            ) : (
              renderMenuItem(item, isActive)
            );
          })}
          
          {/* Show "You" when collapsed */}
          {isCollapsed && renderCollapsedYouItem()}
        </div>

        {!isCollapsed && (
          <>
            {/* Divider */}
            <div className="border-t border-[#c6c6c6] dark:border-[#c6c6c6] my-2"></div>

            {/* You section */}
            <div className="py-2">
              <button
                className="w-full flex items-center px-6 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3a3a3a] transition-colors duration-200"
                onClick={() => navigate("/history")}
              >
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                  You
                </h3>
                <ChevronRight 
                  size={16} 
                  className="text-gray-700 dark:text-gray-300 transition-colors duration-200 ml-2"
                />
              </button>
              {libraryItems.map((item) => {
                const isActive = location.pathname === item.path;
                return renderMenuItem(item, isActive);
              })}
            </div>

            {/* Only show Subscriptions section if logged in */}
            {isLoggedIn && (
              <>
                {/* Divider */}
                <div className="border-t border-[#c6c6c6] dark:border-[#c6c6c6] my-2"></div>

                {/* Subscriptions */}
                <div className="py-2">
                  <div className="px-6 py-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                      Subscriptions
                    </h3>
                  </div>
                  <div className="px-6 py-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                    No subscriptions yet
                  </div>
                </div>
              </>
            )}

            {/* Only show More section if logged in and has bottom items */}
            {isLoggedIn && bottomItems.length > 0 && (
              <>
                {/* Divider */}
                <div className="border-t border-[#c6c6c6] dark:border-[#c6c6c6] my-2"></div>

                {/* More section */}
                <div className="py-2">
                  <div className="px-6 py-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                      More
                    </h3>
                  </div>
                  {bottomItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return renderMenuItem(item, isActive);
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* Footer - only show if not collapsed */}
        {!isCollapsed && (
          <div className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200 mt-auto">
            <p>&copy; 2025 Streamify</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;