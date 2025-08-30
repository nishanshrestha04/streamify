import React from 'react';
import { Eye, Clock, SkipForward } from 'lucide-react';
import { formatDuration } from '../utils/videoUtils';

const VideoSidebar = ({ 
  relatedVideos = [],
  onVideoClick,
  formatViews,
  formatTimeAgo,
  loading = false,
  currentVideoId = null,
  onPlayNext
}) => {

  const getNextVideo = React.useCallback(() => {
    if (relatedVideos.length > 0) {
      return relatedVideos[0]; // Return the first video in the list as next
    }
    return null;
  }, [relatedVideos]);

  const handlePlayNext = React.useCallback(() => {
    const nextVideo = getNextVideo();
    if (nextVideo && onVideoClick) {
      onVideoClick(nextVideo.id);
    }
  }, [getNextVideo, onVideoClick]);

  // Pass the handlePlayNext function to parent
  React.useEffect(() => {
    if (onPlayNext) {
      onPlayNext(handlePlayNext);
    }
  }, [handlePlayNext, onPlayNext]);

  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          Up Next
        </h3>
        {[...Array(5)].map((_, index) => (
          <div key={index} className="animate-pulse flex gap-3">
            <div className="bg-gray-300 dark:bg-gray-600 rounded-lg w-40 aspect-video flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Up Next 
        </h3>
      </div>
      
      {relatedVideos.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-4xl mb-2 block">📹</span>
          <p className="text-gray-600 dark:text-gray-400">No other videos available</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Upload more videos to see them here</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-150px)] overflow-y-auto custom-scrollbar">
          {relatedVideos.map((video, index) => (
            <div 
              key={video.id}
              onClick={() => onVideoClick(video.id)}
              className="group cursor-pointer flex gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors duration-200"
            >
              {/* Thumbnail */}
              <div className="relative w-40 aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                {video.thumbnail_url ? (
                  <img 
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                    <Clock size={20} className="text-gray-500 dark:text-gray-400" />
                  </div>
                )}
                
                {/* Duration Badge */}
                <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                  {video.formatted_duration || formatDuration(video.duration) || '0:00'}
                </div>
              </div>

              {/* Video Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-2 text-gray-900 dark:text-white leading-tight mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {video.title || 'Untitled Video'}
                </h4>
                
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 truncate">
                  {video.uploader?.first_name && video.uploader?.last_name 
                    ? `${video.uploader.first_name} ${video.uploader.last_name}`
                    : video.uploader?.username || 'Anonymous'
                  }
                </p>
                
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Eye size={12} />
                  <span>{formatViews ? formatViews(video.views) : video.views || 0} views</span>
                  <span>•</span>
                  <span>{formatTimeAgo ? formatTimeAgo(video.created_at) : 'Unknown'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoSidebar;
