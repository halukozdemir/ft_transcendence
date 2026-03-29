import django.contrib.auth.models
import django.contrib.auth.validators
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        # ── User ──
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('avatar', models.ImageField(blank=True, default='avatars/default.png', upload_to='avatars/')),
                ('banner', models.ImageField(blank=True, default='banners/default.png', upload_to='banners/')),
                ('online_status', models.BooleanField(default=False)),
                ('last_seen', models.DateTimeField(blank=True, null=True)),
                ('bio', models.TextField(blank=True, max_length=500)),
                ('friends', models.ManyToManyField(blank=True, related_name='friend_of', to=settings.AUTH_USER_MODEL)),
                ('blocked_users', models.ManyToManyField(blank=True, related_name='blocked_by', to=settings.AUTH_USER_MODEL)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'abstract': False,
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        # ── Achievement ──
        migrations.CreateModel(
            name='Achievement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('icon_url', models.URLField()),
                ('badge_type', models.CharField(choices=[('first_win', 'First Win'), ('streak_5', '5-Win Streak'), ('perfect_win', 'Perfect Win'), ('tournament_champion', 'Tournament Champion'), ('unstoppable', 'Unstoppable')], max_length=50)),
            ],
            options={
                'unique_together': {('name', 'badge_type')},
            },
        ),
        # ── PlayerStats ──
        migrations.CreateModel(
            name='PlayerStats',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('total_matches', models.IntegerField(default=0)),
                ('wins', models.IntegerField(default=0)),
                ('losses', models.IntegerField(default=0)),
                ('draws', models.IntegerField(default=0)),
                ('win_rate', models.FloatField(default=0.0)),
                ('xp', models.IntegerField(default=0)),
                ('last_match_date', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='stats', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'Player Stats',
            },
        ),
        # ── MatchRecord ──
        migrations.CreateModel(
            name='MatchRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('winner_team', models.CharField(blank=True, choices=[('red', 'Red'), ('blue', 'Blue')], max_length=10, null=True)),
                ('score_red', models.IntegerField(default=0)),
                ('score_blue', models.IntegerField(default=0)),
                ('duration_seconds', models.IntegerField(default=0)),
                ('end_reason', models.CharField(choices=[('score_limit', 'Score Limit'), ('time_limit', 'Time Limit'), ('time_limit_draw', 'Time Limit Draw'), ('forfeit', 'Forfeit'), ('disconnect', 'Disconnect')], default='score_limit', max_length=30)),
                ('played_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-played_at'],
                'indexes': [models.Index(fields=['-played_at'], name='auth_app_ma_played__ede762_idx')],
            },
        ),
        # ── MatchPlayer ──
        migrations.CreateModel(
            name='MatchPlayer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('team', models.CharField(choices=[('red', 'Red'), ('blue', 'Blue')], max_length=10)),
                ('match', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='match_players', to='auth_app.matchrecord')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='match_participations', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['team', 'id'],
                'unique_together': {('match', 'user')},
            },
        ),
        # ── UserAchievement ──
        migrations.CreateModel(
            name='UserAchievement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('unlocked_at', models.DateTimeField(auto_now_add=True)),
                ('achievement', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='auth_app.achievement')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-unlocked_at'],
                'unique_together': {('user', 'achievement')},
            },
        ),
        migrations.AddField(
            model_name='achievement',
            name='users',
            field=models.ManyToManyField(related_name='achievements', through='auth_app.UserAchievement', to=settings.AUTH_USER_MODEL),
        ),
        # ── FriendRequest ──
        migrations.CreateModel(
            name='FriendRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('accepted', models.BooleanField(default=False)),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sent_requests', to=settings.AUTH_USER_MODEL)),
                ('receiver', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='received_requests', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
                'unique_together': {('sender', 'receiver')},
            },
        ),
    ]
