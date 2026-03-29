from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('auth_app', '0006_remove_elo_tier_add_xp'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='intra_id',
        ),
    ]
