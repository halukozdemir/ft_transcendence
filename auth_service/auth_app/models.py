from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    avatar = models.ImageField(
        upload_to='avatars/',
        default='avatars/default.png',
        blank=True
    )
    banner = models.ImageField(
        upload_to='banners/',
        default='banners/default.png',
        blank=True
    )
    online_status = models.BooleanField(default=False)
    last_seen = models.DateTimeField(null=True, blank=True)
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
    blocked_users = models.ManyToManyField(
        'self',
        blank=True,
        symmetrical=False,
        related_name='blocked_by'
    )
    bio = models.TextField(max_length=500, blank=True)
    elo_rating = models.IntegerField(default=1200)
    tier = models.CharField(
        max_length=20,
        choices=[
            ('bronze', 'Bronze'),
            ('silver', 'Silver'),
            ('gold', 'Gold'),
            ('platinum', 'Platinum'),
            ('diamond', 'Diamond'),
        ],
        default='bronze'
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.username


class PlayerStats(models.Model):
    """Player game statistics"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='stats')
    total_matches = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    draws = models.IntegerField(default=0)
    win_rate = models.FloatField(default=0.0)
    last_match_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Player Stats"

    def __str__(self):
        return f"{self.user.username} - {self.wins}W {self.losses}L"


class MatchRecord(models.Model):
    """Team-based match record - supports 1v1, 2v2, 3v3, etc."""
    winner_team = models.CharField(
        max_length=10,
        choices=[('red', 'Red'), ('blue', 'Blue')],
        null=True,
        blank=True
    )
    score_red = models.IntegerField(default=0)
    score_blue = models.IntegerField(default=0)
    duration_seconds = models.IntegerField(default=0)
    end_reason = models.CharField(
        max_length=30,
        choices=[
            ('score_limit', 'Score Limit'),
            ('time_limit', 'Time Limit'),
            ('time_limit_draw', 'Time Limit Draw'),
            ('forfeit', 'Forfeit'),
            ('disconnect', 'Disconnect'),
        ],
        default='score_limit'
    )
    played_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-played_at']
        indexes = [
            models.Index(fields=['-played_at']),
        ]

    def __str__(self):
        return f"Match #{self.id} — Red {self.score_red}:{self.score_blue} Blue"

class MatchPlayer(models.Model):
    """Links a user to a match with their team"""
    match = models.ForeignKey(
        MatchRecord,
        on_delete=models.CASCADE,
        related_name='match_players'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='match_participations'
    )
    team = models.CharField(
        max_length=10,
        choices=[('red', 'Red'), ('blue', 'Blue')]
    )

    class Meta:
        unique_together = ['match', 'user']
        ordering = ['team', 'id']
    
    def __str__(self):
        return f"{self.user.username} — {self.team} — Match #{self.match_id}"

class Achievement(models.Model):
    """Achievement badges"""
    users = models.ManyToManyField(User, through='UserAchievement', related_name='achievements')
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon_url = models.URLField()
    badge_type = models.CharField(
        max_length=50,
        choices=[
            ('first_win', 'First Win'),
            ('streak_5', '5-Win Streak'),
            ('perfect_win', 'Perfect Win'),
            ('tournament_champion', 'Tournament Champion'),
            ('unstoppable', 'Unstoppable'),
        ]
    )
    
    class Meta:
        unique_together = ['name', 'badge_type']
    
    def __str__(self):
        return self.name


class UserAchievement(models.Model):
    """Track when user unlocked achievement"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'achievement']
        ordering = ['-unlocked_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.achievement.name}"


class FriendRequest(models.Model):
    """Friend request model"""
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_requests')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_requests')
    created_at = models.DateTimeField(auto_now_add=True)
    accepted = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['sender', 'receiver']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username}"
