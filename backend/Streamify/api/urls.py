from django.urls import path
from . import views


urlpatterns = [    
    path('user/', views.UserView.as_view(), name='user-list'),
    path('user/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('user/<str:username>/', views.UserDetailView.as_view(), name='user-detail-by-username'),
    path('login/', views.LoginView.as_view(), name='user-login'),
    path('auth/user/', views.CurrentUserView.as_view(), name='current-user'),
]
