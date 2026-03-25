from django.db import models
from django.conf import settings

class ChatRoom(models.Model):
    """Chat room for group conversations or 1-on-1 DM"""
    name = models.CharField(max_length=255, unique=True)
    room_type = models.CharField(
        max_length=20,
        choices=[
            ('dm', 'Direct Message'),
            ('channel', 'Group Channel'),
            ('tournament', 'Tournament Chat'),
        ],
        default='channel'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.name} ({self.room_type})"


class ChatMessage(models.Model):
    """Individual chat message"""
    room = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender_id = models.IntegerField()  # Foreign key to auth_service User
    sender_email = models.EmailField(blank=True)  # Cache sender email
    text = models.TextField()
    message_type = models.CharField(
        max_length=20,
        choices=[
            ('message', 'Regular Message'),
            ('system', 'System Message'),
            ('notification', 'Notification'),
        ],
        default='message'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)
    is_edited = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['room', '-created_at']),
            models.Index(fields=['sender_id']),
        ]
    
    def __str__(self):
        return f"{self.sender_email}: {self.text[:50]}"


class ChatRoomMember(models.Model):
    """Track room membership and mute status"""
    room = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE,
        related_name='members'
    )
    user_id = models.IntegerField()  # Foreign key to auth_service User
    joined_at = models.DateTimeField(auto_now_add=True)
    is_muted = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['room', 'user_id']
        ordering = ['joined_at']
    
    def __str__(self):
        return f"{self.room.name} - User {self.user_id}"
