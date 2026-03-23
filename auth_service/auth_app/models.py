from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    avatar = models.ImageField(
        upload_to='avatars/',
        default='avatars/default.png',
        blank=True
    )
    online_status = models.BooleanField(default=False)
    intra_id = models.IntegerField(
        unique=True,
        null=True,
        blank=True
    )
    friends = models.ManyToManyField(
        'self',
        blank=True,
        symmetrical=False,
        related_name='friend_of'
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.username
