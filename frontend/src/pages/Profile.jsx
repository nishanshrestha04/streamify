import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Calendar, Video, Eye, ThumbsUp, Settings, Upload } from 'lucide-react';
import { formatViews, formatTimeAgo } from '../utils/videoUtils';
import api from '../api';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('videos');
  const [stats, setStats] = useState({
    totalViews: 0,
    totalVideos: 0,
    totalLikes: 0
  });

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    } else {
      // If no username provided, show current user's profile
      fetchCurrentUserProfile();
    }
    getCurrentUser();
  }, [username]);

  // Update document title when user data changes
  useEffect(() => {
    if (user?.first_name) {
      document.title = `${user.first_name} ${user.last_name} - Streamify`;
    } else {
      document.title = 'Profile - Streamify';
    }

    // Cleanup: Reset title when component unmounts
    return () => {
      document.title = 'Streamify';
    };
  }, [user?.username]);
  

  const getCurrentUser = async () => {
    try {
      const response = await api.get('auth/user/');
      setCurrentUser(response.data);
    } catch (err) {
      // User not logged in
      setCurrentUser(null);
    }
  };

  const fetchCurrentUserProfile = async () => {
    try {
      const response = await api.get('auth/user/');
      setUser(response.data);
      fetchUserVideos(response.data);
    } catch (err) {
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

  const navigateToUserProfile = (username) => {
    navigate(`/@${username}`);
  };

  const isOwnProfile = currentUser && user && currentUser.id === user.id;

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
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-16 h-16 text-white" />
              </div>
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
                  {isOwnProfile ? (
                    <>
                      <button
                        onClick={() => navigate('/settings')}
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
                  {isOwnProfile 
                    ? "Upload your first video to get started!" 
                    : "This user hasn't uploaded any videos yet."}
                </p>
                {isOwnProfile && (
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
                    onClick={() => handleVideoClick(video.id)}
                    className="bg-white dark:bg-[#212121] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    {/* Video Thumbnail */}
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
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
                    </div>

                    {/* Video Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {video.title}
                      </h3>
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
                  Welcome to my channel! I create amazing content for you to enjoy.
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

        {(activeTab === 'shorts' || activeTab === 'playlists') && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === 'shorts' ? 'Shorts' : 'Playlists'} feature will be available soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
