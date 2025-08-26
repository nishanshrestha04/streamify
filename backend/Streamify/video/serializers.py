from rest_framework import serializers
from .models import Video, VideoLike, VideoView
from accounts.models import Users
import os
from django.core.files.uploadedfile import InMemoryUploadedFile, TemporaryUploadedFile

class UploaderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['id', 'username', 'first_name', 'last_name']

class VideoSerializer(serializers.ModelSerializer):
    uploader = UploaderSerializer(read_only=True)
    video_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    formatted_duration = serializers.SerializerMethodField()
    formatted_file_size = serializers.ReadOnlyField()
    user_reaction = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Video
        fields = [
            'id', 'title', 'description', 'video_url', 'thumbnail_url',
            'uploader', 'views', 'likes', 'dislikes', 'duration',
            'formatted_duration', 'file_size', 'formatted_file_size',
            'visibility', 'processing_status', 'user_reaction', 'comments_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['uploader', 'views', 'likes', 'dislikes', 'processing_status']
    
    def get_video_url(self, obj):
        if obj.video_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.video_file.url)
            return obj.video_file.url
        return None
    
    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
            return obj.thumbnail.url
        return None
    
    def get_formatted_duration(self, obj):
        # If we have a real duration from the video file, use it
        if obj.duration:
            total_seconds = int(obj.duration.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            
            if hours > 0:
                return f"{hours}:{minutes:02d}:{seconds:02d}"
            else:
                return f"{minutes}:{seconds:02d}"
        
        # For videos without duration data, estimate based on file size
        if hasattr(obj, 'file_size') and obj.file_size:
            if obj.file_size < 1000000:  # < 1MB
                return "0:04"  # 4 seconds
            elif obj.file_size < 5000000:  # < 5MB
                return "0:15"  # 15 seconds
            elif obj.file_size < 10000000:  # < 10MB
                return "1:30"  # 1 minute 30 seconds
            else:
                return "3:45"  # 3 minutes 45 seconds
        
        # Final fallback
        return "0:04"
    
    def get_user_reaction(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                from accounts.models import Users
                user = Users.objects.get(username=request.user.username)
                video_like = VideoLike.objects.filter(user=user, video=obj).first()
                return video_like.reaction if video_like else None
            except Users.DoesNotExist:
                pass
        return None
    
    def get_comments_count(self, obj):
        return obj.comments.count()

class VideoUploadSerializer(serializers.ModelSerializer):
    video_file = serializers.FileField()
    thumbnail = serializers.ImageField(required=False)
    
    class Meta:
        model = Video
        fields = ['title', 'description', 'video_file', 'thumbnail', 'visibility']
    
    def validate_video_file(self, value):
        """Validate video file"""
        # Check file size (limit to 500MB)
        max_size = 500 * 1024 * 1024  # 500MB
        if value.size > max_size:
            raise serializers.ValidationError("Video file size cannot exceed 500MB.")
        
        # Check file extension
        allowed_extensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                f"Invalid video format. Allowed formats: {', '.join(allowed_extensions)}"
            )
        
        return value
    
    def validate_thumbnail(self, value):
        """Validate thumbnail image"""
        if value:
            # Check file size (limit to 5MB)
            max_size = 5 * 1024 * 1024  # 5MB
            if value.size > max_size:
                raise serializers.ValidationError("Thumbnail size cannot exceed 5MB.")
            
            # Check file extension
            allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
            ext = os.path.splitext(value.name)[1].lower()
            if ext not in allowed_extensions:
                raise serializers.ValidationError(
                    f"Invalid image format. Allowed formats: {', '.join(allowed_extensions)}"
                )
        
        return value

class VideoLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoLike
        fields = ['reaction', 'created_at']
        read_only_fields = ['created_at']

class VideoListSerializer(serializers.ModelSerializer):
    uploader = UploaderSerializer(read_only=True)
    thumbnail_url = serializers.SerializerMethodField()
    formatted_duration = serializers.SerializerMethodField()
    user_reaction = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Video
        fields = [
            'id', 'title', 'thumbnail_url', 'uploader', 'views',
            'likes', 'dislikes', 'formatted_duration', 'user_reaction',
            'comments_count', 'created_at'
        ]
    
    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
            return obj.thumbnail.url
        return None
    
    def get_formatted_duration(self, obj):
        # If we have a real duration from the video file, use it
        if obj.duration:
            total_seconds = int(obj.duration.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            
            if hours > 0:
                return f"{hours}:{minutes:02d}:{seconds:02d}"
            else:
                return f"{minutes}:{seconds:02d}"
        
        # For videos without duration data, estimate based on file size
        if hasattr(obj, 'file_size') and obj.file_size:
            if obj.file_size < 1000000:  # < 1MB
                return "0:04"  # 4 seconds
            elif obj.file_size < 5000000:  # < 5MB
                return "0:15"  # 15 seconds
            elif obj.file_size < 10000000:  # < 10MB
                return "1:30"  # 1 minute 30 seconds
            else:
                return "3:45"  # 3 minutes 45 seconds
        
        # Final fallback
        return "0:04"

    def get_user_reaction(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                from accounts.models import Users
                user = Users.objects.get(username=request.user.username)
                video_like = VideoLike.objects.filter(user=user, video=obj).first()
                return video_like.reaction if video_like else None
            except Users.DoesNotExist:
                pass
        return None
    
    def get_comments_count(self, obj):
        return obj.comments.count()
