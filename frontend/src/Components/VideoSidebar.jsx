import React from 'react';
import { Eye, Clock } from 'lucide-react';
import { formatDuration } from '../utils/videoUtils';

const VideoSidebar = ({ 
  relatedVideos = [],
  onVideoClick,
  formatViews,
  formatTimeAgo,
  loading = false
}) => {

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Related Videos
        </h3>
        {[...Array(5)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-300 dark:bg-gray-600 rounded-lg aspect-video mb-2"></div>
            <div className="space-y-2">
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
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Related Videos
      </h3>
      
      {relatedVideos.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">No related videos available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {relatedVideos.map((video) => (
            <div 
              key={video.id}
              onClick={() => onVideoClick(video.id)}
              className="group cursor-pointer"
            >
              <div className="flex gap-3">
                {/* Thumbnail */}
                <div className="relative w-40 aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                  {video.thumbnail_url ? (
                    <img 
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                      <Clock size={24} className="text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  
                  {/* Duration Badge */}
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded font-medium">
                    {video.formatted_duration || formatDuration(video.duration) || '0:00'}
                  </div>
                </div>

                {/* Video Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2 text-gray-900 dark:text-white leading-snug mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {video.title}
                  </h4>
                  
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {video.uploader?.first_name && video.uploader?.last_name 
                      ? `${video.uploader.first_name} ${video.uploader.last_name}`
                      : video.uploader?.username || 'Anonymous'
                    }
                  </p>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Eye size={12} />
                    <span>{formatViews(video.views)} views</span>
                    <span>•</span>
                    <span>{formatTimeAgo(video.created_at)}</span>
                  </div>
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
