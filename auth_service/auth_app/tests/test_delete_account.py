from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()


class DeleteAccountTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('account-delete')
        self.user = User.objects.create_user(
            username='delete_me',
            email='delete@test.com',
            password='DeletePass1234',
        )
        token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.access_token}')

    def test_delete_account_success(self):
        res = self.client.delete(
            self.url,
            {'password': 'DeletePass1234'},
            format='json'
        )
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(id=self.user.id).exists())

    def test_delete_account_wrong_password(self):
        res = self.client.delete(
            self.url,
            {'password': 'WrongPass'},
            format='json'
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(User.objects.filter(id=self.user.id).exists())

    def test_delete_account_post_alias(self):
        res = self.client.post(
            self.url,
            {'password': 'DeletePass1234'},
            format='json'
        )
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)