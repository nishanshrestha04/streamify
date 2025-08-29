// Utility functions for video-related operations

export const formatDuration = (duration) => {
  if (!duration) return '0:00';
  
  // Handle Django DurationField format like "0:01:30" (HH:MM:SS)
  if (typeof duration === 'string' && duration.includes(':')) {
    const parts = duration.split(':');
    if (parts.length === 3) {
      // Format: "HH:MM:SS"
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      const seconds = parseInt(parts[2]);
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    } else if (parts.length === 2) {
      // Format: "MM:SS"
      return duration;
    }
  }
  
  // Convert to number if it's a string number
  const durationNum = typeof duration === 'string' ? parseFloat(duration) : duration;
  
  if (typeof durationNum === 'number' && !isNaN(durationNum)) {
    const minutes = Math.floor(durationNum / 60);
    const seconds = Math.floor(durationNum % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  // If duration is already a formatted string like "2:30"
  if (typeof duration === 'string') {
    return duration;
  }
  
  return '0:00';
};

export const formatViews = (views) => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views?.toString() || '0';
};

export const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
};
