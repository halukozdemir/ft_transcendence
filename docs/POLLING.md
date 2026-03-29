# Real-Time Polling System

## Genel Bakis

Projede kullanici durumu (online/offline), arkadas listesi ve profil bilgileri **polling** mekanizmasiyla gercek zamanli guncellenir. Sayfa yenilemesine gerek kalmadan veriler otomatik olarak guncel tutulur.

## Neden Polling?

WebSocket tabanli presence sistemi yerine polling tercih edilmesinin nedenleri:

- **Basitlik**: Mevcut REST API altyapisi uzerinde calisir, ekstra WebSocket baglantisi gerektirmez
- **Guvenilirlik**: HTTP istekleri basarisiz olsa bile sonraki interval'de tekrar dener
- **Olceklenebilirlik**: Her istek bagimsiz, state yonetimi yok
- **Servis bagimsizligi**: Auth service'e bagimli, chat/game servislerinden bagimsiz calisir

## Mimari

```
Frontend (React)
    |
    |-- authContext.tsx
    |       |-- Heartbeat (POST /api/auth/presence/)     --> her 3sn
    |       |-- Profile refresh (GET /api/auth/profile/)  --> her 10sn
    |
    |-- Friends/index.tsx
    |       |-- Kullanici listesi (GET /api/auth/users/)  --> her 5sn
    |
    |-- Profile/index.tsx
            |-- Profil + stats (GET /api/auth/users/:id/) --> her 5sn

Backend (Django)
    |
    |-- PresenceView (POST /api/auth/presence/)
    |       |-- last_seen = now()
    |       |-- online_status = True
    |
    |-- Serializers (UserSerializer, ProfileSerializer)
            |-- online_status = (now - last_seen) < PRESENCE_TIMEOUT
```

## Polling Katmanlari

| Katman | Endpoint | Interval | Amac |
|--------|----------|----------|------|
| **Heartbeat** | `POST /presence/` | 3 saniye | Kullanicinin sayfa acik oldugunu bildirmek |
| **Profile Refresh** | `GET /profile/` | 10 saniye | Arkadas listesi, kendi durumu guncellemek |
| **Friends Page** | `GET /users/` | 5 saniye | Kullanici listesindeki online durumlarini guncellemek |
| **Profile Page** | `GET /users/:id/` | 5 saniye | Goruntulenen profilin online durumunu guncellemek |

## Online/Offline Mekanizmasi

### Online Olma
1. Kullanici giris yapar -> `LoginView` `online_status=True` yapar
2. Frontend yuklenir -> `authContext` mount olur -> ilk heartbeat atilir
3. Her 3 saniyede `POST /presence/` -> `last_seen` guncellenir

### Offline Olma
1. Kullanici sekmeyi kapatir -> `setInterval` durur -> heartbeat kesilir
2. `PRESENCE_TIMEOUT` (5 saniye) icerisinde yeni heartbeat gelmez
3. Sonraki sorguda serializer `(now - last_seen) > 5sn` kontrol eder -> `online_status: false` doner

### Neden `beforeunload` Degil?
`beforeunload` event'inde yapilan HTTP istekleri guvenilir degildir:
- Tarayici istegi tamamlamadan sayfayi kapatabilir
- `fetch` + `keepalive` her tarayicide ayni davranmaz
- `navigator.sendBeacon` JWT header gonderemez

Heartbeat tabanlı yaklasim daha guvenilirdir: ping gelmezse timeout, ekstra istek gerekmez.

## Timeout Hesabi

```
Heartbeat Interval:   3 saniye
Presence Timeout:     5 saniye
```

- Kullanici aktifken: her 3sn'de `last_seen` guncellenir
- Sekme kapaninca: son heartbeat'ten 5sn sonra offline sayilir
- En kotu senaryo: kullanici kapattiktan **5 saniye** sonra offline gorunur

## Rate Limiting ile Uyum

```
Anon Rate:  30/dakika
User Rate: 100/dakika
```

Tek kullanicinin polling yukleri (en kotu senaryo, tum sayfalar acik):

| Istek | Interval | Dakikada |
|-------|----------|----------|
| Heartbeat | 3sn | 20 |
| Profile refresh | 10sn | 6 |
| Friends page poll | 5sn | 12 |
| Profile page poll | 5sn | 12 |
| **Toplam** | | **~50/dakika** |

100/dakika limitinin altinda. Guvenli.

## Performans Notlari

- Polling istekleri **loading spinner gostermez** — arka planda sessizce calisir (`showLoading = false`)
- Component unmount oldugunda `clearInterval` ile temizlenir — gereksiz istek atilmaz
- Friends ve Profile sayfalarina gidilmedikce o katmanlar calismaz
- Heartbeat ve profile refresh yalnizca authenticated kullanici varsa baslar

## Dosya Referanslari

| Dosya | Sorumluluk |
|-------|------------|
| `frontend/src/context/authContext.tsx` | Heartbeat + profile refresh |
| `frontend/src/pages/Friends/index.tsx` | Friends sayfasi polling |
| `frontend/src/pages/Profile/index.tsx` | Profil sayfasi polling |
| `auth_service/auth_app/views.py` | `PresenceView` endpoint |
| `auth_service/auth_app/serializers.py` | `PRESENCE_TIMEOUT` + computed `online_status` |
| `auth_service/auth_app/models.py` | `last_seen` field |
