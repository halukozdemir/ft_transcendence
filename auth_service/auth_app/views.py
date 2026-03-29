from rest_framework import status, generics, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q, Count, F, Case, When, IntegerField
import requests
from django.conf import settings
from django.shortcuts import redirect
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiResponse, inline_serializer
from rest_framework import serializers as s

from .serializers import(
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    ProfileSerializer,
    AvatarSerializer,
    BannerSerializer,
    FriendRequestSerializer,
    PasswordChangeSerializer,
)
from .models import PlayerStats, MatchRecord, MatchPlayer, Achievement, UserAchievement

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

# ──────────────── Register ────────────────
@extend_schema_view(
    create=extend_schema(
        tags=['Auth'],
        summary='Register a new user',
        description='Creates a new user account with email, username and password. Returns user info and JWT token pair.',
        responses={201: inline_serializer('RegisterResponse', fields={
            'user': inline_serializer('RegisterUser', fields={
                'id': s.IntegerField(),
                'email': s.EmailField(),
                'username': s.CharField(),
            }),
            'tokens': inline_serializer('RegisterTokens', fields={
                'access': s.CharField(),
                'refresh': s.CharField(),
            }),
        })},
    ),
)
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Create PlayerStats for new user
        PlayerStats.objects.get_or_create(user=user)
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
            },
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_201_CREATED)
    

# ──────────────── Login ────────────────
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['Auth'],
        summary='Authenticate user',
        description='Validates email and password credentials. Returns user info and JWT token pair on success.',
        request=LoginSerializer,
        responses={200: inline_serializer('LoginResponse', fields={
            'user': inline_serializer('LoginUser', fields={
                'id': s.IntegerField(),
                'email': s.EmailField(),
                'username': s.CharField(),
            }),
            'tokens': inline_serializer('LoginTokens', fields={
                'access': s.CharField(),
                'refresh': s.CharField(),
            }),
        })},
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )

        if user is None:
            return Response(
                {'detail': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        user.online_status=True
        user.save(update_fields=['online_status'])

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
            },
            'tokens':{
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        })
    
# ──────────────── Logout ────────────────
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Auth'],
        summary='Logout user',
        description='Blacklists the provided refresh token and sets user status to offline.',
        request=inline_serializer('LogoutRequest', fields={
            'refresh': s.CharField(help_text='Refresh token to blacklist'),
        }),
        responses={205: None},
    )
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass

        request.user.online_status = False
        request.user.save(update_fields=['online_status'])
        return Response(status=status.HTTP_205_RESET_CONTENT)

# ──────────────── Profile ────────────────
@extend_schema_view(
    retrieve=extend_schema(tags=['Profile'], summary='Get own profile', description='Returns the authenticated user\'s full profile including friends list.'),
    update=extend_schema(tags=['Profile'], summary='Update profile', description='Updates the authenticated user\'s profile fields (e.g. username).'),
    partial_update=extend_schema(tags=['Profile'], summary='Partially update profile', description='Partially updates the authenticated user\'s profile.'),
)
class ProfileView(generics.RetrieveUpdateAPIView):
    """Authenticated user's own profile."""
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
    
