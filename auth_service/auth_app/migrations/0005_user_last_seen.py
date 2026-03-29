from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auth_app', '0004_user_banner'),
    ]

    operations = [
        # Column already exists in DB — only update model state
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name='user',
                    name='last_seen',
                    field=models.DateTimeField(blank=True, null=True),
                ),
            ],
            database_operations=[],
        ),
    ]
