import React from 'react';
import { Eye, ThumbsUp, ThumbsDown, Share2, Download } from 'lucide-react';
import LikeButton from './LikeButton';
import UserAvatar from './UserAvatar';

const VideoInfo = ({ 
  video, 
  userReaction, 
  currentUser, 
  onLikeDislike, 
  formatViews, 
  formatTimeAgo 
}) => {
  return (
    <div className="bg-white dark:bg-[#212121] rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {video.title}
      </h1>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Eye size={16} />
            <span>{formatViews(video.views)} views</span>
          </div>
          <span className="text-gray-400">•</span>
          <span className="text-gray-600 dark:text-gray-400">
            {formatTimeAgo(video.created_at)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onLikeDislike('like')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              userReaction === 'like' 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <ThumbsUp size={16} />
            <span>{video.likes || 0}</span>
          </button>
          
          <button 
            onClick={() => onLikeDislike('dislike')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              userReaction === 'dislike' 
                ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' 
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <ThumbsDown size={16} />
            <span>{video.dislikes || 0}</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <Share2 size={16} />
            <span>Share</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <Download size={16} />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Channel Info */}
      <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg">
        <UserAvatar user={video.uploader} size="lg" />
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {video.uploader?.first_name && video.uploader?.last_name 
                ? `${video.uploader.first_name} ${video.uploader.last_name}`
                : video.uploader?.username || 'Anonymous'
              }
            </h3>
            <button className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm font-medium">
              Subscribe
            </button>
          </div>
          
          {video.description && (
            <div className="text-gray-700 dark:text-gray-300">
              <div className="mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Description:</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {video.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoInfo;
