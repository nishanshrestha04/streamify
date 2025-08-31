import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import ProfilePhotoUpload from '../Components/ProfilePhotoUpload';
import api from '../api';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const EditProfile = ({ onUserUpdate }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    bio: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    document.title = 'Edit Profile - Streamify';
    fetchUserProfile();
    
    return () => {
      document.title = 'Streamify';
    };
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('auth/user/');
      const userData = response.data;
      setUser(userData);
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        username: userData.username || '',
        bio: userData.bio || '',
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setLoading(false);
    } catch (err) {
      showErrorToast('Failed to load profile');
      navigate('/');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePhotoUpdate = (newPhotoUrl) => {
    // Update the user state with the new photo URL
    const updatedUser = {
      ...user,
      profile_photo: newPhotoUrl
    };
    setUser(updatedUser);
    
    // Update the parent component's user state (for navbar)
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Password validation only if changing password
    if (formData.new_password || formData.confirm_password || formData.current_password) {
      if (!formData.current_password) {
        newErrors.current_password = 'Current password is required to change password';
      }
      
      if (!formData.new_password) {
        newErrors.new_password = 'New password is required';
      } else if (formData.new_password.length < 6) {
        newErrors.new_password = 'Password must be at least 6 characters';
      }
      
      if (formData.new_password !== formData.confirm_password) {
        newErrors.confirm_password = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        username: formData.username,
        bio: formData.bio
      };

      // Add password fields only if changing password
      if (formData.new_password) {
        updateData.current_password = formData.current_password;
        updateData.new_password = formData.new_password;
      }

      await api.put('auth/user/', updateData);
      showSuccessToast('Profile updated successfully!');
      
      // Update parent component with new user data
      if (onUserUpdate) {
        onUserUpdate({
          ...user,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          username: formData.username,
          bio: formData.bio
        });
      }
      
      // Navigate back to user's profile page
      navigate('/profile');
    } catch (err) {
      if (err.response?.data) {
        const serverErrors = err.response.data;
        setErrors(serverErrors);
        showErrorToast('Please fix the errors and try again');
      } else {
        showErrorToast('Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#212121]">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Picture Section */}
          <div className="bg-white dark:bg-[#212121] rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Profile Picture</h2>
            <div className="flex items-center gap-6">
              <ProfilePhotoUpload
                currentPhoto={user?.profile_photo}
                onPhotoUpdate={handlePhotoUpdate}
                userId={user?.id}
              />
              <div className="flex-1">
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => document.querySelector('input[type="file"]')?.click()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    {user?.profile_photo ? 'Change Photo' : 'Add Photo'}
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Upload a profile picture to personalize your account.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white dark:bg-[#212121] rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#232323] text-gray-900 dark:text-white ${
                    errors.first_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter your first name"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#232323] text-gray-900 dark:text-white ${
                    errors.last_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter your last name"
                />
                {errors.last_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#232323] text-gray-900 dark:text-white ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#232323] text-gray-900 dark:text-white ${
                    errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter your username"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#232323] text-gray-900 dark:text-white"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white dark:bg-[#212121] rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Change Password</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Leave blank if you don't want to change your password
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    name="current_password"
                    value={formData.current_password}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#232323] text-gray-900 dark:text-white ${
                      errors.current_password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.current_password && (
                  <p className="text-red-500 text-sm mt-1">{errors.current_password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#232323] text-gray-900 dark:text-white ${
                      errors.new_password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.new_password && (
                  <p className="text-red-500 text-sm mt-1">{errors.new_password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#232323] text-gray-900 dark:text-white ${
                      errors.confirm_password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
