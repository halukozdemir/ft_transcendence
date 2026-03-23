# Haluk'un Son Push'undan (origin/main) Bu Yana Yapılan Değişiklikler

**Base commit:** `db0ff70` — feat: add OAuth 42 login integration with token exchange and auto-registration

---

## 1. Veritabanı Mimarisi: 3 Container → 1 Container

### Önceki durum (Haluk'un versiyonu)
- `db_user` (PostgreSQL) — Auth servisi için
- `db_chat` (PostgreSQL) — Chat servisi için
- `db_stats` (PostgreSQL) — Game servisi için
- Her biri ayrı credentials, ayrı volume, ayrı healthcheck

### Şimdiki durum
- Tek `postgres` container (`ft_postgres`)
- Tek `postgres_data` volume
- Tüm servisler aynı DB'ye (`ft_transcendence`) bağlanıyor
- `init.sql` ile game ve chat tabloları otomatik oluşturuluyor

### Değişen dosyalar
- **`docker-compose.yml`** — `db_user`, `db_chat`, `db_stats` servisleri kaldırıldı, tek `postgres` servisi eklendi
- **`docker-compose.yml`** — `db_user_data`, `db_chat_data`, `db_stats_data` volume'ları kaldırıldı → tek `postgres_data`
- **`docker-compose.yml`** — `auth_service` ve `chat_service` depends_on `postgres`'a güncellendi

---

## 2. Environment Variables Sadeleştirildi

### Önceki durum
```env
# Her servis için ayrı değişkenler
POSTGRES_USER_DB, POSTGRES_USER_USER, POSTGRES_USER_PASSWORD, POSTGRES_USER_HOST, POSTGRES_USER_PORT
POSTGRES_CHAT_DB, POSTGRES_CHAT_USER, POSTGRES_CHAT_PASSWORD, POSTGRES_CHAT_HOST, POSTGRES_CHAT_PORT
POSTGRES_STATS_DB, POSTGRES_STATS_USER, POSTGRES_STATS_PASSWORD, POSTGRES_STATS_HOST, POSTGRES_STATS_PORT
```

### Şimdiki durum
```env
# Tek set
POSTGRES_DB=ft_transcendence
POSTGRES_USER=ft_user
POSTGRES_PASSWORD=devpassword
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
```

### Değişen dosyalar
- **`.env`** — 15 ayrı DB değişkeni → 5 ortak değişken
- **`env.example`** — aynı sadeleştirme uygulandı

---

## 3. Auth Service — Servis Bağlantı Ayarları Güncellendi

### Değişen dosyalar

- **`auth_service/auth_project/settings.py`** (satır 59-67)
  - `POSTGRES_USER_DB` → `POSTGRES_DB`
  - `POSTGRES_USER_USER` → `POSTGRES_USER`
  - `POSTGRES_USER_PASSWORD` → `POSTGRES_PASSWORD`
  - `POSTGRES_USER_HOST` → `POSTGRES_HOST`
  - `POSTGRES_USER_PORT` → `POSTGRES_PORT`

- **`auth_service/entrypoint.sh`**
  - Aynı env değişken güncellemeleri
  - **Yeni eklenen:** `makemigrations auth_app --noinput` komutu (migrate'den önce çalışır)

---

## 4. Auth Service — Duplicate Model Düzeltmesi

### Sorun
`auth_service/auth_app/models.py` dosyasında `User` class'ı **iki kere** tanımlanmıştı:
1. Orijinal versiyon (satır 4-23) — `intra_id` yok
2. Haluk'un versiyonu (satır 25-49) — `intra_id` var

Bu durum Django'nun çökmesine neden oluyordu (`SystemCheckError`).

### Çözüm
İki class birleştirildi → tek `User` class, `intra_id` dahil:
```python
class User(AbstractUser):
    email          = EmailField(unique=True)
    avatar         = ImageField(...)
    online_status  = BooleanField(default=False)
    intra_id       = IntegerField(unique=True, null=True, blank=True)  # Haluk'un eklediği
    friends        = ManyToManyField('self', ...)
```

---

## 5. Chat Service — Servis Bağlantı Ayarları Güncellendi

### Değişen dosyalar

- **`chat_service/chat_project/settings.py`** (satır 57-66)
  - `POSTGRES_CHAT_*` → `POSTGRES_*`

- **`chat_service/entrypoint.sh`**
  - Aynı env değişken güncellemeleri

---

## 6. Game Service — Network Optimizasyonu

### Değişen dosya: `game_service/server.js`

- Physics loop: 60 FPS (değişmedi)
- **Network broadcast: 60 FPS → 30 FPS** (her 2 tick'te bir `io.emit`)
- Gereksiz network trafiği yarıya düşürüldü

```javascript
// Önceki: her tick'te emit
setInterval(() => {
  room.update();
  io.emit("state", room.getState());
}, 1000 / 60);

// Şimdiki: physics 60 FPS, emit 30 FPS
setInterval(() => {
  room.update();
  tick++;
  if (tick % 2 === 0) {
    io.emit("state", room.getState());
  }
}, 1000 / 60);
```

---

## 7. Yeni Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `database/init.sql` | Game ve Chat servislerinin tablo şemaları (matches, achievements, channels, messages, channel_members) |
| `auth_service/auth_app/migrations/__init__.py` | Django migrations paketi (migrations container içinde dinamik oluşturuluyor) |

---

## Özet Tablo

| Dosya | Değişiklik Tipi |
|-------|----------------|
| `docker-compose.yml` | 3 DB → 1 DB, volume ve depends_on güncellemesi |
| `.env` | 15 değişken → 5 değişken |
| `env.example` | Aynı sadeleştirme |
| `auth_service/auth_app/models.py` | Duplicate User class birleştirildi |
| `auth_service/auth_project/settings.py` | DB env key'leri güncellendi |
| `auth_service/entrypoint.sh` | DB env key'leri + makemigrations eklendi |
| `chat_service/chat_project/settings.py` | DB env key'leri güncellendi |
| `chat_service/entrypoint.sh` | DB env key'leri güncellendi |
| `game_service/server.js` | Network emit 60→30 FPS |
| `database/init.sql` | **Yeni** — tablo şemaları |
| `auth_service/auth_app/migrations/__init__.py` | **Yeni** — migrations paketi |