# ──────────────── Avatar Upload ────────────────
class AvatarUploadView(APIView):
    """Upload or update user avatar image. Images are checked for NSFW content."""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser]

    @extend_schema(
        tags=['Profile'],
        summary='Upload avatar',
        description='Upload a new avatar image (JPEG, PNG, WEBP, max 5MB). The image is scanned for NSFW content and rejected if inappropriate.',
        request=AvatarSerializer,
        responses={200: AvatarSerializer},
    )
    def put(self, request):
        serializer = AvatarSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)

        avatar_file = request.FILES.get('avatar')
        if avatar_file:
            from .moderation import check_avatar_safety
            result = check_avatar_safety(avatar_file)
            if not result['safe']:
                return Response(
                    {'detail': 'Image rejected: inappropriate content detected.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            avatar_file.seek(0)

        serializer.save()
        return Response(serializer.data)

    @extend_schema(tags=['Profile'], summary='Upload avatar (POST)', description='Same as PUT. Alias for avatar upload.')
    def post(self, request):
        return self.put(request)

# ──────────────── Banner Upload ────────────────
class BannerUploadView(APIView):
    """Upload or update user banner image."""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser]

    @extend_schema(
        tags=['Profile'],
        summary='Upload banner',
        description='Upload a new banner image (JPEG, PNG, WEBP, max 10MB).',
        request=BannerSerializer,
        responses={200: BannerSerializer},
    )
    def put(self, request):
        serializer = BannerSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @extend_schema(tags=['Profile'], summary='Upload banner (POST)', description='Same as PUT. Alias for banner upload.')
    def post(self, request):
        return self.put(request)

# ──────────────── User Detail (public) ────────────────
@extend_schema(tags=['Users'], summary='Get user by ID', description='Returns public profile of a user by their ID. No authentication required.')
class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'
    lookup_url_kwarg = 'user_id'

# ──────────────── User Stats ────────────────
class UserStatsView(APIView):
    """Get player statistics"""
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['Stats'],
        summary='Get player statistics',
        description='Returns win/loss record, XP, level, and global ranking for a user.',
        responses={200: inline_serializer('UserStatsResponse', fields={
            'user_id': s.IntegerField(),
            'username': s.CharField(),
            'total_matches': s.IntegerField(),
            'wins': s.IntegerField(),
            'losses': s.IntegerField(),
            'win_rate': s.FloatField(),
            'xp': s.IntegerField(),
            'level': s.IntegerField(),
            'ranking': s.IntegerField(),
        })},
    )
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        stats = PlayerStats.objects.get_or_create(user=user)[0]

        higher_xp = PlayerStats.objects.filter(xp__gt=stats.xp).count()
        ranking = higher_xp + 1

        return Response({
            'user_id': user.id,
            'username': user.username,
            'total_matches': stats.total_matches,
            'wins': stats.wins,
            'losses': stats.losses,
            'win_rate': stats.win_rate,
            'xp': stats.xp,
            'level': stats.level,
            'ranking': ranking,
        })

# ──────────────── User Match History ────────────────
class UserMatchHistoryView(APIView):
    """Get user's match history"""
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['Stats'],
        summary='Get match history',
        description='Returns paginated list of matches played by the user, including scores, opponents, and results.',
        parameters=[
            OpenApiParameter('limit', int, description='Number of results (default 10)', required=False),
            OpenApiParameter('offset', int, description='Offset for pagination (default 0)', required=False),
        ],
        responses={200: inline_serializer('MatchHistoryResponse', fields={
            'results': s.ListField(child=s.DictField()),
            'total': s.IntegerField(),
        })},
    )
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        limit = int(request.query_params.get('limit', 10))
        offset = int(request.query_params.get('offset', 0))

        participations = MatchPlayer.objects.filter(
            user=user
        ).select_related('match').order_by('-match__played_at')[offset:offset + limit]

        result = []
        for mp in participations:
            match = mp.match
            my_team = mp.team
            opponent_team = 'blue' if my_team == 'red' else 'red'
            my_score = match.score_red if my_team == 'red' else match.score_blue
            opponent_score = match.score_blue if my_team == 'red' else match.score_red

            opponents = MatchPlayer.objects.filter(
                match=match, team=opponent_team
            ).select_related('user')

            if match.winner_team == my_team:
                match_result = 'win'
            elif match.winner_team is None:
                match_result = 'draw'
            else:
                match_result = 'loss'
            
            result.append({
                'id': match.id,
                'result': match_result,
                'my_team': my_team,
                'my_score': my_score,
                'opponent_score': opponent_score,
                'opponents': [
                    {
                        'id': op.user.id,
                        'username': op.user.username,
                        'avatar': _safe_media_url(op.user.avatar),
                    }
                    for op in opponents
                ],
                'played_at': match.played_at.isoformat(),
                'duration_seconds': match.duration_seconds,
                'end_reason': match.end_reason
            })

        total = MatchPlayer.objects.filter(user=user).count()
        return Response({'results': result, 'total': total})

