import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { showLoginPromptToast, showInfoToast } from '../utils/toast.jsx';
import { formatViews, formatTimeAgo } from '../utils/videoUtils';
import api from '../api';
import VideoPlayer from '../Components/VideoPlayer';
import VideoInfo from '../Components/VideoInfo';
import CommentSection from '../Components/CommentSection';
import VideoSidebar from '../Components/VideoSidebar';

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
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loadingRelatedVideos, setLoadingRelatedVideos] = useState(false);
  const [playNextFunction, setPlayNextFunction] = useState(null);

  useEffect(() => {
    if (id) {
      // Reset states when navigating to a new video
      setLoading(true);
      setError(null);
      setVideo(null);
      setComments([]);
      setUserReaction(null);
      setRelatedVideos([]);
      setLoadingRelatedVideos(false);
      setNewComment('');
      
      // Fetch new video data
      fetchVideo();
      fetchComments();
      getCurrentUser();
      fetchRelatedVideos();
    }
  }, [id]);

  // Update document title when video data changes
  useEffect(() => {
    if (video?.title) {
      document.title = `${video.title}`;
    } else {
      document.title = 'Streamify';
    }

    // Cleanup: Reset title when component unmounts
    return () => {
      document.title = 'Streamify';
    };
  }, [video?.title]);

  // Keyboard shortcuts for video navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Only handle keyboard shortcuts if not focused on an input field
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key) {
        case 'n':
        case 'N':
          // Play next video
          if (relatedVideos.length > 0) {
            handleVideoClick(relatedVideos[0].id);
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [relatedVideos]);

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

  const fetchRelatedVideos = async () => {
    try {
      setLoadingRelatedVideos(true);
      const response = await api.get('videos/');
      
      // The API returns an array directly, not wrapped in results
      const allVideos = Array.isArray(response.data) ? response.data : response.data.results || [];
      
      // Filter out current video and show ALL other videos
      const filtered = allVideos.filter(v => v.id !== parseInt(id));
      // Sort by created_at (newest first) - show all videos, not just 10
      const sorted = filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setRelatedVideos(sorted); // Show all videos instead of limiting to 10
    } catch (err) {
      console.error('Error fetching all videos:', err);
    } finally {
      setLoadingRelatedVideos(false);
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
        showLoginPromptToast('🔐 Please login to like/dislike videos', () => navigate('/login'));
      }
    }
  };

  const handlePostComment = async () => {
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
        showLoginPromptToast('🔐 Please login to post comments', () => navigate('/login'));
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
        showLoginPromptToast('🔐 Please login to like comments', () => navigate('/login'));
      }
    }
  };

  const handleVideoClick = React.useCallback((videoId) => {
    if (videoId) {
      navigate(`/watch/${videoId}`);
    }
  }, [navigate]);

  const handleVideoEnd = () => {
    // Auto-play next video when current video ends
    if (relatedVideos.length > 0) {
      const nextVideo = relatedVideos[0];
      setTimeout(() => {
        handleVideoClick(nextVideo.id);
      }, 1000); // Wait 1 second before auto-playing next video
    } else {
      showInfoToast('🎬 No more videos to play', { autoClose: 3000 });
    }
  };

  const handlePlayNextFromSidebar = React.useCallback((playNextFn) => {
    setPlayNextFunction(() => playNextFn);
  }, []);

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
      <div className="max-w-full mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {/* Video Player Section */}
          <div className="lg:col-span-2 xl:col-span-3">
            <VideoPlayer 
              video={video} 
              onVideoEnd={handleVideoEnd}
              onPlayNext={playNextFunction}
              hasNextVideo={relatedVideos.length > 0}
            />
            
            <VideoInfo 
              video={video}
              userReaction={userReaction}
              currentUser={currentUser}
              onLikeDislike={handleLikeDislike}
              formatViews={formatViews}
              formatTimeAgo={formatTimeAgo}
            />
            
            <CommentSection
              video={video}
              comments={comments}
              newComment={newComment}
              setNewComment={setNewComment}
              currentUser={currentUser}
              loadingComments={loadingComments}
              onPostComment={handlePostComment}
              onCommentLike={handleCommentLike}
              formatTimeAgo={formatTimeAgo}
              navigate={navigate}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 xl:col-span-1">
            <VideoSidebar
              relatedVideos={relatedVideos}
              onVideoClick={handleVideoClick}
              formatViews={formatViews}
              formatTimeAgo={formatTimeAgo}
              currentVideoId={parseInt(id)}
              loading={loadingRelatedVideos}
              onPlayNext={handlePlayNextFromSidebar}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoWatch;
