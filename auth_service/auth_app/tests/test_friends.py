from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()


class FriendTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='user1', email='u1@test.com', password='StrongPass123'
        )
        self.friend = User.objects.create_user(
            username='user2', email='u2@test.com', password='StrongPass123'
        )
        token = RefreshToken.for_user(self.user)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {token.access_token}'
        )

    def test_add_friend(self):
        res = self.client.post(
            reverse('add-friend'),
            {'user_id': self.friend.id},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(self.user.friends.filter(id=self.friend.id).exists())
        self.assertTrue(self.friend.friends.filter(id=self.user.id).exists())

    def test_add_self_as_friend(self):
        res = self.client.post(
            reverse('add-friend'),
            {'user_id': self.user.id},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_add_friend_already_friends(self):
        self.user.friends.add(self.friend)
        self.friend.friends.add(self.user)
        res = self.client.post(
            reverse('add-friend'),
            {'user_id': self.friend.id},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_add_nonexistent_friend(self):
        res = self.client.post(
            reverse('add-friend'), {'user_id': 9999}, format='json'
        )
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_remove_friend(self):
        self.user.friends.add(self.friend)
        self.friend.friends.add(self.user)
        res = self.client.post(
            reverse('remove-friend'),
            {'user_id': self.friend.id},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(self.user.friends.filter(id=self.friend.id).exists())

    def test_friend_list(self):
        self.user.friends.add(self.friend)
        res = self.client.get(reverse('friend-list'))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]['username'], 'user2')