# ──────────────── User Achievements ────────────────
class UserAchievementsView(APIView):
    """Get user's achievements"""
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['Stats'],
        summary='Get user achievements',
        description='Returns list of unlocked achievements/badges for the user.',
        responses={200: inline_serializer('AchievementResponse', fields={
            'id': s.IntegerField(),
            'name': s.CharField(),
            'description': s.CharField(),
            'icon_url': s.CharField(),
            'badge_type': s.CharField(),
            'unlocked_at': s.DateTimeField(),
        }, many=True)},
    )
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        achievements = UserAchievement.objects.filter(user=user).select_related('achievement')
        
        result = []
        for ua in achievements:
            result.append({
                'id': ua.achievement.id,
                'name': ua.achievement.name,
                'description': ua.achievement.description,
                'icon_url': ua.achievement.icon_url,
                'badge_type': ua.achievement.badge_type,
                'unlocked_at': ua.unlocked_at.isoformat(),
            })
        
        return Response(result)

# ──────────────── Leaderboard ────────────────
class LeaderboardView(APIView):
    """Get global leaderboard"""
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['Leaderboard'],
        summary='Get global leaderboard',
        description='Returns players ranked by XP. Only users with at least one match are included.',
        parameters=[
            OpenApiParameter('limit', int, description='Max results (default 50)', required=False),
        ],
        responses={200: inline_serializer('LeaderboardEntry', fields={
            'rank': s.IntegerField(),
            'user_id': s.IntegerField(),
            'username': s.CharField(),
            'avatar': s.CharField(allow_null=True),
            'xp': s.IntegerField(),
            'level': s.IntegerField(),
            'total_matches': s.IntegerField(),
            'wins': s.IntegerField(),
            'win_rate': s.FloatField(),
        }, many=True)},
    )
    def get(self, request):
        limit = int(request.query_params.get('limit', 50))

        users = User.objects.filter(
            stats__total_matches__gt=0
        ).select_related('stats').order_by('-stats__xp')[:limit]

        result = []
        for rank, user in enumerate(users, 1):
            result.append({
                'rank': rank,
                'user_id': user.id,
                'username': user.username,
                'avatar': _safe_media_url(user.avatar),
                'xp': user.stats.xp,
                'level': user.stats.level,
                'total_matches': user.stats.total_matches,
                'wins': user.stats.wins,
                'win_rate': user.stats.win_rate,
            })
        
        return Response(result)

# ──────────────── All Users (for friends search) ────────────────
class AllUsersView(APIView):
    """Get all users for friends search/discovery"""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Users'],
        summary='List all users',
        description='Returns all users except the authenticated user. Supports search by username. Shows online status and friendship state.',
        parameters=[
            OpenApiParameter('search', str, description='Filter by username', required=False),
            OpenApiParameter('limit', int, description='Max results (default 50)', required=False),
        ],
        responses={200: inline_serializer('UserListEntry', fields={
            'id': s.IntegerField(),
            'username': s.CharField(),
            'avatar': s.CharField(allow_null=True),
            'online_status': s.BooleanField(),
            'is_friend': s.BooleanField(),
        }, many=True)},
    )
    def get(self, request):
        search = request.query_params.get('search', '').strip()
        limit = int(request.query_params.get('limit', 50))
        
        # Exclude current user
        users = User.objects.exclude(id=request.user.id)
        
        if search:
            users = users.filter(username__icontains=search)
        
        users = users[:limit]
        
        from django.utils import timezone
        from datetime import timedelta
        now = timezone.now()
        threshold = timedelta(seconds=5)

        result = []
        for user in users:
            is_online = user.last_seen and (now - user.last_seen) < threshold
            result.append({
                'id': user.id,
                'username': user.username,
                'avatar': _safe_media_url(user.avatar),
                'online_status': bool(is_online),
                'is_friend': request.user.friends.filter(id=user.id).exists(),
            })
        
        return Response(result)

