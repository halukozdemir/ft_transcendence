-- ============================================
-- ft_transcendence - Database Initialization
-- ============================================
-- Bu dosya PostgreSQL container ilk acildiginda
-- otomatik calisir.
--
-- AUTH tablolari (users, friends) Django migrations
-- tarafindan olusturulur — burada YOKTUR.
-- Sadece game ve chat servislerin tablolari var.
-- ============================================

-- =====================
-- GAME SERVICE TABLOLARI
-- =====================

CREATE TABLE IF NOT EXISTS matches (
    id              SERIAL PRIMARY KEY,
    player1_id      INTEGER,
    player2_id      INTEGER,
    player1_score   INTEGER DEFAULT 0,
    player2_score   INTEGER DEFAULT 0,
    winner_id       INTEGER,
    status          VARCHAR(20) DEFAULT 'waiting',  -- waiting, playing, finished
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at     TIMESTAMP
);

CREATE TABLE IF NOT EXISTS achievements (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL,
    achievement     VARCHAR(100) NOT NULL,
    earned_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement)
);

-- =====================
-- CHAT SERVICE TABLOLARI
-- =====================

CREATE TABLE IF NOT EXISTS channels (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    type            VARCHAR(20) DEFAULT 'public',   -- public, private, dm
    created_by      INTEGER,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id              SERIAL PRIMARY KEY,
    channel_id      INTEGER NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    sender_id       INTEGER NOT NULL,
    content         TEXT NOT NULL,
    is_moderated    BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS channel_members (
    id              SERIAL PRIMARY KEY,
    channel_id      INTEGER NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_id         INTEGER NOT NULL,
    joined_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(channel_id, user_id)
);
