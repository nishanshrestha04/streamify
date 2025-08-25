from django.db import IntegrityError
from rest_framework import generics, status
from rest_framework.response import Response
from accounts.serializers import UserProfileSerializer
from accounts.models import Users
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken

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
    lookup_field = 'pk'


class LoginView(generics.GenericAPIView):
    serializer_class = UserProfileSerializer

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")
        try:
            user = Users.objects.get(username=username)
            if user.password == password:
                serializer = self.get_serializer(user)
                refresh = RefreshToken.for_user(user)
                return Response(
                    {
                        "message": "Login successful!",
                        "user": serializer.data,
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
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