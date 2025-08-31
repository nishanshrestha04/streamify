import React from 'react';
import { toast } from 'react-toastify';
import '../styles/toast.css';

// Keep track of recent toasts to prevent duplicates
const recentToasts = new Set();

const preventDuplicate = (message, type) => {
  const key = `${type}:${message}`;
  if (recentToasts.has(key)) {
    return true; // Skip duplicate
  }
  recentToasts.add(key);
  setTimeout(() => recentToasts.delete(key), 2000); // Clear after 2 seconds
  return false;
};

// Custom toast configurations with beautiful styling
export const showSuccessToast = (message, options = {}) => {
  if (preventDuplicate(message, 'success')) return;
  
  return toast.success(message, {
    autoClose: 3000, // Increased from 1000 to 3000
    className: 'toast-bounce',
    style: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      fontWeight: '500',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    progressStyle: {
      background: 'rgba(255, 255, 255, 0.8)',
    },
    ...options,
  });
};

export const showErrorToast = (message, options = {}) => {
  if (preventDuplicate(message, 'error')) return;
  
  return toast.error(message, {
    autoClose: 4000, // Increased from 1000 to 4000 for errors
    className: 'toast-bounce',
    style: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      fontWeight: '500',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    progressStyle: {
      background: 'rgba(255, 255, 255, 0.8)',
    },
    ...options,
  });
};

export const showInfoToast = (message, options = {}) => {
  if (preventDuplicate(message, 'info')) return;
  
  return toast.info(message, {
    autoClose: 3000, // Increased from 1000 to 3000
    style: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      color: 'white',
      fontWeight: '500',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    progressStyle: {
      background: 'rgba(255, 255, 255, 0.8)',
    },
    ...options,
  });
};

export const showWarningToast = (message, options = {}) => {
  if (preventDuplicate(message, 'warning')) return;
  
  return toast.warning(message, {
    autoClose: 3000, // Increased from 1000 to 3000
    style: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: 'white',
      fontWeight: '500',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    progressStyle: {
      background: 'rgba(255, 255, 255, 0.8)',
    },
    ...options,
  });
};

// Enhanced login prompt toast with action button
export const showLoginPromptToast = (message, onLoginClick, options = {}) => {
  const ToastContent = () => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span>{message}</span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onLoginClick();
        }}
        className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold py-1.5 px-3 rounded-lg transition-all duration-200 border border-white/30 hover:border-white/50 self-start"
      >
        Go to Login →
      </button>
    </div>
  );

  return toast.warning(<ToastContent />, {
    autoClose: 1000,
    className: 'toast-clickable',
    onClick: onLoginClick,
    style: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: 'white',
      fontWeight: '500',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(245, 158, 11, 0.4)',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      cursor: 'pointer',
      position: 'relative',
      fontSize: '14px',
      minHeight: '70px',
      padding: '16px',
    },
    progressStyle: {
      background: 'rgba(255, 255, 255, 0.8)',
    },
    closeButton: false,
    ...options,
  });
};

// Simple auth notification without button (for less intrusive prompts)
export const showAuthNotification = (message, onLoginClick, options = {}) => {
  return toast.info(message, {
    autoClose: 1000,
    onClick: onLoginClick,
    style: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      color: 'white',
      fontWeight: '500',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      cursor: 'pointer',
    },
    progressStyle: {
      background: 'rgba(255, 255, 255, 0.8)',
    },
    ...options,
  });
};

// Loading toast for long operations
export const showLoadingToast = (message, options = {}) => {
  return toast.loading(message, {
    style: {
      background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
      color: 'white',
      fontWeight: '500',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(107, 114, 128, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    ...options,
  });
};

// Update existing loading toast
export const updateLoadingToast = (toastId, message, type = 'success', options = {}) => {
  const baseStyle = {
    fontWeight: '500',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const typeStyles = {
    success: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
    },
    error: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
    },
    info: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
    },
    warning: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)',
    },
  };

  return toast.update(toastId, {
    render: message,
    type: type,
    isLoading: false,
    autoClose: type === 'error' ? 5000 : 3000,
    style: {
      ...baseStyle,
      ...typeStyles[type],
      color: 'white',
    },
    progressStyle: {
      background: 'rgba(255, 255, 255, 0.8)',
    },
    ...options,
  });
};

// Default ToastContainer configuration
export const toastConfig = {
  position: "top-center",
  autoClose: 1000,
  hideProgressBar: false,
  newestOnTop: true,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
  theme: "colored",
  toastStyle: {
    fontFamily: 'inherit',
    fontSize: '14px',
    borderRadius: '12px',
  },
  style: {
    marginTop: '60px', // Account for any fixed headers
  }
};
