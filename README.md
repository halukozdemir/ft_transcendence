# ft_transcendence

**Proje:** Web-Based Multiplayer Haxball Oyunu
**Mimari:** Microservices (Docker)
**Tech Stack:** React (Frontend) | Django & Node.js (Backend) | PostgreSQL (DB) | Nginx (Gateway) | Redis (WebSocket Broker)

---

## Mimari

Proje 6 ana servis + 1 veritabani + 1 cache/broker olarak Docker container'larinda calisir.
Tum servisler tek bir PostgreSQL instance'i uzerindeki ayni veritabanina (`ft_transcendence`) baglanir.

```
                    ┌─────────────────────────┐
                    │   Gateway (Nginx:443)    │
                    │   SSL + Reverse Proxy    │
                    └────────┬────────────────┘
                             │
         ┌───────────┬───────┼───────┬───────────┐
         │           │       │       │           │
    ┌────▼───┐ ┌─────▼──┐ ┌─▼────┐ ┌▼──────┐ ┌──▼────┐
    │Frontend│ │  Auth  │ │ Game │ │ Chat  │ │  AI   │
    │ React  │ │ Django │ │Node.js│ │Django │ │FastAPI│
    │ :80    │ │ :8000  │ │:8001 │ │:8003  │ │:8002  │
    └────────┘ └───┬────┘ └──┬───┘ └──┬────┘ └───────┘
                   │         │        │
                   └─────────┼────────┘
                        ┌────▼────┐  ┌────────┐
                        │PostgreSQL│  │ Redis  │
                        │  :5432  │  │ Broker │
                        └─────────┘  └────────┘
```

### Servisler

| # | Servis | Teknoloji | Port | Rol |
|---|--------|-----------|------|-----|
| 1 | **Gateway** | Nginx 1.25 | 80, 443 | Reverse proxy, SSL, routing |
| 2 | **Frontend** | React 18 | 80 (internal) | SPA, oyun arayuzu |
| 3 | **Auth Service** | Django 5 + DRF + Gunicorn | 8000 | Kayit, giris, JWT, OAuth 42, profil |
| 4 | **Game Service** | Node.js + Express + Socket.io | 8001 | Haxball oyun motoru, WebSocket |
| 5 | **Chat Service** | Django 5 + Channels + Daphne | 8003 | Sohbet, DM, WebSocket |
| 6 | **AI Service** | FastAPI + Uvicorn | 8002 | Avatar kontrolu, mesaj moderasyonu |
| 7 | **PostgreSQL** | PostgreSQL 16 | 5432 | Tek DB — auth, game, chat tablolari |
| 8 | **Redis** | Redis 7 | 6379 | WebSocket broker (Django Channels) |

### Nginx Routing

| Path | Hedef |
|------|-------|
| `/` | Frontend (React SPA) |
| `/api/auth/*` | Auth Service |
| `/api/game/*` | Game Service |
| `/api/chat/*` | Chat Service |
| `/api/ai/*` | AI Service |
| `/ws/game/*` | Game Service (WebSocket) |
| `/ws/chat/*` | Chat Service (WebSocket) |
| `/media/*` | Statik dosyalar (avatarlar) |

---

## Kurulum

### Gereksinimler
- Docker & Docker Compose
- Make

### Hizli Baslangic

```bash
# 1. Repo'yu klonla
git clone <repo-url>
cd ft_transcendence

# 2. Environment dosyasini olustur
cp env.example .env

# 3. Tum servisleri baslat (SSL + build + start)
make
```

Tarayicidan `https://localhost` adresini ac.

### Environment Degiskenleri (.env)

| Degisken | Aciklama | Varsayilan |
|----------|----------|------------|
| `DOMAIN` | Site domain'i | `localhost` |
| `DJANGO_SECRET_KEY` | Django secret key | `dev-secret-key-not-for-production` |
| `DEBUG` | Debug modu (1=acik, 0=kapali) | `1` |
| **PostgreSQL** | | |
| `POSTGRES_DB` | Veritabani adi — tum servisler bunu kullanir | `ft_transcendence` |
| `POSTGRES_USER` | DB kullanici adi | `ft_user` |
| `POSTGRES_PASSWORD` | DB sifresi | `devpassword` |
| `POSTGRES_HOST` | DB host (docker service adi) | `postgres` |
| `POSTGRES_PORT` | DB port | `5432` |
| **Redis** | | |
| `REDIS_HOST` | Redis host | `redis_broker` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis sifresi | `devpassword_redis` |
| **JWT** | | |
| `JWT_SECRET_KEY` | Token imzalama anahtari | `dev-jwt-secret-key` |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | Access token suresi (dk) | `60` |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS` | Refresh token suresi (gun) | `7` |
| **OAuth 42** | | |
| `OAUTH_42_CLIENT_ID` | 42 API client ID | - |
| `OAUTH_42_CLIENT_SECRET` | 42 API client secret | - |
| `OAUTH_42_REDIRECT_URI` | OAuth callback URL | `https://localhost/api/auth/oauth/callback` |

