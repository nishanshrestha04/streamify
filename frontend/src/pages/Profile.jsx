import { Calendar, Eye, Settings, ThumbsUp, Video, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserAvatar from '../Components/UserAvatar';
import ConfirmationModal from '../Components/ConfirmationModal';
import api, { deleteVideo } from '../api';
import { formatTimeAgo, formatViews } from '../utils/videoUtils';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const Profile = ({ onUserUpdate, currentUser: propCurrentUser }) => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(propCurrentUser || null);
  const [activeTab, setActiveTab] = useState('videos');
  const [stats, setStats] = useState({
    totalViews: 0,
    totalVideos: 0,
    totalLikes: 0
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    videoId: null,
    videoTitle: ''
  });

  // Update currentUser when propCurrentUser changes
  useEffect(() => {
    if (propCurrentUser) {
      setCurrentUser(propCurrentUser);
    }
  }, [propCurrentUser]);

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    } else {
      fetchCurrentUserProfile();
    }
    if (!propCurrentUser) {
      getCurrentUser();
    }
  }, [username, propCurrentUser]);

  useEffect(() => {
    if (user?.first_name) {
      document.title = `${user.first_name} ${user.last_name} - Streamify`;
    } else {
      document.title = 'Profile - Streamify';
    }

    return () => {
      document.title = 'Streamify';
    };
  }, [user?.username]);
  

  const getCurrentUser = async () => {
    try {
      const response = await api.get('auth/user/');
      setCurrentUser(response.data);
    } catch (err) {
      setCurrentUser(null);
    }
  };

  const fetchCurrentUserProfile = async () => {
    try {
      const response = await api.get('auth/user/');
      setUser(response.data);
      fetchUserVideos(response.data);
    } catch (err) {
      console.error('Error fetching current user profile:', err);
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await api.get(`user/${username}/`);
      setUser(response.data);
      fetchUserVideos(response.data);
    } catch (err) {
      setError('User not found');
      setLoading(false);
    }
  };

  const fetchUserVideos = async (userObj = null) => {
    try {
      const userToUse = userObj || user;
      if (!userToUse?.username) return;
      
      const response = await api.get(`videos/?uploader=${userToUse.username}`);
      const userVideos = response.data.results || response.data;
      setVideos(userVideos);
      
      // Calculate stats
      const totalViews = userVideos.reduce((sum, video) => sum + video.views, 0);
      const totalLikes = userVideos.reduce((sum, video) => sum + video.likes, 0);
      setStats({
        totalViews,
        totalVideos: userVideos.length,
        totalLikes
      });
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load videos');
      setLoading(false);
    }
  };

  const handleVideoClick = (videoId) => {
    navigate(`/watch/${videoId}`);
  };

  const handleDeleteVideo = async (videoId, videoTitle, event) => {
    // Prevent the video click event from firing
    event.stopPropagation();
    
    // Open confirmation modal
    setDeleteModal({
      isOpen: true,
      videoId,
      videoTitle
    });
  };

  const confirmDeleteVideo = async () => {
    try {
      const { videoId, videoTitle } = deleteModal;
      
      await deleteVideo(videoId);
      
      // Remove the video from the local state
      setVideos(prevVideos => prevVideos.filter(video => video.id !== videoId));
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        totalVideos: prevStats.totalVideos - 1
      }));
      
      // Close modal
      setDeleteModal({ isOpen: false, videoId: null, videoTitle: '' });
      
      // Show success toast
      showSuccessToast(`Video "${videoTitle}" deleted successfully!`);
      
    } catch (error) {
      console.error('Failed to delete video:', error);
      showErrorToast('Failed to delete video. Please try again.');
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, videoId: null, videoTitle: '' });
  };

  const navigateToUserProfile = (username) => {
    navigate(`/@${username}`);
  };

  const handlePhotoUpdate = (newPhotoUrl) => {
    // Update the user state with the new photo URL
    setUser(prevUser => ({
      ...prevUser,
      profile_photo: newPhotoUrl
    }));
    
    // Also update currentUser if this is the user's own profile
    if (currentUser && user && currentUser.id === user.id) {
      const updatedUser = {
        ...currentUser,
        profile_photo: newPhotoUrl
      };
      setCurrentUser(updatedUser);
      
      // Update the parent component's user state (for navbar)
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
    }
  };

  // Determine if this is the user's own profile
  const isOwnProfile = () => {
    // If no username in URL, this is definitely the current user's profile page
    if (!username) return true;
    
    // If username matches current user's username, it's their profile
    if (currentUser && user) {
      return currentUser.id === user.id || currentUser.username === user.username;
    }
    
    return false;
  };

  const isOwn = isOwnProfile();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#181818] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#181818] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#212121]">
      {/* Profile Header */}
      <div className="bg-white dark:bg-[#212121]">
        <div className="max-w-7xl mx-auto px-4 py-8 bg-white dark:bg-[#212121]">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Profile Avatar */}
            <div className="flex-shrink-0">
              <UserAvatar user={user} size="2xl" />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {user?.first_name && user?.last_name 
                      ? `${user.first_name} ${user.last_name}` 
                      : user?.username}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">@{user?.username}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Video className="w-4 h-4" />
                      {stats.totalVideos} videos
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {formatViews(stats.totalViews)} views
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      {formatViews(stats.totalLikes)} likes
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {formatTimeAgo(user?.created_at)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4 md:mt-0">
                  {isOwn ? (
                    <>
                      <button
                        onClick={() => navigate('/edit-profile')}
                        className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Edit Profile
                      </button>
                    </>
                  ) : (
                    <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors">
                      Subscribe
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="bg-white dark:bg-[#212121] border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 bg-white dark:bg-[#212121]">
          <div className="flex space-x-8 ">
            {[
              { id: 'videos', label: 'Videos', count: stats.totalVideos },
              { id: 'about', label: 'About' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 text-sm text-gray-500">({tab.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 ">
        {activeTab === 'videos' && (
          <div>
            {videos.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No videos uploaded yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {isOwn 
                    ? "Upload your first video to get started!" 
                    : "This user hasn't uploaded any videos yet."}
                </p>
                {isOwn && (
                  <button
                    onClick={() => navigate('/create-video')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                  >
                    Upload Video
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map(video => (
                  <div
                    key={video.id}
                    onClick={() => video.processing_status === 'ready' ? handleVideoClick(video.id) : null}
                    className={`bg-white dark:bg-[#212121] rounded-lg overflow-hidden shadow-sm transition-shadow ${
                      video.processing_status === 'ready' 
                        ? 'hover:shadow-md cursor-pointer' 
                        : 'opacity-70 cursor-not-allowed'
                    }`}
                  >
                    {/* Video Thumbnail */}
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative group">
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      {video.duration && (
                        <span className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                          {video.duration}
                        </span>
                      )}
                      {/* Delete button - only show on own profile */}
                      {isOwn && (
                        <button
                          onClick={(e) => handleDeleteVideo(video.id, video.title, e)}
                          className="absolute top-2 right-2 bg-red-600 bg-opacity-80 hover:bg-opacity-100 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          title="Delete video"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {video.title}
                      </h3>
                      
                      {/* Processing Status */}
                      {video.processing_status && video.processing_status !== 'ready' && (
                        <div className="mb-2">
                          {video.processing_status === 'processing' && (
                            <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                              Processing...
                            </div>
                          )}
                          {video.processing_status === 'transcribing' && (
                            <div className="flex items-center text-yellow-600 dark:text-yellow-400 text-sm">
                              <div className="animate-pulse rounded-full h-3 w-3 bg-yellow-600 mr-2"></div>
                              Transcribing...
                            </div>
                          )}
                          {video.processing_status === 'failed' && (
                            <div className="flex items-center text-red-600 dark:text-red-400 text-sm">
                              <div className="rounded-full h-3 w-3 bg-red-600 mr-2"></div>
                              Processing Failed
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>{formatViews(video.views)} views</span>
                          <span>{formatTimeAgo(video.created_at)}</span>
                        </div>
                        {video.description && (
                          <p className="line-clamp-2 text-xs">
                            {video.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white dark:bg-[#212121] rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {user?.bio || "No bio available."}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Stats</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalVideos}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Videos</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatViews(stats.totalViews)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatViews(stats.totalLikes)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Likes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteVideo}
        title="Delete Video"
        message={`Are you sure you want to delete "${deleteModal.videoTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonColor="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};

export default Profile;
