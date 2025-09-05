from django.db import models
from accounts.models import Users
import os
from django.utils import timezone

def video_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f"{instance.title}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.{ext}"
    return os.path.join('videos/', filename)

def thumbnail_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f"thumb_{instance.title}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.{ext}"
    return os.path.join('thumbnails/', filename)

class Video(models.Model):
    VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('unlisted', 'Unlisted'),
        ('private', 'Private'),
    ]
    
    PROCESSING_STATUS_CHOICES = [
        ('uploading', 'Uploading'),
        ('processing', 'Processing'),

        ('transcribing', 'Transcribing'),
        ('ready', 'Ready'),
        ('failed', 'Failed'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    video_file = models.FileField(upload_to=video_upload_path)
    thumbnail = models.ImageField(upload_to=thumbnail_upload_path, blank=True, null=True)
    uploader = models.ForeignKey(Users, on_delete=models.CASCADE, related_name='videos')
    views = models.PositiveIntegerField(default=0)
    likes = models.PositiveIntegerField(default=0)
    dislikes = models.PositiveIntegerField(default=0)
    duration = models.DurationField(blank=True, null=True)
    file_size = models.BigIntegerField(blank=True, null=True)  # in bytes
    visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES, default='public')
    processing_status = models.CharField(max_length=20, choices=PROCESSING_STATUS_CHOICES, default='uploading')
    transcript = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def formatted_duration(self):
        """Return duration in HH:MM:SS format"""
        if self.duration:
            total_seconds = int(self.duration.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            
            if hours > 0:
                return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            else:
                return f"{minutes:02d}:{seconds:02d}"
        return "00:00"
    
    @property
    def formatted_file_size(self):
        """Return file size in human readable format"""
        if self.file_size:
            for unit in ['B', 'KB', 'MB', 'GB']:
                if self.file_size < 1024.0:
                    return f"{self.file_size:.1f} {unit}"
                self.file_size /= 1024.0
            return f"{self.file_size:.1f} TB"
        return "Unknown"

class VideoLike(models.Model):
    REACTION_CHOICES = [
        ('like', 'Like'),
        ('dislike', 'Dislike'),
    ]
    
    user = models.ForeignKey(Users, on_delete=models.CASCADE)
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='reactions')
    reaction = models.CharField(max_length=10, choices=REACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'video')
    
    def __str__(self):
        return f"{self.user.username} {self.reaction}s {self.video.title}"

class VideoView(models.Model):
    user = models.ForeignKey(Users, on_delete=models.CASCADE, null=True, blank=True)
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='video_views')
    ip_address = models.GenericIPAddressField()
    watched_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'video', 'ip_address')
    
    def __str__(self):
        return f"View of {self.video.title} by {self.user.username if self.user else self.ip_address}"
