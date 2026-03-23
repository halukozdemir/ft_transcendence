from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


class LoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('login')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='StrongPass123',
        )

    def test_login_success(self):
        data = {'email': 'test@test.com', 'password': 'StrongPass123'}
        res = self.client.post(self.url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', res.data)
        self.assertIn('access', res.data['tokens'])
        self.assertIn('refresh', res.data['tokens'])
        self.user.refresh_from_db()
        self.assertTrue(self.user.online_status)

    def test_login_wrong_password(self):
        data = {'email': 'test@test.com', 'password': 'WrongPass'}
        res = self.client.post(self.url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_nonexistent_email(self):
        data = {'email': 'no@test.com', 'password': 'StrongPass123'}
        res = self.client.post(self.url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_missing_fields(self):
        res = self.client.post(self.url, {}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
