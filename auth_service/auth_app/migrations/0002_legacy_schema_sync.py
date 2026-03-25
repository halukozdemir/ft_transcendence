from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("auth_app", "0001_initial"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            ALTER TABLE auth_app_user
                ADD COLUMN IF NOT EXISTS bio text NOT NULL DEFAULT '';

            ALTER TABLE auth_app_user
                ADD COLUMN IF NOT EXISTS elo_rating integer NOT NULL DEFAULT 1200;

            ALTER TABLE auth_app_user
                ADD COLUMN IF NOT EXISTS tier varchar(20) NOT NULL DEFAULT 'bronze';

            CREATE TABLE IF NOT EXISTS auth_app_user_blocked_users (
                id bigserial PRIMARY KEY,
                from_user_id bigint NOT NULL REFERENCES auth_app_user(id) ON DELETE CASCADE,
                to_user_id bigint NOT NULL REFERENCES auth_app_user(id) ON DELETE CASCADE
            );

            CREATE UNIQUE INDEX IF NOT EXISTS auth_app_user_blocked_users_from_to_uniq
                ON auth_app_user_blocked_users (from_user_id, to_user_id);
            CREATE INDEX IF NOT EXISTS auth_app_user_blocked_users_from_idx
                ON auth_app_user_blocked_users (from_user_id);
            CREATE INDEX IF NOT EXISTS auth_app_user_blocked_users_to_idx
                ON auth_app_user_blocked_users (to_user_id);

            CREATE TABLE IF NOT EXISTS auth_app_playerstats (
                id bigserial PRIMARY KEY,
                total_matches integer NOT NULL DEFAULT 0,
                wins integer NOT NULL DEFAULT 0,
                losses integer NOT NULL DEFAULT 0,
                draws integer NOT NULL DEFAULT 0,
                win_rate double precision NOT NULL DEFAULT 0,
                last_match_date timestamp with time zone NULL,
                created_at timestamp with time zone NOT NULL DEFAULT NOW(),
                updated_at timestamp with time zone NOT NULL DEFAULT NOW(),
                user_id bigint NOT NULL UNIQUE REFERENCES auth_app_user(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS auth_app_achievement (
                id bigserial PRIMARY KEY,
                name varchar(100) NOT NULL,
                description text NOT NULL,
                icon_url varchar(200) NOT NULL,
                badge_type varchar(50) NOT NULL
            );

            CREATE UNIQUE INDEX IF NOT EXISTS auth_app_achievement_name_badge_uniq
                ON auth_app_achievement (name, badge_type);

            CREATE TABLE IF NOT EXISTS auth_app_userachievement (
                id bigserial PRIMARY KEY,
                unlocked_at timestamp with time zone NOT NULL DEFAULT NOW(),
                user_id bigint NOT NULL REFERENCES auth_app_user(id) ON DELETE CASCADE,
                achievement_id bigint NOT NULL REFERENCES auth_app_achievement(id) ON DELETE CASCADE
            );

            CREATE UNIQUE INDEX IF NOT EXISTS auth_app_userachievement_user_achievement_uniq
                ON auth_app_userachievement (user_id, achievement_id);

            CREATE TABLE IF NOT EXISTS auth_app_friendrequest (
                id bigserial PRIMARY KEY,
                created_at timestamp with time zone NOT NULL DEFAULT NOW(),
                accepted boolean NOT NULL DEFAULT false,
                sender_id bigint NOT NULL REFERENCES auth_app_user(id) ON DELETE CASCADE,
                receiver_id bigint NOT NULL REFERENCES auth_app_user(id) ON DELETE CASCADE
            );

            CREATE UNIQUE INDEX IF NOT EXISTS auth_app_friendrequest_sender_receiver_uniq
                ON auth_app_friendrequest (sender_id, receiver_id);
            CREATE INDEX IF NOT EXISTS auth_app_friendrequest_created_idx
                ON auth_app_friendrequest (created_at DESC);

            CREATE TABLE IF NOT EXISTS auth_app_matchrecord (
                id bigserial PRIMARY KEY,
                score_p1 integer NOT NULL DEFAULT 0,
                score_p2 integer NOT NULL DEFAULT 0,
                duration_seconds integer NOT NULL DEFAULT 0,
                played_at timestamp with time zone NOT NULL DEFAULT NOW(),
                replay_url varchar(200) NULL,
                player1_id bigint NOT NULL REFERENCES auth_app_user(id) ON DELETE CASCADE,
                player2_id bigint NOT NULL REFERENCES auth_app_user(id) ON DELETE CASCADE,
                winner_id bigint NULL REFERENCES auth_app_user(id) ON DELETE SET NULL
            );

            CREATE INDEX IF NOT EXISTS auth_app_matchrecord_played_idx
                ON auth_app_matchrecord (played_at DESC);
            CREATE INDEX IF NOT EXISTS auth_app_matchrecord_player1_played_idx
                ON auth_app_matchrecord (player1_id, played_at DESC);
            CREATE INDEX IF NOT EXISTS auth_app_matchrecord_player2_played_idx
                ON auth_app_matchrecord (player2_id, played_at DESC);
            """,
            reverse_sql=migrations.RunSQL.noop,
        )
    ]
