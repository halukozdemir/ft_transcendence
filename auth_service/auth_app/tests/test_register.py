from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('register')

    def test_register_success(self):
        data = {
            'username': 'newuser',
            'email': 'new@test.com',
            'password': 'StrongPass123',
            'password2': 'StrongPass123',
        }
        res = self.client.post(self.url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', res.data)
        self.assertIn('access', res.data['tokens'])
        self.assertIn('refresh', res.data['tokens'])
        self.assertEqual(res.data['user']['email'], 'new@test.com')
        self.assertTrue(User.objects.filter(email='new@test.com').exists())

    def test_register_password_mismatch(self):
        data = {
            'username': 'user1',
            'email': 'user1@test.com',
            'password': 'StrongPass123',
            'password2': 'WrongPass456',
        }
        res = self.client.post(self.url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email(self):
        User.objects.create_user(
            username='existing', email='dup@test.com', password='Pass1234'
        )
        data = {
            'username': 'other',
            'email': 'dup@test.com',
            'password': 'StrongPass123',
            'password2': 'StrongPass123',
        }
        res = self.client.post(self.url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_weak_password(self):
        data = {
            'username': 'user2',
            'email': 'user2@test.com',
            'password': '123',
            'password2': '123',
        }
        res = self.client.post(self.url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_missing_fields(self):
        res = self.client.post(self.url, {}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
