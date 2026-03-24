from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
import requests
from django.conf import settings
from django.shortcuts import redirect

from .serializers import(
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    ProfileSerializer,
    AvatarSerializer,
    FriendRequestSerializer,
    PasswordChangeSerializer,
)

User = get_user_model()

# ──────────────── Register ────────────────
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
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
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer

    def get_object(self):
        return self.request.user
    
# ──────────────── Avatar Upload ────────────────
class AvatarUploadView(APIView):
    parser_classes = [MultiPartParser]

    def put(self, request):
        serializer = AvatarSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
# ──────────────── User Detail (public) ────────────────
class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'id'

# ──────────────── Password Change ────────────────
class PasswordChangeView(APIView):
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
        
        request.user.friends.remove(friend)
        friend.friends.remove(request.user)
        return Response(
            {'detail': f'Removed {friend.username}.'}
        )
    
class FriendListView(generics.ListAPIView):
    serializer_class = UserSerializer

    def get_queryset(self):
        return self.request.user.friends.all()

# ──────────────── OAuth 42: Redirect ────────────────
class OAuth42RedirectView(APIView):
    permission_classes = [permissions.AllowAny]

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
    permission_classes = [permissions.AllowAny]

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
            user = User.objects.create_user(
                username=username,
                email=email,
                intra_id=intra_id,
                password=None,
            )

        user.online_status = True
        user.save(update_fields=['online_status'])

        refresh = RefreshToken.for_user(user)
        frontend_url = (
            f"https://{settings.DOMAIN}/oauth/callback"
            f"?access={str(refresh.access_token)}"
            f"&refresh={str(refresh)}"
        )
        return redirect(frontend_url)