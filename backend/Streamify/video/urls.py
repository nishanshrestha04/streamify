from django.urls import path
from . import views

urlpatterns = [
    # Video upload
    path('create/', views.VideoUploadView.as_view(), name='video-upload'),
    
    # Video list and search
    path('', views.VideoListView.as_view(), name='video-list'),
    
    # Video detail
    path('<int:video_id>/', views.VideoDetailView.as_view(), name='video-detail'),
    
    # Video like/dislike
    path('<int:video_id>/like/', views.VideoLikeView.as_view(), name='video-like'),
    
    # Video statistics
    path('<int:video_id>/stats/', views.video_stats, name='video-stats'),
    
    # User's videos
    path('my-videos/', views.UserVideosView.as_view(), name='user-videos'),
]
