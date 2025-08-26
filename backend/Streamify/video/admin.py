from django.contrib import admin
from .models import Video, VideoLike, VideoView

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ['title', 'uploader', 'views', 'likes', 'dislikes', 'visibility', 'processing_status', 'created_at']
    list_filter = ['visibility', 'processing_status', 'created_at', 'uploader']
    search_fields = ['title', 'description', 'uploader__username']
    readonly_fields = ['views', 'likes', 'dislikes', 'file_size', 'duration', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'uploader', 'visibility')
        }),
        ('Files', {
            'fields': ('video_file', 'thumbnail')
        }),
        ('Statistics', {
            'fields': ('views', 'likes', 'dislikes', 'duration', 'file_size'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('processing_status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(VideoLike)
class VideoLikeAdmin(admin.ModelAdmin):
    list_display = ['user', 'video', 'reaction', 'created_at']
    list_filter = ['reaction', 'created_at']
    search_fields = ['user__username', 'video__title']
    ordering = ['-created_at']

@admin.register(VideoView)
class VideoViewAdmin(admin.ModelAdmin):
    list_display = ['user', 'video', 'ip_address', 'watched_at']
    list_filter = ['watched_at']
    search_fields = ['user__username', 'video__title', 'ip_address']
    ordering = ['-watched_at']
