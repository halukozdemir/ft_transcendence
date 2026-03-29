from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auth_app', '0005_user_last_seen'),
    ]

    operations = [
        migrations.RemoveField(model_name='user', name='elo_rating'),
        migrations.RemoveField(model_name='user', name='tier'),
        migrations.AddField(
            model_name='playerstats',
            name='xp',
            field=models.IntegerField(default=0),
        ),
    ]
