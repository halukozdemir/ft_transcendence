# Generated migration for adding banner field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auth_app', '0003_matchplayer_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='banner',
            field=models.ImageField(blank=True, default='banners/default.png', upload_to='banners/'),
        ),
    ]
