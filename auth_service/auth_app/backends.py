from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

User = get_user_model()


class EmailBackend(ModelBackend):
    """Custom authentication backend - authenticate with email instead of username"""
    
    def authenticate(self, request, username=None, email=None, password=None, **kwargs):
        try:
            # Handle both username and email fields
            if email:
                user = User.objects.get(email=email)
            elif username:
                user = User.objects.get(email=username)  # Fallback for email
            else:
                return None
        except User.DoesNotExist:
            return None
        
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        
        return None
    
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
