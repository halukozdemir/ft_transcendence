"""Tests for newly added endpoints:
- ProfileUpdateView (PATCH /profile/update/)
- DeleteAccountView (DELETE /delete/)
- PasswordChangeView POST method
- FriendRequestCreateView (POST /friends/request/)
- FriendRequestsListView (GET /friends/requests/)
- AcceptFriendView (POST /friends/accept/)
- BlockUserView (POST /users/block/)
- UnblockUserView (POST /users/unblock/)
- BlockedUsersListView (GET /users/blocked/)
"""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from auth_app.models import FriendRequest

User = get_user_model()


def make_user(username, email, password='StrongPass123'):
    return User.objects.create_user(username=username, email=email, password=password)


def auth_client(user):
    client = APIClient()
    token = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.access_token}')
    return client


# ─────────────────────── Profile Update ───────────────────────
class ProfileUpdateTests(TestCase):
    def setUp(self):
        self.user = make_user('testuser', 'test@test.com')
        self.client = auth_client(self.user)
        self.url = reverse('profile-update')

    def test_update_username(self):
        res = self.client.patch(self.url, {'username': 'newname'}, format='multipart')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, 'newname')

    def test_update_bio(self):
        res = self.client.patch(self.url, {'bio': 'Hello world'}, format='multipart')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.bio, 'Hello world')

    def test_unauthenticated(self):
        client = APIClient()
        res = client.patch(self.url, {'username': 'x'}, format='multipart')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


# ─────────────────────── Delete Account ───────────────────────
class DeleteAccountTests(TestCase):
    def setUp(self):
        self.user = make_user('deluser', 'del@test.com')
        self.client = auth_client(self.user)
        self.url = reverse('delete-account')

    def test_delete_success(self):
        res = self.client.delete(self.url, {'password': 'StrongPass123'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(email='del@test.com').exists())

    def test_delete_wrong_password(self):
        res = self.client.delete(self.url, {'password': 'WrongPass'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_no_password(self):
        res = self.client.delete(self.url, {}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_unauthenticated(self):
        client = APIClient()
        res = client.delete(self.url, {'password': 'StrongPass123'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


# ─────────────────────── Password Change POST ───────────────────────
class PasswordChangePostTests(TestCase):
    def setUp(self):
        self.user = make_user('pwuser', 'pw@test.com', 'OldPass1234')
        self.client = auth_client(self.user)
        self.url = reverse('password-change')

    def test_post_method_success(self):
        data = {
            'old_password': 'OldPass1234',
            'new_password': 'NewPass5678',
            'new_password2': 'NewPass5678',
        }
        res = self.client.post(self.url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPass5678'))

    def test_post_wrong_old_password(self):
        data = {
            'old_password': 'WrongOld',
            'new_password': 'NewPass5678',
            'new_password2': 'NewPass5678',
        }
        res = self.client.post(self.url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


# ─────────────────────── Friend Requests ───────────────────────
class FriendRequestTests(TestCase):
    def setUp(self):
        self.sender = make_user('sender', 'sender@test.com')
        self.receiver = make_user('receiver', 'receiver@test.com')
        self.sender_client = auth_client(self.sender)
        self.receiver_client = auth_client(self.receiver)

    def test_send_friend_request(self):
        url = reverse('friend-request-create')
        res = self.sender_client.post(url, {'user_id': self.receiver.id}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(
            FriendRequest.objects.filter(sender=self.sender, receiver=self.receiver).exists()
        )

    def test_send_request_to_self(self):
        url = reverse('friend-request-create')
        res = self.sender_client.post(url, {'user_id': self.sender.id}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_send_duplicate_request(self):
        FriendRequest.objects.create(sender=self.sender, receiver=self.receiver)
        url = reverse('friend-request-create')
        res = self.sender_client.post(url, {'user_id': self.receiver.id}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_friend_requests(self):
        FriendRequest.objects.create(sender=self.sender, receiver=self.receiver)
        url = reverse('friend-requests-list')
        res = self.receiver_client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]['sender_id'], self.sender.id)

    def test_accept_friend_request(self):
        FriendRequest.objects.create(sender=self.sender, receiver=self.receiver)
        url = reverse('accept-friend')
        res = self.receiver_client.post(url, {'user_id': self.sender.id}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(self.receiver.friends.filter(id=self.sender.id).exists())
        self.assertTrue(self.sender.friends.filter(id=self.receiver.id).exists())
        fr = FriendRequest.objects.get(sender=self.sender, receiver=self.receiver)
        self.assertTrue(fr.accepted)

    def test_accept_nonexistent_request(self):
        url = reverse('accept-friend')
        res = self.receiver_client.post(url, {'user_id': self.sender.id}, format='json')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)


# ─────────────────────── Block / Unblock ───────────────────────
class BlockTests(TestCase):
    def setUp(self):
        self.user = make_user('blocker', 'blocker@test.com')
        self.target = make_user('blocked', 'blocked@test.com')
        self.client = auth_client(self.user)

    def test_block_user(self):
        url = reverse('block-user')
        res = self.client.post(url, {'user_id': self.target.id}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(self.user.blocked_users.filter(id=self.target.id).exists())

    def test_block_self(self):
        url = reverse('block-user')
        res = self.client.post(url, {'user_id': self.user.id}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_block_removes_friendship(self):
        self.user.friends.add(self.target)
        self.target.friends.add(self.user)
        url = reverse('block-user')
        self.client.post(url, {'user_id': self.target.id}, format='json')
        self.assertFalse(self.user.friends.filter(id=self.target.id).exists())
        self.assertFalse(self.target.friends.filter(id=self.user.id).exists())

    def test_unblock_user(self):
        self.user.blocked_users.add(self.target)
        url = reverse('unblock-user')
        res = self.client.post(url, {'user_id': self.target.id}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(self.user.blocked_users.filter(id=self.target.id).exists())

    def test_list_blocked_users(self):
        self.user.blocked_users.add(self.target)
        url = reverse('blocked-users')
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]['username'], self.target.username)

    def test_list_blocked_unauthenticated(self):
        client = APIClient()
        url = reverse('blocked-users')
        res = client.get(url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
