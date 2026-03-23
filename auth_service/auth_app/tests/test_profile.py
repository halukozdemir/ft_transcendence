from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()


class ProfileTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('profile')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='StrongPass123',
        )
        token = RefreshToken.for_user(self.user)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {token.access_token}'
        )

    def test_get_profile(self):
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['email'], 'test@test.com')
        self.assertEqual(res.data['username'], 'testuser')

    def test_update_username(self):
        res = self.client.patch(
            self.url, {'username': 'updated'}, format='json'
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, 'updated')

    def test_profile_unauthenticated(self):
        self.client.credentials()
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
