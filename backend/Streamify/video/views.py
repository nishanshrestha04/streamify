from django.shortcuts import render, get_object_or_404
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from django.db.models import Q, F
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Video, VideoLike, VideoView
from .serializers import (
    VideoSerializer, VideoUploadSerializer, VideoLikeSerializer, 
    VideoListSerializer
)
from accounts.models import Users
import os
from datetime import timedelta
from django.http import JsonResponse

@method_decorator(csrf_exempt, name='dispatch')
class VideoUploadView(generics.CreateAPIView):
    serializer_class = VideoUploadSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        """Set the uploader to the authenticated user"""
        try:
            # Get the Users model instance from the authenticated user
            if hasattr(self.request.user, 'users_instance'):
                # If using CustomUser, get the underlying Users instance
                user = self.request.user.users_instance
            else:
                # Fallback: try to find by username
                user = Users.objects.get(username=self.request.user.username)
                
            serializer.save(
                uploader=user,
                file_size=serializer.validated_data['video_file'].size,
                processing_status='ready'
            )
        except Users.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("User profile not found")
        except Exception as e:
            from rest_framework.exceptions import ValidationError
            raise ValidationError(f"Error creating video: {str(e)}")
    
    def create(self, request, *args, **kwargs):
        """Override create to return custom response"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return full video details using VideoSerializer
        response_serializer = VideoSerializer(serializer.instance, context={'request': request})
        return Response({
            'message': 'Video uploaded successfully!',
            'video': response_serializer.data
        }, status=status.HTTP_201_CREATED)

class VideoListView(generics.ListAPIView):
    serializer_class = VideoListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Video.objects.filter(
            visibility='public',
            processing_status='ready'
        ).select_related('uploader')
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        # Filter by uploader
        uploader = self.request.query_params.get('uploader', None)
        if uploader:
            queryset = queryset.filter(uploader__username=uploader)
        
        return queryset.order_by('-created_at')

class VideoDetailView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, video_id):
        try:
            video = get_object_or_404(
                Video.objects.select_related('uploader'),
                id=video_id,
                processing_status='ready'
            )
            
            # Check if video is private and user has permission
            if video.visibility == 'private':
                if not request.user.is_authenticated or video.uploader.username != request.user.username:
                    return Response({
                        'error': 'Video not found or you do not have permission to view it.'
                    }, status=status.HTTP_404_NOT_FOUND)
            
            # Track view (only for authenticated users)
            if request.user.is_authenticated:
                self._track_view(request, video)
            
            serializer = VideoSerializer(video, context={'request': request})
            return Response(serializer.data)
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _track_view(self, request, video):
        """Track video view"""
        ip_address = self._get_client_ip(request)
        user = None
        
        if request.user.is_authenticated:
            try:
                user = Users.objects.get(username=request.user.username)
            except Users.DoesNotExist:
                pass
        
        # Check if view already exists
        view_exists = VideoView.objects.filter(
            video=video,
            ip_address=ip_address,
            user=user
        ).exists()
        
        if not view_exists:
            VideoView.objects.create(
                video=video,
                ip_address=ip_address,
                user=user
            )
            # Increment view count
            video.views = F('views') + 1
            video.save(update_fields=['views'])
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class VideoLikeView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, video_id):
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return Response({
                'error': 'Authentication required',
                'message': 'Please login to like or dislike videos',
                'login_required': True
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            video = get_object_or_404(Video, id=video_id)
            
            # Get the authenticated user
            if hasattr(request.user, 'users_instance'):
                user = request.user.users_instance
            else:
                user = get_object_or_404(Users, username=request.user.username)
            
            reaction = request.data.get('reaction')
            
            if reaction not in ['like', 'dislike']:
                return Response({
                    'error': 'Invalid reaction. Must be "like" or "dislike".'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user already has a reaction
            existing_like = VideoLike.objects.filter(user=user, video=video).first()
            
            if existing_like:
                if existing_like.reaction == reaction:
                    # User clicked the same reaction - remove it (toggle off)
                    existing_like.delete()
                    if reaction == 'like':
                        video.likes = F('likes') - 1
                    else:
                        video.dislikes = F('dislikes') - 1
                    video.save(update_fields=['likes', 'dislikes'])
                    video.refresh_from_db()
                    
                    return Response({
                        'message': f'{reaction.capitalize()} removed!',
                        'likes': video.likes,
                        'dislikes': video.dislikes,
                        'user_reaction': None
                    })
                else:
                    # User switched from like to dislike or vice versa
                    old_reaction = existing_like.reaction
                    existing_like.reaction = reaction
                    existing_like.save()
                    
                    # Update counters
                    if old_reaction == 'like':
                        video.likes = F('likes') - 1
                        video.dislikes = F('dislikes') + 1
                    else:
                        video.dislikes = F('dislikes') - 1
                        video.likes = F('likes') + 1
                    video.save(update_fields=['likes', 'dislikes'])
                    video.refresh_from_db()
                    
                    return Response({
                        'message': f'Changed to {reaction}!',
                        'likes': video.likes,
                        'dislikes': video.dislikes,
                        'user_reaction': reaction
                    })
            else:
                # New reaction
                VideoLike.objects.create(user=user, video=video, reaction=reaction)
                if reaction == 'like':
                    video.likes = F('likes') + 1
                else:
                    video.dislikes = F('dislikes') + 1
                video.save(update_fields=['likes', 'dislikes'])
                video.refresh_from_db()
                
                return Response({
                    'message': f'Video {reaction}d!',
                    'likes': video.likes,
                    'dislikes': video.dislikes,
                    'user_reaction': reaction
                })
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, video_id):
        try:
            video = get_object_or_404(Video, id=video_id)
            user = get_object_or_404(Users, username=request.user.username)
            
            video_like = VideoLike.objects.filter(user=user, video=video).first()
            if video_like:
                reaction = video_like.reaction
                video_like.delete()
                
                # Update counters
                if reaction == 'like':
                    video.likes = F('likes') - 1
                else:
                    video.dislikes = F('dislikes') - 1
                video.save(update_fields=['likes', 'dislikes'])
                
                # Refresh video from database
                video.refresh_from_db()
                
                return Response({
                    'message': 'Reaction removed successfully!',
                    'likes': video.likes,
                    'dislikes': video.dislikes,
                    'user_reaction': None
                })
            
            return Response({
                'error': 'No reaction found to remove.'
            }, status=status.HTTP_404_NOT_FOUND)
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserVideosView(generics.ListAPIView):
    serializer_class = VideoListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = get_object_or_404(Users, username=self.request.user.username)
        return Video.objects.filter(uploader=user).order_by('-created_at')

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def video_stats(request, video_id):
    """Get video statistics"""
    try:
        video = get_object_or_404(Video, id=video_id)
        
        # Get user's reaction if authenticated
        user_reaction = None
        if request.user.is_authenticated:
            try:
                user = Users.objects.get(username=request.user.username)
                video_like = VideoLike.objects.filter(user=user, video=video).first()
                if video_like:
                    user_reaction = video_like.reaction
            except Users.DoesNotExist:
                pass
        
        return Response({
            'views': video.views,
            'likes': video.likes,
            'dislikes': video.dislikes,
            'user_reaction': user_reaction
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
