import React from 'react';
import { User } from 'lucide-react';

const UserAvatar = ({ 
  user, 
  size = 'md', 
  className = '',
  showOnlineStatus = false,
  onClick = null 
}) => {
  // Debug logging
  React.useEffect(() => {
    console.log('UserAvatar received user:', user);
    console.log('User profile_photo:', user?.profile_photo);
  }, [user]);

  // Size configurations
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const iconSize = iconSizes[size] || iconSizes.md;

  const avatarContent = user?.profile_photo ? (
    <img
      src={user.profile_photo}
      alt={`${user.username || 'User'}'s profile`}
      className={`${sizeClass} rounded-full object-cover ${className}`}
      onError={(e) => {
        // Fallback to default avatar if image fails to load
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
      }}
    />
  ) : (
    <div className={`${sizeClass} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ${className}`}>
      <User className={`${iconSize} text-white`} />
    </div>
  );

  const avatarElement = onClick ? (
    <button
      onClick={onClick}
      className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
    >
      {avatarContent}
    </button>
  ) : (
    <div>{avatarContent}</div>
  );

  return (
    <div className="relative inline-block">
      {avatarContent}
      {/* Fallback avatar (hidden by default, shown if image fails) */}
      {user?.profile_photo && (
        <div 
          className={`${sizeClass} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ${className}`}
          style={{ display: 'none' }}
        >
          <User className={`${iconSize} text-white`} />
        </div>
      )}
      
      {/* Online status indicator */}
      {showOnlineStatus && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
    </div>
  );
};

export default UserAvatar;
