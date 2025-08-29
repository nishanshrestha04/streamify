import React from 'react';
import { MessageCircle, Send, Heart } from 'lucide-react';

const CommentSection = ({ 
  video,
  comments,
  newComment,
  setNewComment,
  currentUser,
  loadingComments,
  onPostComment,
  onCommentLike,
  formatTimeAgo,
  navigate
}) => {
  const getUserInitial = (user) => {
    if (user?.first_name) return user.first_name[0];
    if (user?.username) return user.username[0];
    return 'U';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onPostComment();
    }
  };

  return (
    <div className="bg-white dark:bg-[#212121] rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={20} className="text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {video.comments_count || 0} Comments
        </h3>
      </div>

      {/* Comment Form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              {getUserInitial(currentUser)}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
              <div className="flex justify-end mt-2">
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
      ) : (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            Sign in to add a comment
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      )}

      {/* Comments List */}
      {loadingComments ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle size={48} className="text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No comments yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                {getUserInitial(comment.user)}
              </div>
              
              <div className="flex-1">
                <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {comment.user?.first_name && comment.user?.last_name 
                        ? `${comment.user.first_name} ${comment.user.last_name}`
                        : comment.user?.username || 'Anonymous'
                      }
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {comment.content}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 mt-2 ml-3">
                  <button
                    onClick={() => onCommentLike(comment.id)}
                    className={`flex items-center gap-1 text-sm transition-colors ${
                      comment.user_has_liked
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                    }`}
                  >
                    <Heart 
                      size={16} 
                      className={comment.user_has_liked ? 'fill-current' : ''} 
                    />
                    <span>{comment.likes_count || 0}</span>
                  </button>
                  
                  <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
