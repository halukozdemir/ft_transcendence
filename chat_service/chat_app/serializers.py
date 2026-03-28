from rest_framework import serializers
from .models import ChatRoom, ChatMessage, ChatRoomMember


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'sender_id', 'sender_email', 'text', 'message_type',
                  'created_at', 'edited_at', 'is_edited', 'is_moderated']
        read_only_fields = ['created_at', 'edited_at', 'is_edited', 'is_moderated']


class ChatRoomMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoomMember
        fields = ['user_id', 'joined_at', 'is_muted', 'is_admin']
        read_only_fields = ['joined_at']


class ChatRoomListSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'room_type', 'created_at', 'updated_at', 'member_count']
    
    def get_member_count(self, obj):
        return obj.members.count()


class ChatRoomDetailSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)
    members = ChatRoomMemberSerializer(many=True, read_only=True)
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'room_type', 'created_at', 'updated_at', 
                  'member_count', 'messages', 'members']
    
    def get_member_count(self, obj):
        return obj.members.count()
