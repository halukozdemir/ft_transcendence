from django.urls import path
from django.http import JsonResponse


def health(request):
    return JsonResponse({"status": "ok", "service": "chat"})


urlpatterns = [
    path('health/', health, name='health'),
]
