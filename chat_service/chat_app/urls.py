from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.http import JsonResponse
from .views import ChatRoomViewSet, ChatMessageViewSet


def health(request):
    return JsonResponse({"status": "ok", "service": "chat"})


# DRF Router for ViewSets
router = DefaultRouter()
router.register(r'rooms', ChatRoomViewSet, basename='room')
router.register(r'messages', ChatMessageViewSet, basename='message')

urlpatterns = [
    path('health/', health, name='health'),
    path('', include(router.urls)),
]
