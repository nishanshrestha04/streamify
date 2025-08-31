from rest_framework import serializers
from .models import Comment, CommentLike
from accounts.models import Users

class CommentUserSerializer(serializers.ModelSerializer):
    profile_photo = serializers.SerializerMethodField()
    
    class Meta:
        model = Users
        fields = ['id', 'username', 'first_name', 'last_name', 'profile_photo']
    
    def get_profile_photo(self, obj):
        if obj.profile_photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_photo.url)
            return obj.profile_photo.url
        return None

class CommentSerializer(serializers.ModelSerializer):
    user = CommentUserSerializer(read_only=True)
    replies_count = serializers.ReadOnlyField()
    is_reply = serializers.ReadOnlyField()
    user_has_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id', 'content', 'user', 'video', 'parent', 'likes',
            'replies_count', 'is_reply', 'user_has_liked',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'likes', 'created_at', 'updated_at']
    
    def get_user_has_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                # Handle our custom authentication
                if hasattr(request.user, 'users_instance'):
                    user = request.user.users_instance
                else:
                    from accounts.models import Users
                    user = Users.objects.get(username=request.user.username)
                return CommentLike.objects.filter(user=user, comment=obj).exists()
            except:
                pass
        return False

class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['content', 'video', 'parent']
    
    def validate(self, data):
        # If this is a reply, make sure the parent comment exists and belongs to the same video
        if data.get('parent'):
            if data['parent'].video != data['video']:
                raise serializers.ValidationError("Reply must be on the same video as the parent comment.")
        return data
    
    def to_representation(self, instance):
        # Return the comment with full user information after creation
        return CommentSerializer(instance, context=self.context).data

class CommentListSerializer(serializers.ModelSerializer):
    user = CommentUserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    user_has_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id', 'content', 'user', 'likes', 'replies',
            'user_has_liked', 'created_at'
        ]
    
    def get_replies(self, obj):
        if obj.parent is None:  # Only get replies for top-level comments
            replies = obj.replies.all()[:3]  # Limit to 3 replies initially
            return CommentSerializer(replies, many=True, context=self.context).data
        return []
    
    def get_user_has_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                # Handle our custom authentication
                if hasattr(request.user, 'users_instance'):
                    user = request.user.users_instance
                else:
                    from accounts.models import Users
                    user = Users.objects.get(username=request.user.username)
                return CommentLike.objects.filter(user=user, comment=obj).exists()
            except:
                pass
        return False