> **Not:** Tek PostgreSQL container'i kullaniliyor. `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` degiskenleri hem container'in kendisi hem de auth/chat/game servisleri tarafindan ortaklanir. `database/init.sql` dosyasi game ve chat tablolarini otomatik olusturur, auth tablolari ise Django migrations ile gelir.

### Komutlar

| Komut | Aciklama |
|-------|----------|
| `make` | SSL + build + start |
| `make up` | Servisleri baslat |
| `make down` | Servisleri durdur |
| `make restart` | Yeniden baslat |
| `make logs` | Tum loglari goruntule |
| `make logs-<servis>` | Tek servis logu (or: `make logs-auth_service`) |
| `make clean` | Container, volume, image hepsini sil |
| `make status` | Container durumlarini goster |
| `make migrate-auth` | Auth DB migration |
| `make migrate-chat` | Chat DB migration |
| `make test` | Tum auth testlerini calistir |
| `make test-auth T=test_login` | Belirli test dosyasini calistir |
| `make superuser` | Django superuser olustur |

---

## Veritabani Yapisi

Tek PostgreSQL instance, tek `ft_transcendence` veritabani:

```
ft_transcendence (PostgreSQL)
├── Auth tablolari (Django migrations ile)
│   └── auth_app_user — kullanici, profil, arkadas listesi
├── Game tablolari (init.sql ile)
│   ├── matches — mac gecmisi, skorlar
│   └── achievements — basarimlar
└── Chat tablolari (init.sql ile)
    ├── channels — sohbet kanallari
    ├── messages — mesajlar
    └── channel_members — kanal uyeleri
```

---

## Proje Yapisi

```
ft_transcendence/
├── gateway/              # Nginx reverse proxy
│   ├── Dockerfile
│   └── nginx.conf
├── frontend/             # React SPA
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── src/
│   └── package.json
├── auth_service/         # Django - Auth & User
│   ├── Dockerfile
│   ├── auth_project/     # Django settings
│   ├── auth_app/         # App logic
│   │   ├── models.py     # User modeli
│   │   ├── views.py      # Register, Login, OAuth, Friends
│   │   ├── serializers.py
│   │   └── tests/        # Test suite
│   └── requirements.txt
├── game_service/         # Node.js - Game Engine
│   ├── Dockerfile
│   ├── server.js         # Express + Socket.io server
│   ├── package.json
│   └── game/             # Oyun motoru
│       ├── GameRoom.js   # Oda yonetimi, skor, reset
│       ├── Player.js     # Oyuncu fizigi, input
│       ├── Ball.js       # Top fizigi
│       └── physics.js    # Carpisma, vurus, momentum
├── chat_service/         # Django Channels - Chat
│   ├── Dockerfile
│   ├── chat_project/     # Django settings
│   ├── chat_app/         # App logic
│   └── requirements.txt
├── ai_service/           # FastAPI - AI Moderation
│   ├── Dockerfile
│   └── app/main.py
├── database/             # DB init
│   └── init.sql          # Game + Chat tablo semalari
├── ssl/                  # SSL sertifikalari (gitignore)
├── docker-compose.yml
├── Makefile
├── env.example
└── generate_ssl.sh
```

---

## Gelistirme Yol Haritasi

### Adim 1: Altyapi
- [x] Docker Compose ile tum servisleri ayaga kaldir
- [x] Nginx gateway (SSL, routing, WebSocket)
- [x] PostgreSQL veritabani (tek instance)
- [x] Redis broker
- [x] database/init.sql ile tablo semalari

### Adim 2: Kullanici Yonetimi
- [x] User modeli (email, avatar, online_status, intra_id, friends)
- [x] JWT authentication (login, register, refresh, logout)
- [x] 42 OAuth entegrasyonu
- [x] Profil ve avatar yonetimi
- [x] Sifre degistirme
- [x] Arkadas ekleme/cikarma
- [x] Auth test suite (23 test)

### Adim 3: Oyun Cekirdegi
- [x] Socket.io ile client-server iletisimi
- [x] 60 FPS server-side game loop (30 FPS network broadcast)
- [x] Fizik motoru (top, oyuncu, carpisma)
- [x] Client tarafinda Canvas render
- [ ] JWT token ile oyuncu dogrulama
- [ ] Mac sonucu kaydetme

### Adim 4: Oda ve Eslestirme
- [ ] Room ID ile oda olusturma/katilma
- [ ] Harita secimi

### Adim 5: Chat ve Sosyal
- [ ] WebSocket ile gercek zamanli sohbet
- [ ] DM, kanal sistemi
- [ ] AI mesaj moderasyonu

### Adim 6: Istatistikler
- [ ] Mac gecmisi kaydetme
- [ ] Skor tablosu
- [ ] Achievements

### Adim 7: Cila
- [ ] Avatar AI kontrolu
- [ ] UI/UX iyilestirmeleri
- [ ] Son testler
