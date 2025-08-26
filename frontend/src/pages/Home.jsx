import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ThumbsUp, Clock, MoreVertical, MessageCircle } from 'lucide-react';
import api from '../api';
import LikeButton from '../Components/LikeButton';

const VideoCard = ({ video, onClick }) => {
  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views?.toString() || '0';
  };

  const formatTimeAgo = (dateString) => {
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

  const formatDuration = (duration) => {
    if (!duration) return '0:00';
    
    // If duration is in seconds (number)
    if (typeof duration === 'number') {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // If duration is a string like "HH:MM:SS" or already formatted
    if (typeof duration === 'string') {
      return duration;
    }
    
    return '0:00';
  };

  return (
    <div 
      className="cursor-pointer hover:scale-[1.02] transition-transform duration-200 group"
      onClick={() => onClick(video)}
    >
      {/* Video Thumbnail */}
      <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden rounded-xl mb-4">
        {video.thumbnail_url ? (
          <img 
            src={video.thumbnail_url} 
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
            <Play size={60} className="text-gray-500 dark:text-gray-400" />
          </div>
        )}
        
        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 bg-black bg-opacity-80 text-white text-sm px-2 py-1 rounded font-medium">
          {video.formatted_duration || formatDuration(video.duration) || '0:00'}
        </div>
      </div>

      {/* Video Info */}
      <div className="flex gap-4">
        {/* Channel Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {video.uploader?.first_name?.[0] || video.uploader?.username?.[0] || 'U'}
          </div>
        </div>

        {/* Video Details */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="font-semibold text-lg line-clamp-2 text-gray-900 dark:text-white leading-snug mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {video.title}
          </h3>
          
          {/* Channel Name */}
          <p className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer mb-1">
            {video.uploader?.first_name && video.uploader?.last_name 
              ? `${video.uploader.first_name} ${video.uploader.last_name}`
              : video.uploader?.username || 'Unknown Channel'
            }
          </p>
          
          {/* Views and Upload Time */}
          <div className="flex items-center gap-1 text-base text-gray-600 dark:text-gray-400">
            <span>{formatViews(video.views)} views</span>
            <span>•</span>
            <span>{formatTimeAgo(video.created_at)}</span>
          </div>

          {/* Like/Dislike and Comments */}
          <div className="flex items-center justify-between mt-2">
            <LikeButton
              videoId={video.id}
              initialLikes={video.likes}
              initialDislikes={video.dislikes}
              userReaction={video.user_reaction}
              size={14}
              showCounts={true}
            />
            
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <MessageCircle size={14} />
              <span className="text-xs">{video.comments_count || 0}</span>
            </div>
          </div>
        </div>

        {/* More Options */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <MoreVertical size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await api.get('videos/');
      setVideos(response.data.results || response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (video) => {
    // Navigate to video detail page (we'll create this later)
    navigate(`/watch/${video.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#181818] p-4 md:p-6">
        <div className="w-full max-w-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {/* Loading Skeletons */}
            {[...Array(12)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#181818] p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={fetchVideos}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#181818] p-4 md:p-6">
      <div className="w-full max-w-none">

        {/* Videos Grid */}
        {videos.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">📺</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No videos yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Be the first to upload a video and start building your content library!
            </p>
            <button 
              onClick={() => navigate('/create-video')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Upload Your First Video
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {videos.map((video) => (
              <VideoCard 
                key={video.id} 
                video={video} 
                onClick={handleVideoClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
