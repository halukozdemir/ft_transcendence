from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


def _safe_media_url(file_field):
    if not file_field:
        return None
    try:
        name = getattr(file_field, 'name', None)
        storage = getattr(file_field, 'storage', None)
        if not name or storage is None:
            return None
        if not storage.exists(name):
            return None
        return file_field.url
    except Exception:
        return None

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Passwords don't match."}
            )
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user
    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

PRESENCE_TIMEOUT = 5  # seconds

class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()
    banner = serializers.SerializerMethodField()
    online_status = serializers.SerializerMethodField()

    def get_avatar(self, obj):
        return _safe_media_url(obj.avatar)

    def get_banner(self, obj):
        return _safe_media_url(obj.banner)

    def get_online_status(self, obj):
        if not obj.last_seen:
            return False
        from django.utils import timezone
        return (timezone.now() - obj.last_seen).total_seconds() < PRESENCE_TIMEOUT

    class Meta:
        model = User
        fields = ['id', 'username', 'avatar', 'banner', 'online_status', 'last_seen', 'date_joined']
        read_only_fields = fields

class ProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()
    banner = serializers.SerializerMethodField()
    online_status = serializers.SerializerMethodField()
    friends = UserSerializer(
        many=True,
        read_only=True
    )

    def get_avatar(self, obj):
        return _safe_media_url(obj.avatar)

    def get_banner(self, obj):
        return _safe_media_url(obj.banner)

    def get_online_status(self, obj):
        if not obj.last_seen:
            return False
        from django.utils import timezone
        return (timezone.now() - obj.last_seen).total_seconds() < PRESENCE_TIMEOUT

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar', 'banner', 'online_status', 'last_seen', 'date_joined', 'friends']
        read_only_fields = ['id', 'email', 'last_seen', 'date_joined']

class FriendRequestSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()

class AvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['avatar']

    def validate_avatar(self, value):
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Avatar must be under 5MB.")
        allowed_types = ['image/jpeg', 'image/png', 'image/webp']
        if value.content_type not in allowed_types:
                raise serializers.ValidationError("Only JPEG, PNG and WEBP allowed.")
        return value

class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['banner']

    def validate_banner(self, value):
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("Banner must be under 10MB.")
        allowed_types = ['image/jpeg', 'image/png', 'image/webp']
        if value.content_type not in allowed_types:
                raise serializers.ValidationError("Only JPEG, PNG and WEBP allowed.")
        return value
    
class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(
        write_only=True,
        min_length=8,
        validators=[validate_password]
    )
    new_password2 = serializers.CharField(
        write_only=True
    )

    def validate_old_password(self, value):
        if not self.context['request'].user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate(self,attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError(
                {"new_password": "New passwords don't match."}
            )
        return attrs


class DeleteAccountSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)

    def validate_password(self, value):
        if not self.context['request'].user.check_password(value):
            raise serializers.ValidationError("Password is incorrect.")
        return value
