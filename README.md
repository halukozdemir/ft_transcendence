# ft_transcendence: Haxball Klonu

**Proje:** Web-Based Multiplayer Haxball Oyunu
**Mimari:** Microservices (Docker)
**Tech Stack:** React (Frontend) | Django & Node.js (Backend) | PostgreSQL (DB) | Nginx (Gateway) | Redis (WebSocket Broker)

---

## Mimari

Proje 5 ana servis + 3 veritabanı + 1 cache/broker olarak Docker container'larında çalışır.

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
              ┌────▼───┐     │   ┌────▼───┐
              │db_user │     │   │db_chat │
              │Postgres│     │   │Postgres│
              └────────┘     │   └────────┘
                        ┌────▼───┐  ┌────────┐
                        │db_stats│  │ Redis  │
                        │Postgres│  │ Broker │
                        └────────┘  └────────┘
```

### Servisler

| # | Servis | Teknoloji | Port | Veritabanı | Rol |
|---|--------|-----------|------|------------|-----|
| 1 | **Gateway** | Nginx 1.25 | 80, 443 | - | Reverse proxy, SSL, routing |
| 2 | **Frontend** | React 18 | 80 (internal) | - | SPA, oyun arayüzü |
| 3 | **Auth Service** | Django 5 + DRF + Gunicorn | 8000 | db_user (PostgreSQL) | Kayıt, giriş, JWT, OAuth 42, profil |
| 4 | **Game Service** | Node.js + Express + Socket.io | 8001 | db_stats (PostgreSQL) | Haxball oyun motoru, WebSocket |
| 5 | **Chat Service** | Django 5 + Channels + Daphne | 8003 | db_chat (PostgreSQL) | Sohbet, DM, WebSocket |
| 6 | **AI Service** | FastAPI + Uvicorn | 8002 | - | Avatar kontrolü, mesaj moderasyonu |

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

### Hızlı Başlangıç

```bash
# 1. Repo'yu klonla
git clone <repo-url>
cd ft_transcendence

# 2. Environment dosyasını oluştur
cp env.example .env
# .env dosyasını düzenle (şifreleri değiştir)

# 3. Tüm servisleri başlat
make

# veya adım adım:
make ssl        # SSL sertifikası oluştur
make build      # Docker image'larını build et
make up         # Servisleri başlat
```

Tarayıcıdan `https://localhost` adresini aç.

### Komutlar

| Komut | Açıklama |
|-------|----------|
| `make` | SSL + build + start |
| `make up` | Servisleri başlat |
| `make down` | Servisleri durdur |
| `make restart` | Yeniden başlat |
| `make logs` | Tüm logları görüntüle |
| `make logs-<servis>` | Tek servis logu (ör: `make logs-auth_service`) |
| `make clean` | Container, volume, image hepsini sil |
| `make status` | Container durumlarını göster |
| `make migrate-auth` | Auth DB migration |
| `make migrate-chat` | Chat DB migration |

---

## Proje Yapısı

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
│   └── requirements.txt
├── game_service/         # Node.js - Game Engine
│   ├── Dockerfile
│   ├── server.js
│   └── package.json
├── chat_service/         # Django Channels - Chat
│   ├── Dockerfile
│   ├── chat_project/     # Django settings
│   ├── chat_app/         # App logic
│   └── requirements.txt
├── ai_service/           # FastAPI - AI Moderation
│   ├── Dockerfile
│   └── app/main.py
├── docs/                 # Proje dökümanları
├── ssl/                  # SSL sertifikaları (gitignore)
├── docker-compose.yml
├── Makefile
├── env.example
├── generate_ssl.sh
└── todo.md               # Yapılacaklar listesi
```

---

## Geliştirme Yol Haritası

### Adım 1: Altyapı
- [x] Docker Compose ile tüm servisleri ayağa kaldır
- [x] Nginx gateway (SSL, routing, WebSocket)
- [x] PostgreSQL veritabanları (user, stats, chat)
- [x] Redis broker

### Adım 2: Kullanıcı Yönetimi
- [ ] User modeli ve DB schema
- [ ] JWT authentication (login, register, refresh)
- [ ] 42 OAuth entegrasyonu
- [ ] Profil ve avatar yönetimi

### Adım 3: Oyun Çekirdeği
- [ ] Socket.io ile client-server iletişimi
- [ ] 60 FPS server-side game loop
- [ ] Fizik motoru (top, oyuncu, çarpışma)
- [ ] Client tarafında Canvas render

### Adım 4: Oda ve Eşleşme
- [ ] Room ID ile oda oluşturma/katılma
- [ ] Harita seçimi

### Adım 5: Chat ve Sosyal
- [ ] WebSocket ile gerçek zamanlı sohbet
- [ ] DM, kanal sistemi
- [ ] AI mesaj moderasyonu

### Adım 6: İstatistikler
- [ ] Maç geçmişi kaydetme
- [ ] Skor tablosu
- [ ] Achievements

### Adım 7: Cila
- [ ] Avatar AI kontrolü
- [ ] UI/UX iyileştirmeleri
- [ ] Son testler
