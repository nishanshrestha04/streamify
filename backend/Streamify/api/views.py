from django.db import IntegrityError
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from accounts.serializers import UserProfileSerializer
from accounts.models import Users
from accounts.authentication import CustomJWTToken
from rest_framework.exceptions import ValidationError
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password, make_password

class UserView(generics.ListCreateAPIView):
    queryset = Users.objects.all()
    serializer_class = UserProfileSerializer

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except ValidationError as e:
            return Response(
                {"success": False, "error": e.detail},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except IntegrityError as e:
            error_msg = "Integrity error."
            error_str = str(e.args[0]) if e.args else str(e)
            if "username" in error_str.lower():
                error_msg = "Username already taken."
            elif "email" in error_str.lower():
                error_msg = "Email already registered."
            print(error_msg)
            return Response(
                {"success": False, "error": error_msg},
                status=status.HTTP_400_BAD_REQUEST,
            )

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Users.objects.all()
    serializer_class = UserProfileSerializer
    lookup_field = 'username'


class LoginView(generics.GenericAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")
        
        if not username or not password:
            return Response(
                {"error": "Username and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        try:
            user = Users.objects.get(username=username)
            
            if user.password == password:
                serializer = self.get_serializer(user)
            
                refresh = CustomJWTToken.for_user(user)
                access_token = str(refresh.access_token)
                refresh_token = str(refresh)
                
                return Response(
                    {
                        "message": "Login successful!",
                        "user": serializer.data,
                        "access": access_token,
                        "refresh": refresh_token,
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"error": "Invalid username or password"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
        except Users.DoesNotExist:
            return Response(
                {"error": "Invalid username or password"},
                status=status.HTTP_401_UNAUTHORIZED,
            )


class CurrentUserView(generics.GenericAPIView):
    """Get and update current authenticated user"""
    serializer_class = UserProfileSerializer
    
    def get(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"error": "Not authenticated"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        
        # Get the actual Users instance
        if hasattr(request.user, 'users_instance'):
            user = request.user.users_instance
        else:
            try:
                user = Users.objects.get(username=request.user.username)
            except Users.DoesNotExist:
                return Response(
                    {"error": "User profile not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        
        serializer = self.get_serializer(user)
        return Response(serializer.data)
    
    def put(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"error": "Not authenticated"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        
        # Get the actual Users instance
        if hasattr(request.user, 'users_instance'):
            user = request.user.users_instance
        else:
            try:
                user = Users.objects.get(username=request.user.username)
            except Users.DoesNotExist:
                return Response(
                    {"error": "User profile not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        
        # Handle password change if provided
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if new_password and current_password:
            # Verify current password
            if not check_password(current_password, user.password):
                return Response(
                    {"current_password": ["Current password is incorrect"]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            # Update password with proper hashing
            user.password = make_password(new_password)
            user.save()
            
            # Remove password fields from data before serializer update
            data = request.data.copy()
            data.pop('current_password', None)
            data.pop('new_password', None)
        else:
            data = request.data
        
        serializer = self.get_serializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)