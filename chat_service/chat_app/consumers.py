import json
import jwt
from datetime import datetime
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.conf import settings
from django.utils import timezone

# JWT validation helper
def decode_token(token: str):
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    except:
        return None

class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer untuk Chat dengan JWT authentication.
    Supports: 1-on-1 DM, group channels, message history.
    """
    
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        self.user = None
        self.user_id = None
        
        # Extract & validate JWT token
        query_string = self.scope.get('query_string', b'').decode()
        token = None
        
        if 'token=' in query_string:
            token = query_string.split('token=')[1].split('&')[0]
        
        if not token:
            await self.close(code=4001, reason="Missing authentication token")
            return
        
        decoded = decode_token(token)
        if not decoded:
            await self.close(code=4001, reason="Invalid token")
            return
        
        self.user_id = decoded.get('sub') or decoded.get('user_id')
        if not self.user_id:
            await self.close(code=4001, reason="No user ID in token")
            return
        
        # Add to room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Notify other users
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_joined',
                'user_id': self.user_id,
                'timestamp': timezone.now().isoformat(),
            }
        )

    async def disconnect(self, close_code):
        # Notify other users
        if self.user_id:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_left',
                    'user_id': self.user_id,
                    'timestamp': timezone.now().isoformat(),
                }
            )
        
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            await self.send_error("Invalid JSON")
            return
        
        message = data.get('message', '').strip()
        message_type = data.get('type', 'message')
        
        if not message:
            await self.send_error("Empty message")
            return
        
        # Save message to DB
        await self.save_message(message, message_type)
        
        # Broadcast to group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender_id': self.user_id,
                'message_type': message_type,
                'timestamp': timezone.now().isoformat(),
            }
        )

    async def chat_message(self, event):
        """Receive message from group"""
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message'],
            'sender_id': event['sender_id'],
            'message_type': event.get('message_type', 'message'),
            'timestamp': event['timestamp'],
        }))

    async def user_joined(self, event):
        """User joined notification"""
        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'user_id': event['user_id'],
            'timestamp': event['timestamp'],
        }))

    async def user_left(self, event):
        """User left notification"""
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'user_id': event['user_id'],
            'timestamp': event['timestamp'],
        }))

    async def send_error(self, error_message: str):
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': error_message,
        }))

    @database_sync_to_async
    def save_message(self, message: str, message_type: str = 'message'):
        """Save message to database (if model exists)"""
        # TODO: Implement once ChatMessage model is created
        # from .models import ChatMessage
        # ChatMessage.objects.create(
        #     room_name=self.room_name,
        #     sender_id=self.user_id,
        #     text=message,
        #     message_type=message_type,
        # )
        pass

