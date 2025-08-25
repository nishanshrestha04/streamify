from django.urls import path
from . import views


urlpatterns = [    
    path('user/', views.UserView.as_view(), name='user-list'),
    path('user/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('login/', views.LoginView.as_view(), name='user-login'),
]
