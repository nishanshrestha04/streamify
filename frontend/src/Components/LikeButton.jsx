import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { showLoginPromptToast } from '../utils/toast.jsx';
import api from '../api';

const LikeButton = ({ videoId, initialLikes, initialDislikes, userReaction, size = 16, showCounts = true }) => {
  const [likes, setLikes] = useState(initialLikes || 0);
  const [dislikes, setDislikes] = useState(initialDislikes || 0);
  const [reaction, setReaction] = useState(userReaction);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReaction = async (action) => {
    if (loading) return;

    try {
      setLoading(true);
      const response = await api.post(`videos/${videoId}/like/`, { reaction: action });
      
      setLikes(response.data.likes);
      setDislikes(response.data.dislikes);
      setReaction(response.data.user_reaction);
    } catch (err) {
      console.error('Error updating reaction:', err);
      if (err.response?.status === 401) {
        showLoginPromptToast('🔐 Please login to like/dislike videos', () => navigate('/login'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleReaction('like');
        }}
        disabled={loading}
        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
          reaction === 'like'
            ? 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400'
            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
        } ${loading ? 'opacity-50' : ''}`}
      >
        <ThumbsUp size={size} />
        {showCounts && <span className="text-xs">{likes}</span>}
      </button>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleReaction('dislike');
        }}
        disabled={loading}
        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
          reaction === 'dislike'
            ? 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400'
            : 'text-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
        } ${loading ? 'opacity-50' : ''}`}
      >
        <ThumbsDown size={size} />
        {showCounts && <span className="text-xs">{dislikes}</span>}
      </button>
    </div>
  );
};

export default LikeButton;