# ──────────────── Password Change ────────────────
class PasswordChangeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Auth'],
        summary='Change password',
        description='Changes the authenticated user\'s password. Requires current password for verification.',
        request=PasswordChangeSerializer,
        responses={200: inline_serializer('PasswordChangeResponse', fields={
            'detail': s.CharField(),
        })},
    )
    def put(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(
            serializer.validated_data['new_password']
        )
        request.user.save()
        return Response({'detail': 'Password updated.'})
    
# ──────────────── Add/Remove Friend ────────────────
class AddFriendView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Friends'],
        summary='Add friend',
        description='Sends a friend request to the specified user. Both users become friends immediately (mutual).',
        request=FriendRequestSerializer,
        responses={200: inline_serializer('AddFriendResponse', fields={
            'detail': s.CharField(),
        })},
    )
    def post(self, request):
        serializer = FriendRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            friend = User.objects.get(
                id=serializer.validated_data['user_id']
            )
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if friend == request.user:
            return Response(
                {'detail': 'Cannot add yourself.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if request.user.friends.filter(id=friend.id).exists():
            return Response(
                {'detail': 'Already friends.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        request.user.friends.add(friend)
        friend.friends.add(request.user)
        return Response(
            {'detail': f'Added {friend.username}.'}
        )

class RemoveFriendView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Friends'],
        summary='Remove friend',
        description='Removes a friend by user ID. The friendship is removed from both sides.',
        responses={204: None},
    )
    def delete(self, request, user_id):
        try:
            friend = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        request.user.friends.remove(friend)
        friend.friends.remove(request.user)
        return Response(
            {'detail': f'Removed {friend.username}.'},
            status=status.HTTP_204_NO_CONTENT
        )
    
# ──────────────── Presence ────────────────
class PresenceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Presence'],
        summary='Send heartbeat',
        description='Updates the user\'s last_seen timestamp and sets online status. Frontend should call this every 3 seconds. Users are considered offline after 5 seconds of inactivity.',
        request=inline_serializer('PresenceRequest', fields={
            'status': s.CharField(help_text='"online" or "offline"'),
        }),
        responses={200: inline_serializer('PresenceResponse', fields={
            'online_status': s.BooleanField(),
        })},
    )
    def post(self, request):
        from django.utils import timezone
        request.user.online_status = True
        request.user.last_seen = timezone.now()
        request.user.save(update_fields=['online_status', 'last_seen'])
        return Response({'online_status': True})


@extend_schema(tags=['Friends'], summary='List friends', description='Returns the authenticated user\'s friend list with online status and profile info.')
class FriendListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        return self.request.user.friends.all()

# ──────────────── OAuth 42: Redirect ────────────────
class OAuth42RedirectView(APIView):
    """Redirects the user to 42 intra OAuth authorization page."""
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['OAuth'],
        summary='Start 42 OAuth flow',
        description='Redirects to 42 intra authorization page. After user approves, 42 redirects back to the callback URL.',
        responses={302: None},
    )
    def get(self, request):
        authorize_url = (
            "https://api.intra.42.fr/oauth/authorize"
            f"?client_id={settings.OAUTH_42_CLIENT_ID}"
            f"&redirect_uri={settings.OAUTH_42_REDIRECT_URI}"
            "&response_type=code"
            "&scope=public"
        )
        return redirect(authorize_url)

# ──────────────── OAuth 42: Callback ────────────────
class OAuth42CallbackView(APIView):
    """Handles the OAuth callback from 42 intra."""
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['OAuth'],
        summary='42 OAuth callback',
        description='Receives the authorization code from 42 intra, exchanges it for tokens, creates or links user account, and redirects to frontend with JWT tokens.',
        parameters=[
            OpenApiParameter('code', str, description='Authorization code from 42 intra', required=True),
        ],
        responses={302: None},
    )
    def get(self, request):
        code = request.query_params.get('code')
        if not code:
            return Response(
                {'detail': 'Code parameter missing.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        token_response = requests.post(
            "https://api.intra.42.fr/oauth/token",
            data={
                'grant_type': 'authorization_code',
                'client_id': settings.OAUTH_42_CLIENT_ID,
                'client_secret': settings.OAUTH_42_CLIENT_SECRET,
                'code': code,
                'redirect_uri': settings.OAUTH_42_REDIRECT_URI,
            }
        )

        if token_response.status_code != 200:
            return Response(
                {'detail': '42 token exchange failed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        access_token = token_response.json().get('access_token')

        user_response = requests.get(
            "https://api.intra.42.fr/v2/me",
            headers={'Authorization': f'Bearer {access_token}'}
        )

        if user_response.status_code != 200:
            return Response(
                {'detail': '42 user info fetch failed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data=user_response.json()
        intra_id = data['id']
        email = data['email']
        username = data['login']

        user = User.objects.filter(intra_id=intra_id).first()

        if not user:
            user = User.objects.filter(username=username).first()

            if user:
                user.intra_id = intra_id
                user.save(update_fields=['intra_id'])
            else:
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    intra_id=intra_id,
                    password=None,
                )
                PlayerStats.objects.get_or_create(user=user)

        user.online_status = True
        user.save(update_fields=['online_status'])

        refresh = RefreshToken.for_user(user)
        frontend_url = (
            f"https://{settings.DOMAIN}/oauth/callback"
            f"?access={str(refresh.access_token)}"
            f"&refresh={str(refresh)}"
        )
        return redirect(frontend_url)
    
# ──────────────── Match Result (internal) ────────────────
class MatchResultView(APIView):
    """Internal endpoint called by game_service to record match results."""
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['Match'],
        summary='Record match result (internal)',
        description='Called by game_service after a match ends. Requires X-Service-Secret header. Updates player stats, XP, and grants achievements.',
        request=inline_serializer('MatchResultRequest', fields={
            'winner_team': s.CharField(help_text='"red", "blue", or null for draw'),
            'score_red': s.IntegerField(),
            'score_blue': s.IntegerField(),
            'duration_seconds': s.IntegerField(),
            'red_player_ids': s.ListField(child=s.IntegerField(), help_text='List of user IDs on red team'),
            'blue_player_ids': s.ListField(child=s.IntegerField(), help_text='List of user IDs on blue team'),
            'end_reason': s.CharField(help_text='score_limit, time_up, forfeit, disconnect', required=False),
        }),
        responses={201: inline_serializer('MatchResultResponse', fields={
            'detail': s.CharField(),
            'match_id': s.IntegerField(),
        })},
    )
    def post(self, request):
        secret = request.headers.get('X-Service-Secret', '')
        expected = getattr(settings, 'SERVICE_SECRET', '')
        if not expected or secret != expected:
            return Response(
                {'detail': 'Unauthorized service call.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        data = request.data
        winner_team = data.get('winner_team')
        score_red = int(data.get('score_red', 0))
        score_blue = int(data.get('score_blue', 0))
        duration_seconds = int(data.get('duration_seconds', 0))
        red_player_ids_raw = data.get('red_player_ids', [])
        blue_player_ids_raw = data.get('blue_player_ids', [])
        end_reason = data.get('end_reason', 'score_limit')

        def _normalize_ids(raw_ids):
            normalized = []
            for value in raw_ids or []:
                try:
                    normalized.append(int(value))
                except (TypeError, ValueError):
                    continue
            return normalized

        red_player_ids = _normalize_ids(red_player_ids_raw)
        blue_player_ids = _normalize_ids(blue_player_ids_raw)

        all_ids = red_player_ids + blue_player_ids
        users = {u.id: u for u in User.objects.filter(id__in=all_ids)}

        if len(users) < 2:
            return Response(
                {'detail': 'Not enough valid users.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        match = MatchRecord.objects.create(
            winner_team=winner_team,
            score_red=score_red,
            score_blue=score_blue,
            duration_seconds=duration_seconds,
            end_reason=end_reason
        )

        for uid in red_player_ids:
            if uid in users:
                MatchPlayer.objects.create(match=match, user=users[uid], team='red')
        for uid in blue_player_ids:
            if uid in users:
                MatchPlayer.objects.create(match=match, user=users[uid], team='blue')

        winner_ids = red_player_ids if winner_team == 'red' else blue_player_ids if winner_team == 'blue' else []
        loser_ids = blue_player_ids if winner_team == 'red' else red_player_ids if winner_team == 'blue' else []

        XP_PER_GOAL = 10
        XP_WIN_BONUS = 30
        XP_DRAW_BONUS = 10

        from django.utils import timezone

        for uid in all_ids:
            if uid not in users:
                continue
            user = users[uid]
            stats, _ = PlayerStats.objects.get_or_create(user=user)
            stats.total_matches += 1

            is_red = uid in red_player_ids
            team_score = score_red if is_red else score_blue
            opponent_score = score_blue if is_red else score_red
            is_winner = uid in winner_ids

            if is_winner:
                stats.wins += 1
                stats.xp += team_score * XP_PER_GOAL + XP_WIN_BONUS
            elif uid in loser_ids:
                stats.losses += 1
                stats.xp += team_score * XP_PER_GOAL
            else:
                stats.draws += 1
                stats.xp += team_score * XP_PER_GOAL + XP_DRAW_BONUS

            if stats.total_matches > 0:
                stats.win_rate = round(stats.wins / stats.total_matches * 100, 1)

            stats.last_match_date = timezone.now()
            stats.save()

            self._grant_achievements(user, stats, is_winner, opponent_score)

        return Response(
            {'detail': 'Match recorded.', 'match_id': match.id},
            status=status.HTTP_201_CREATED
        )

    def _grant_achievements(self, user, stats, is_winner, opponent_score):
        ACHIEVEMENTS = [
            {
                'badge_type': 'first_win',
                'name': 'İlk Galibiyet',
                'description': 'İlk maçını kazan.',
                'icon_url': 'verified',
                'condition': lambda: is_winner and stats.wins == 1,
            },
            {
                'badge_type': 'perfect_win',
                'name': 'Kusursuz Galibiyet',
                'description': 'Rakibe gol attırmadan kazan.',
                'icon_url': 'emoji_events',
                'condition': lambda: is_winner and opponent_score == 0,
            },
            {
                'badge_type': 'streak_5',
                'name': '5 Galibiyet Serisi',
                'description': 'Üst üste 5 maç kazan.',
                'icon_url': 'local_fire_department',
                'condition': lambda: stats.wins >= 5 and stats.wins % 5 == 0,
            },
            {
                'badge_type': 'unstoppable',
                'name': 'Durdurulamaz',
                'description': '20 galibiyet serisine ulaş.',
                'icon_url': 'local_fire_department',
                'condition': lambda: stats.wins >= 20 and stats.wins % 20 == 0,
            },
        ]

        for a in ACHIEVEMENTS:
            if not a['condition']():
                continue
            achievement, _ = Achievement.objects.get_or_create(
                badge_type=a['badge_type'],
                defaults={
                    'name': a['name'],
                    'description': a['description'],
                    'icon_url': a['icon_url'],
                },
            )
            UserAchievement.objects.get_or_create(user=user, achievement=achievement)
