# ft_transcendence - Mimari Dokumantasyon

## Genel Bakis

Proje, Docker container'lari icinde calisan bir microservices mimarisine sahiptir.
Her servis kendi sorumluluk alaninda bagimsiz calisir ve Nginx Gateway uzerinden
dis dunyaya acilir.

---

## Container Semasi

```
                         INTERNET / BROWSER
                              |
                              v
                    +---------+----------+
                    |   ft_gateway       |
                    |   Nginx :443/:80   |
                    |   (Reverse Proxy)  |
                    |   SSL Termination  |
                    +----+----+----+-----+
                         |    |    |
          +--------------+    |    +---------------+
          |                   |                    |
          v                   v                    v
  +-------+------+   +-------+-------+   +--------+------+
  |  ft_frontend  |   |   ft_auth     |   |   ft_game     |
  |  React SPA    |   |   Django+DRF  |   |   Node.js     |
  |  Nginx :80    |   |   Gunicorn    |   |   Express     |
  |               |   |   :8000       |   |   Socket.io   |
  |  - Login UI   |   |               |   |   :8001       |
  |  - Game UI    |   |  - Register   |   |               |
  |  - Chat UI    |   |  - Login/JWT  |   |  - Game Loop  |
  |  - Profile    |   |  - OAuth 42   |   |  - Physics    |
  |               |   |  - Profile    |   |  - Rooms      |
  +---------------+   +-------+-------+   +-------+-------+
                              |                    |
                         +----v----+          +----v----+
                         |ft_db_user|         |ft_db_stats|
                         |Postgres |          |Postgres |
                         |:5432    |          |:5432    |
                         +---------+          +---------+

  +-------+------+   +-------+-------+
  |  ft_chat      |   |   ft_ai       |
  |  Django       |   |   FastAPI     |
  |  Channels     |   |   Uvicorn     |
  |  Daphne       |   |   :8002       |
  |  :8003        |   |               |
  |               |   |  - Image AI   |
  |  - WebSocket  |   |  - Text AI    |
  |  - DM         |   |               |
  |  - Channels   |   +---------------+
  +-------+-------+
          |
     +----v-----+     +-----------+
     |ft_db_chat |     |  ft_redis  |
     |Postgres  |     |  Redis 7   |
     |:5432     |     |  :6379     |
     +-----------+     +-----------+
```

---

## Network Yapisi

```
+------------------------------------------------------------------+
|                        backend_net                                 |
|                                                                    |
|  ft_auth  ft_game  ft_chat  ft_ai  ft_db_user  ft_db_stats       |
|  ft_db_chat  ft_redis                                              |
|                                                                    |
+------------------------------------------------------------------+
        ^                    ^
        |                    |
   ft_gateway           ft_gateway
        |                    |
        v                    v
+------------------------------------------------------------------+
|                        frontend_net                                |
|                                                                    |
|  ft_frontend  ft_gateway                                           |
|                                                                    |
+------------------------------------------------------------------+
```

- **frontend_net**: Gateway <-> Frontend iletisimi
- **backend_net**: Gateway <-> Backend servisleri + DB'ler + Redis

Gateway her iki network'e de bagli (bridge gorevi gorur).

---

## Nginx Routing Tablosu

| Gelen Istek | Hedef Servis | Protokol | Aciklama |
|---|---|---|---|
| `GET /` | ft_frontend:80 | HTTP | React SPA |
| `POST /api/auth/*` | ft_auth:8000 | HTTP | Auth islemleri |
| `GET /api/game/*` | ft_game:8001 | HTTP | Game REST API |
| `GET /api/chat/*` | ft_chat:8003 | HTTP | Chat REST API |
| `GET /api/ai/*` | ft_ai:8002 | HTTP | AI analiz API |
| `WS /ws/game/*` | ft_game:8001 | WebSocket | Oyun gercek zamanli iletisim |
| `WS /ws/chat/*` | ft_chat:8003 | WebSocket | Chat gercek zamanli iletisim |
| `GET /media/*` | Statik dosya | HTTP | Avatar resimleri |

---

## Servis Detaylari

### 1. Gateway (ft_gateway)
- **Image**: nginx:1.25-alpine (custom config)
- **Portlar**: 80 (HTTP->HTTPS redirect), 443 (HTTPS)
- **Gorev**: SSL termination, reverse proxy, routing, guvenlik header'lari
- **Volume**: `./ssl:/etc/nginx/ssl:ro` (sertifikalar), `user_avatars:/var/www/media:ro`
- **Depends on**: frontend, auth_service, game_service, ai_service, chat_service

### 2. Frontend (ft_frontend)
- **Image**: node:20-alpine (build) + nginx:1.25-alpine (serve)
- **Framework**: React 18 + react-scripts (CRA)
- **Port**: 80 (internal)
- **Build**: Multi-stage - npm build -> nginx serve
- **Paketler**: react, react-dom, react-router-dom, axios, socket.io-client

