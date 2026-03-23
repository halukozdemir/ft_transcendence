from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()


class LogoutTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('logout')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='StrongPass123',
        )
        self.user.online_status = True
        self.user.save()
        self.refresh = RefreshToken.for_user(self.user)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {self.refresh.access_token}'
        )

    def test_logout_success(self):
        res = self.client.post(
            self.url, {'refresh': str(self.refresh)}, format='json'
        )
        self.assertEqual(res.status_code, status.HTTP_205_RESET_CONTENT)
        self.user.refresh_from_db()
        self.assertFalse(self.user.online_status)

    def test_logout_unauthenticated(self):
        self.client.credentials()
        res = self.client.post(self.url, {}, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
