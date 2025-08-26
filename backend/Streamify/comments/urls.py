from django.urls import path
from . import views

urlpatterns = [
    path('video/<int:video_id>/', views.CommentListView.as_view(), name='comment-list'),
    path('create/', views.CommentCreateView.as_view(), name='comment-create'),
    path('<int:comment_id>/like/', views.ToggleCommentLikeView.as_view(), name='comment-like'),
    path('<int:comment_id>/replies/', views.CommentRepliesView.as_view(), name='comment-replies'),
]