from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import UntypedToken
from django.contrib.auth.models import AnonymousUser
from .models import Users
import jwt
from django.conf import settings


class CustomUser:
    """Wrapper to make Users model compatible with Django's User interface"""
    def __init__(self, users_instance):
        self.users_instance = users_instance
        self.id = users_instance.id
        self.username = users_instance.username
        self.first_name = users_instance.first_name
        self.last_name = users_instance.last_name
        self.email = users_instance.email
        self.is_authenticated = True
        self.is_active = True
        self.is_anonymous = False
        self.is_staff = False
        self.is_superuser = False
    
    def __str__(self):
        return self.username


class CustomJWTAuthentication(JWTAuthentication):
    """Custom JWT authentication for Users model"""
    
    def get_user(self, validated_token):
        """
        Attempts to find and return a user using the given validated token.
        """
        try:
            user_id = validated_token.get('user_id')
            if user_id is None:
                # If no user_id in token, try to get it from 'sub' claim
                user_id = validated_token.get('sub')
                
            if user_id is None:
                return None
                
            users_instance = Users.objects.get(id=user_id)
            return CustomUser(users_instance)
            
        except Users.DoesNotExist:
            return None
        except (KeyError, TypeError):
            return None


class CustomJWTToken:
    """Custom JWT token that works with Users model"""
    
    @classmethod
    def for_user(cls, users_instance):
        """Create tokens for Users model instance"""
        from rest_framework_simplejwt.tokens import RefreshToken
        
        # Create a temporary Django user-like object
        class TempUser:
            def __init__(self, users_instance):
                self.id = users_instance.id
                self.username = users_instance.username
                self.is_active = True
        
        temp_user = TempUser(users_instance)
        refresh = RefreshToken.for_user(temp_user)
        
        # Add custom claims
        refresh['user_id'] = users_instance.id
        refresh['username'] = users_instance.username
        
        return refresh
