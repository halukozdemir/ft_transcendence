from django.urls import path
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.utils import extend_schema
from .views import(
    RegisterView,
    LoginView,
    LogoutView,
    ProfileView,
    AvatarUploadView,
    BannerUploadView,
    UserDetailView,
    AllUsersView,
    UserStatsView,
    UserMatchHistoryView,
    UserAchievementsView,
    LeaderboardView,
    PasswordChangeView,
    AddFriendView,
    RemoveFriendView,
    FriendListView,
    PresenceView,
    OAuth42RedirectView,
    OAuth42CallbackView,
    MatchResultView,
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
    path('profile/banner/', BannerUploadView.as_view(), name='banner-upload'),
    path('token/refresh/', extend_schema(tags=['Auth'], summary='Refresh access token', description='Takes a refresh JWT and returns a new access token. The old refresh token is rotated and blacklisted.')(TokenRefreshView).as_view(), name='token-refresh'),
    path('users/', AllUsersView.as_view(), name='all-users'),
    path('users/<int:user_id>/', UserDetailView.as_view(), name="user-detail"),
    path('users/<int:user_id>/stats/', UserStatsView.as_view(), name="user-stats"),
    path('users/<int:user_id>/matches/', UserMatchHistoryView.as_view(), name="user-matches"),
    path('users/<int:user_id>/achievements/', UserAchievementsView.as_view(), name="user-achievements"),
    path('password/change/', PasswordChangeView.as_view(), name='password-change'),
    path('friends/', FriendListView.as_view(), name='friend-list'),
    path('friends/add/', AddFriendView.as_view(), name='add-friend'),
    path('friends/<int:user_id>/', RemoveFriendView.as_view(), name='remove-friend'),
    path('presence/', PresenceView.as_view(), name='presence'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('oauth/42/', OAuth42RedirectView.as_view(), name='oauth-42'),
    path('oauth/callback/', OAuth42CallbackView.as_view(), name='oauth-callback'),
    path('match-result/', MatchResultView.as_view(), name='match-results'),
]