### 3. Auth Service (ft_auth)
- **Image**: python:3.12-slim
- **Framework**: Django 5 + Django REST Framework + SimpleJWT
- **Port**: 8000
- **WSGI**: Gunicorn (3 worker)
- **DB**: db_user (PostgreSQL)
- **Entrypoint**: DB ready bekle -> migrate -> start
- **API Prefix**: `/api/auth/`

### 4. Game Service (ft_game)
- **Image**: node:20-alpine
- **Framework**: Express + Socket.io
- **Port**: 8001
- **Gorev**: Haxball oyun motoru, 60 FPS server-side game loop
- **WebSocket Path**: `/ws/game/`
- **API Prefix**: `/api/game/`
- **Fizik**: Ozel 2D cember carpisma motoru (Ball, Player, physics)
- **Depends on**: redis_broker

### 5. Chat Service (ft_chat)
- **Image**: python:3.12-slim
- **Framework**: Django 5 + Channels + Daphne
- **Port**: 8003
- **ASGI**: Daphne (WebSocket destekli)
- **DB**: db_chat (PostgreSQL)
- **Redis**: Channel layer backend
- **WebSocket Path**: `/ws/chat/<room_name>/`
- **API Prefix**: `/api/chat/`

### 6. AI Service (ft_ai)
- **Image**: python:3.12-slim
- **Framework**: FastAPI + Uvicorn
- **Port**: 8002
- **Gorev**: Resim analizi (avatar), metin moderasyonu (chat)
- **API Prefix**: `/api/ai/`

### 7. Veritabanlari

| DB | Container | Veri |
|---|---|---|
| db_user | ft_db_user | Users, profiles, friends, blocked |
| db_stats | ft_db_stats | Match history, achievements, scores |
| db_chat | ft_db_chat | Messages, channels, DMs |

Hepsi **PostgreSQL 16 Alpine** image kullanir, healthcheck ile hazir olana kadar beklenir.

### 8. Redis (ft_redis)
- **Image**: redis:7-alpine
- **Gorev**: Django Channels broker (chat WebSocket), potansiyel game pub/sub
- **Auth**: `REDIS_PASSWORD` ile korumali

---

## Veri Akisi

### Oyun Akisi
```
Browser                 Gateway              Game Service
  |                        |                      |
  |--- wss://host/ws/game/ -->--- proxy -------->|
  |                        |                      |
  |<-- "joined" {team} ---|<---- socket.emit ----|
  |                        |                      |
  |--- "input" {wasd,kick} -->--- socket.on ---->|
  |                        |                      |
  |                        |      [Game Loop]     |
  |                        |      60 FPS:         |
  |                        |      - Input uygula  |
  |                        |      - Fizik hesapla |
  |                        |      - Carpisma      |
  |                        |      - Gol kontrol   |
  |                        |                      |
  |<-- "state" {players,ball,score} -------------|
  |                        |                      |
  | [Canvas render 60fps]  |                      |
```

### Auth Akisi
```
Browser -> Gateway -> Auth Service -> db_user
  |                      |
  |-- POST /api/auth/login/ {username, password}
  |                      |
  |<-- 200 {access_token, refresh_token}
  |                      |
  | [Token localStorage'da saklanir]
  |                      |
  |-- GET /api/auth/profile/
  |   Header: Authorization: Bearer <token>
  |                      |
  |<-- 200 {user data}
```

---

## Docker Volumes

| Volume | Bagli Container | Path | Aciklama |
|---|---|---|---|
| db_user_data | ft_db_user | /var/lib/postgresql/data | User DB kalici veri |
| db_stats_data | ft_db_stats | /var/lib/postgresql/data | Stats DB kalici veri |
| db_chat_data | ft_db_chat | /var/lib/postgresql/data | Chat DB kalici veri |
| redis_data | ft_redis | /data | Redis kalici veri |
| user_avatars | ft_auth + ft_gateway | /app/media/avatars + /var/www/media | Kullanici avatarlari |

---

## Environment Variables

Tum env degiskenleri `.env` dosyasinda tanimlidir. Ornek: `env.example`

| Degisken | Kullanan Servis | Aciklama |
|---|---|---|
| DJANGO_SECRET_KEY | auth, chat | Django secret key |
| POSTGRES_USER_* | auth, db_user | User DB baglanti bilgileri |
| POSTGRES_STATS_* | db_stats | Stats DB baglanti bilgileri |
| POSTGRES_CHAT_* | chat, db_chat | Chat DB baglanti bilgileri |
| REDIS_* | chat, redis, game | Redis baglanti bilgileri |
| JWT_* | auth | JWT token ayarlari |
| OAUTH_42_* | auth | 42 API OAuth bilgileri |
| AI_SERVICE_* | auth, chat | AI servis adresi |

---

## Komutlar

```bash
make              # SSL + build + start (tam kurulum)
make up           # Servisleri baslat
make down         # Servisleri durdur
make restart      # Yeniden baslat
make logs         # Tum loglar
make logs-<servis># Tek servis logu (ornek: make logs-game_service)
make status       # Container durumlari
make clean        # Herseyi sil (container, volume, image)
make migrate-auth # Auth DB migration
make migrate-chat # Chat DB migration
```
