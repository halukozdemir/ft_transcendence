from django.urls import path
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenRefreshView
from .views import(
    RegisterView,
    LoginView,
    LogoutView,
    ProfileView,
    AvatarUploadView,
    UserDetailView,
    PasswordChangeView,
    AddFriendView,
    RemoveFriendView,
    FriendListView
)

def health(request):
    return JsonResponse({"status": "ok", "service": "auth"})

urlpatterns = [
    path('health/', health, name='health'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/avatar/', AvatarUploadView.as_view(), name='avatar-upload'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('users/<int:id>/', UserDetailView.as_view(), name="user-detail"),
    path('password/change/', PasswordChangeView.as_view(), name='password-change'),
    path('friends/', FriendListView.as_view(), name='friend-list'),
    path('friends/add/', AddFriendView.as_view(), name='add-friend'),
    path('friends/remove/', RemoveFriendView.as_view(), name='remove-friend'),
    
]
