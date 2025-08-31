import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import api from '../api';

const ProfilePhotoUpload = ({ currentPhoto, onPhotoUpdate, userId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentPhoto);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);

      // Upload the file
      uploadPhoto(file);
    }
  };

  const uploadPhoto = async (file) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('profile_photo', file);

      const response = await api.put('auth/user/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update the parent component with the new photo URL
      if (onPhotoUpdate) {
        onPhotoUpdate(response.data.profile_photo);
      }

      setPreviewUrl(response.data.profile_photo);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
      // Reset preview to current photo on error
      setPreviewUrl(currentPhoto);
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = async () => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('profile_photo', ''); // Send empty string to remove photo

      const response = await api.put('auth/user/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (onPhotoUpdate) {
        onPhotoUpdate(null);
      }

      setPreviewUrl(null);
    } catch (error) {
      console.error('Error removing photo:', error);
      alert('Failed to remove photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      {/* Profile Photo Display */}
      <div className="relative w-32 h-32 rounded-full overflow-hidden">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Camera className="w-16 h-16 text-white" />
          </div>
        )}

        {/* Loading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}

        {/* Add Photo Button for no photo state */}
        {!previewUrl && !isUploading && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 rounded-full flex items-center justify-center transition-all duration-200"
            title="Add profile photo"
          >
            <div className="bg-white bg-opacity-90 rounded-full p-3">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute -bottom-2 -right-2 flex gap-1">
        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white p-2 rounded-full shadow-lg transition-colors"
          title={previewUrl ? "Change photo" : "Add photo"}
        >
          <Upload className="w-4 h-4" />
        </button>

        {/* Remove Button */}
        {previewUrl && (
          <button
            onClick={removePhoto}
            disabled={isUploading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white p-2 rounded-full shadow-lg transition-colors"
            title="Remove photo"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ProfilePhotoUpload;
