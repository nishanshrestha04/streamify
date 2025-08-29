import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

const VideoPlayer = ({ video, onTimeUpdate }) => {
  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-hide controls functionality
  const hideControlsAfterDelay = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000); // Hide after 3 seconds of inactivity
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    hideControlsAfterDelay();
  };

  const handleMouseMove = () => {
    showControlsTemporarily();
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      hideControlsAfterDelay();
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Show controls when video is paused, hide when playing
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    } else {
      hideControlsAfterDelay();
    }
  }, [isPlaying]);

  // Video player functions
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdateInternal = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      if (onTimeUpdate) {
        onTimeUpdate(time);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration && isFinite(videoRef.current.duration)) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      console.log('Video metadata loaded, duration:', videoDuration);
    }
  };

  const handleCanPlay = () => {
    // Set duration here as a fallback if not set in loadedmetadata
    if (videoRef.current && videoRef.current.duration && isFinite(videoRef.current.duration) && duration === 0) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      console.log('Video can start playing, duration set:', videoDuration);
    }
  };

  const handleDurationChange = () => {
    // Only set duration if it hasn't been set yet or if it's significantly different
    if (videoRef.current && videoRef.current.duration && isFinite(videoRef.current.duration)) {
      const videoDuration = videoRef.current.duration;
      // Only update if duration is not set yet or if there's a significant change (more than 1 second)
      if (duration === 0 || Math.abs(duration - videoDuration) > 1) {
        setDuration(videoDuration);
        console.log('Duration changed:', videoDuration);
      }
    }
  };

  const handleProgressClick = (e) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const newTime = pos * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  // Fullscreen functionality
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current?.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current?.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Format time for display
  const formatTime = (time) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Autoplay functionality
  useEffect(() => {
    if (video?.video_url && videoRef.current) {
      const videoElement = videoRef.current;
      
      // Reset duration when video changes
      setDuration(0);
      setCurrentTime(0);
      
      const handleLoadStart = () => {
        console.log('Video load started');
      };
      
      const handleLoadedData = () => {
        console.log('Video data loaded, attempting autoplay');
        
        // Ensure duration is properly set
        if (videoElement.duration && isFinite(videoElement.duration) && duration === 0) {
          setDuration(videoElement.duration);
          console.log('Duration set from loadeddata:', videoElement.duration);
        }
        
        const attemptAutoplay = async () => {
          try {
            await videoElement.play();
            setIsPlaying(true);
            console.log('Autoplay successful');
          } catch (error) {
            console.log('Autoplay failed, trying with muted:', error);
            try {
              videoElement.muted = true;
              setIsMuted(true);
              await videoElement.play();
              setIsPlaying(true);
              console.log('Autoplay successful with muted audio');
            } catch (mutedError) {
              console.log('Autoplay completely blocked:', mutedError);
            }
          }
        };
        
        setTimeout(attemptAutoplay, 100);
      };
      
      videoElement.addEventListener('loadstart', handleLoadStart);
      videoElement.addEventListener('loadeddata', handleLoadedData);
      
      return () => {
        videoElement.removeEventListener('loadstart', handleLoadStart);
        videoElement.removeEventListener('loadeddata', handleLoadedData);
      };
    }
  }, [video]);

  if (!video?.video_url) {
    return (
      <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
        <div className="w-full h-full flex items-center justify-center text-white">
          <p>Video not available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hide default video controls with inline styles */}
      <style>
        {`
          video::-webkit-media-controls {
            display: none !important;
          }
          video::-webkit-media-controls-enclosure {
            display: none !important;
          }
          video::-webkit-media-controls-panel {
            display: none !important;
          }
          video::-webkit-media-controls-play-button {
            display: none !important;
          }
          video::-webkit-media-controls-start-playback-button {
            display: none !important;
          }
          video::-moz-media-controls {
            display: none !important;
          }
          video::-ms-media-controls {
            display: none !important;
          }
        `}
      </style>

      <div 
        ref={containerRef}
        className={`relative bg-black rounded-lg overflow-hidden mb-4 group ${!showControls ? 'cursor-none' : ''}`}
        style={{ aspectRatio: '16/9' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <video 
          ref={videoRef}
          className="w-full h-full cursor-pointer"
          poster={video.thumbnail_url}
          onTimeUpdate={handleTimeUpdateInternal}
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={handleCanPlay}
          onDurationChange={handleDurationChange}
          onLoadStart={() => {
            // Additional early duration check
            setTimeout(() => {
              if (videoRef.current && videoRef.current.duration && isFinite(videoRef.current.duration) && duration === 0) {
                setDuration(videoRef.current.duration);
                console.log('Duration set from loadstart timeout:', videoRef.current.duration);
              }
            }, 500);
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlay}
          autoPlay
          muted={isMuted}
          playsInline
          preload="metadata"
          controls={false}
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
        >
          <source src={video.video_url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Custom Video Controls */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          {/* Play/Pause Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 transform hover:scale-110"
            >
              {isPlaying ? (
                <Pause size={32} className="text-white ml-1" />
              ) : (
                <Play size={32} className="text-white ml-1" />
              )}
            </button>
          </div>
          
          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {/* Progress Bar */}
            <div className="mb-4">
              <div 
                ref={progressRef}
                onClick={handleProgressClick}
                className="group/progress relative h-2 bg-white/20 rounded-full cursor-pointer hover:h-3 transition-all duration-200"
              >
                {/* Background Track */}
                <div className="absolute inset-0 bg-gray-700/80 rounded-full" />
                
                {/* Progress Fill */}
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-red-400 to-red-300 rounded-full transition-all duration-200 shadow-lg"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
                
                {/* Progress Thumb */}
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-all duration-200 border-2 border-white"
                  style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
                
                {/* Glow Effect */}
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-400 to-red-300 rounded-full blur-sm opacity-50"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                  />
                </div>
                
                <div className="text-sm font-medium">
                  {formatTime(currentTime)} / {formatTime(duration)}
                  {duration === 0 && (
                    <span className="text-red-400 ml-2">(Loading...)</span>
                  )}
                </div>
              </div>
              
              <button
                onClick={toggleFullscreen}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              >
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoPlayer;
