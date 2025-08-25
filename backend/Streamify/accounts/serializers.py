from rest_framework import serializers
from .models import Users

class UserProfileSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = Users
        fields = ['id', 'username', 'email', 'first_name', 'last_name','password' , 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']