from rest_framework import serializers
from .models import Users

class UserProfileSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    profile_photo = serializers.SerializerMethodField()
    
    class Meta:
        model = Users
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'bio', 'profile_photo', 'password', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_profile_photo(self, obj):
        if obj.profile_photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_photo.url)
            return obj.profile_photo.url
        return None
    
    def update(self, instance, validated_data):
        # Handle profile photo separately since it's a SerializerMethodField
        request = self.context.get('request')
        if request and 'profile_photo' in request.FILES:
            instance.profile_photo = request.FILES['profile_photo']
        elif request and request.data.get('profile_photo') == '':
            # Empty string means remove photo
            instance.profile_photo = None
        
        # Update other fields
        for attr, value in validated_data.items():
            if attr != 'profile_photo':  # Skip profile_photo as we handled it above
                setattr(instance, attr, value)
        
        instance.save()
        return instance