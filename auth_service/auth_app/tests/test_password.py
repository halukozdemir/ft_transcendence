from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()


class PasswordChangeTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('password-change')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='OldPass1234',
        )
        token = RefreshToken.for_user(self.user)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {token.access_token}'
        )

    def test_password_change_success(self):
        data = {
            'old_password': 'OldPass1234',
            'new_password': 'NewPass5678',
            'new_password2': 'NewPass5678',
        }
        res = self.client.put(self.url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPass5678'))

    def test_password_change_wrong_old(self):
        data = {
            'old_password': 'WrongOld',
            'new_password': 'NewPass5678',
            'new_password2': 'NewPass5678',
        }
        res = self.client.put(self.url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_change_mismatch(self):
        data = {
            'old_password': 'OldPass1234',
            'new_password': 'NewPass5678',
            'new_password2': 'Different999',
        }
        res = self.client.put(self.url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
