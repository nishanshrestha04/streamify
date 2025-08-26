from django.shortcuts import render
from rest_framework import generics, status, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Comment, CommentLike
from .serializers import CommentSerializer, CommentCreateSerializer, CommentListSerializer
from video.models import Video

class CommentListView(generics.ListAPIView):
    serializer_class = CommentListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        video_id = self.kwargs['video_id']
        # Only get top-level comments (not replies)
        return Comment.objects.filter(video_id=video_id, parent=None)

class CommentCreateView(generics.CreateAPIView):
    serializer_class = CommentCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        # Get the user from the Users model
        from accounts.models import Users
        try:
            # Handle our custom authentication
            if hasattr(self.request.user, 'users_instance'):
                user = self.request.user.users_instance
            else:
                user = Users.objects.get(username=self.request.user.username)
            serializer.save(user=user)
        except Users.DoesNotExist:
            from rest_framework.exceptions import AuthenticationFailed
            raise AuthenticationFailed("User not found")

class ToggleCommentLikeView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, comment_id):
        """Toggle like on a comment"""
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return Response({
                'error': 'Authentication required',
                'message': 'Please login to like comments',
                'login_required': True
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        comment = get_object_or_404(Comment, id=comment_id)
        
        # Get the user from the Users model
        from accounts.models import Users
        try:
            # Handle our custom authentication
            if hasattr(request.user, 'users_instance'):
                user = request.user.users_instance
            else:
                user = Users.objects.get(username=request.user.username)
        except Users.DoesNotExist:
            return Response({'error': 'User not found'}, status=400)
        
        comment_like, created = CommentLike.objects.get_or_create(
            user=user,
            comment=comment
        )
        
        if created:
            # User liked the comment
            comment.likes += 1
            comment.save()
            return Response({
                'liked': True,
                'likes_count': comment.likes
            })
        else:
            # User unliked the comment
            comment_like.delete()
            comment.likes = max(0, comment.likes - 1)
            comment.save()
            return Response({
                'liked': False,
                'likes_count': comment.likes
            })

class CommentRepliesView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, comment_id):
        """Get all replies for a comment"""
        comment = get_object_or_404(Comment, id=comment_id)
        replies = comment.replies.all()
        serializer = CommentSerializer(replies, many=True, context={'request': request})
        return Response(serializer.data)