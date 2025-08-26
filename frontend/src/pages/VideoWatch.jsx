import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, ThumbsUp, ThumbsDown, Share2, Download, MessageCircle, Send, Heart } from 'lucide-react';
import api from '../api';

const VideoWatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [userReaction, setUserReaction] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (id) {
      fetchVideo();
      fetchComments();
      getCurrentUser();
    }
  }, [id]);

  const getCurrentUser = async () => {
    try {
      const response = await api.get('auth/user/');
      setCurrentUser(response.data);
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const response = await api.get(`videos/${id}/`);
      setVideo(response.data);
      setUserReaction(response.data.user_reaction);
      setError(null);
    } catch (err) {
      console.error('Error fetching video:', err);
      setError('Video not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const response = await api.get(`comments/video/${id}/`);
      setComments(response.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLikeDislike = async (action) => {
    try {
      const response = await api.post(`videos/${id}/like/`, { reaction: action });
      setVideo(prev => ({
        ...prev,
        likes: response.data.likes,
        dislikes: response.data.dislikes
      }));
      setUserReaction(response.data.user_reaction);
    } catch (err) {
      console.error('Error updating reaction:', err);
      if (err.response?.status === 401) {
        const confirmed = window.confirm('You need to be logged in to like/dislike videos. Would you like to go to the login page?');
        if (confirmed) {
          navigate('/login');
        }
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await api.post('comments/create/', {
        content: newComment,
        video: id
      });
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
      // Update video comments count
      setVideo(prev => ({
        ...prev,
        comments_count: (prev.comments_count || 0) + 1
      }));
    } catch (err) {
      console.error('Error posting comment:', err);
      if (err.response?.status === 401) {
        const confirmed = window.confirm('You need to be logged in to comment. Would you like to go to the login page?');
        if (confirmed) {
          navigate('/login');
        }
      }
    }
  };

  const handleCommentLike = async (commentId) => {
    try {
      const response = await api.post(`comments/${commentId}/like/`);
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, likes_count: response.data.likes_count, user_has_liked: response.data.liked }
          : comment
      ));
    } catch (err) {
      console.error('Error liking comment:', err);
      if (err.response?.status === 401) {
        const confirmed = window.confirm('You need to be logged in to like comments. Would you like to go to the login page?');
        if (confirmed) {
          navigate('/login');
        }
      }
    }
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} months ago`;
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} years ago`;
  };

  const getUserDisplayName = (user) => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user?.username || 'Unknown User';
  };

  const getUserInitial = (user) => {
    if (user?.first_name) return user.first_name[0];
    if (user?.username) return user.username[0];
    return 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#181818] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#181818] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Video not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#181818]">
      <div className="max-w-full mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Video Player Section - Now takes more space */}
          <div className="xl:col-span-3">
            {/* Video Player - Larger size */}
            <div className="bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
              {video.video_url ? (
                <video 
                  controls 
                  autoPlay
                  className="w-full h-full"
                  poster={video.thumbnail_url}
                >
                  <source src={video.video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <p>Video not available</p>
                </div>
              )}
            </div>

            {/* Video Info */}
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
                    onClick={() => handleLikeDislike('like')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                      userReaction === 'like' 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <ThumbsUp size={16} />
                    <span>{video.likes}</span>
                  </button>
                  <button 
                    onClick={() => handleLikeDislike('dislike')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                      userReaction === 'dislike' 
                        ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <ThumbsDown size={16} />
                    <span>{video.dislikes}</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <Share2 size={16} />
                    Share
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </div>

              {/* Channel Info */}
              <div className="flex items-center gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {getUserInitial(video.uploader)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {getUserDisplayName(video.uploader)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Content Creator
                  </p>
                </div>
                <button className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors">
                  Subscribe
                </button>
              </div>

              {/* Description */}
              {video.description && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {video.description}
                  </p>
                </div>
              )}

              {/* Comments Section */}
              <div className="mt-8">
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {video.comments_count || 0} Comments
                  </h3>
                  <MessageCircle size={20} className="text-gray-600 dark:text-gray-400" />
                </div>

                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {getUserInitial(currentUser)}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setNewComment('')}
                          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newComment.trim()}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send size={16} />
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {loadingComments ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {getUserInitial(comment.user)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white text-sm">
                              {getUserDisplayName(comment.user)}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimeAgo(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 mb-2">
                            {comment.content}
                          </p>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleCommentLike(comment.id)}
                              className={`flex items-center gap-1 text-sm transition-colors ${
                                comment.user_has_liked
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                              }`}
                            >
                              <Heart size={14} fill={comment.user_has_liked ? 'currentColor' : 'none'} />
                              {comment.likes || 0}
                            </button>
                            <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                              Reply
                            </button>
                          </div>
                          
                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-3 space-y-3">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                    {getUserInitial(reply.user)}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-gray-900 dark:text-white text-sm">
                                        {getUserDisplayName(reply.user)}
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatTimeAgo(reply.created_at)}
                                      </span>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                                      {reply.content}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Related Videos - Now smaller */}
          <div className="xl:col-span-1">
            <div className="bg-white dark:bg-[#212121] rounded-lg p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Up next
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Related videos will appear here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoWatch;