from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import ChatRoom, ChatMessage, ChatRoomMember
from .serializers import (
    ChatRoomListSerializer,
    ChatRoomDetailSerializer,
    ChatMessageSerializer,
)


class IsAuthenticated(permissions.BasePermission):
    """Simple permission check - in production use DRF TokenAuthentication"""
    def has_permission(self, request, view):
        return bool(request.META.get('HTTP_AUTHORIZATION'))


class ChatRoomViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]  # TODO: Add proper auth
    parser_classes = [JSONParser]
    
    def get_queryset(self):
        return ChatRoom.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ChatRoomDetailSerializer
        return ChatRoomListSerializer
    
    @action(detail=False, methods=['GET'])
    def my_rooms(self, request):
        """Get rooms for authenticated user"""
        # TODO: Implement with proper user auth
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {'error': 'user_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rooms = ChatRoom.objects.filter(members__user_id=user_id).distinct()
        serializer = ChatRoomListSerializer(rooms, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['POST'])
    def send_message(self, request, pk=None):
        """Send a message to a room"""
        room = self.get_object()
        text = request.data.get('text', '').strip()
        sender_id = request.data.get('sender_id')
        message_type = request.data.get('type', 'message')
        
        if not text:
            return Response(
                {'error': 'Message text required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not sender_id:
            return Response(
                {'error': 'sender_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create message
        message = ChatMessage.objects.create(
            room=room,
            sender_id=sender_id,
            text=text,
            message_type=message_type,
        )
        
        serializer = ChatMessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['GET'])
    def messages(self, request, pk=None):
        """Get messages for a room (with pagination)"""
        room = self.get_object()
        limit = int(request.query_params.get('limit', 50))
        offset = int(request.query_params.get('offset', 0))
        
        messages = room.messages.all()[offset:offset + limit]
        serializer = ChatMessageSerializer(messages, many=True)
        
        return Response({
            'count': room.messages.count(),
            'messages': serializer.data,
        })
    
    @action(detail=True, methods=['POST'])
    def join(self, request, pk=None):
        """Join a room"""
        room = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'user_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        member, created = ChatRoomMember.objects.get_or_create(
            room=room,
            user_id=user_id,
        )
        
        return Response({
            'joined': created,
            'room_id': room.id,
            'user_id': user_id,
        })
    
    @action(detail=True, methods=['POST'])
    def leave(self, request, pk=None):
        """Leave a room"""
        room = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'user_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ChatRoomMember.objects.filter(room=room, user_id=user_id).delete()
        
        return Response({'left': True})


class ChatMessageViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only messages endpoint"""
    permission_classes = [permissions.AllowAny]
    serializer_class = ChatMessageSerializer
    
    def get_queryset(self):
        room_id = self.request.query_params.get('room_id')
        if room_id:
            return ChatMessage.objects.filter(room_id=room_id).order_by('-created_at')
        return ChatMessage.objects.all().order_by('-created_at')
