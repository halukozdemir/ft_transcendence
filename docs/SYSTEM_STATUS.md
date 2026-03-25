# Proje Sistem Durumu ve Mimari Analiz (25 Mart 2026)

Bu doküman, son yapılan değişiklikler, veritabanı entegrasyonları ve sistemin mevcut durumu hakkında teknik detayları içerir.

## 1. Genel Mimari Yapı
Proje, Docker üzerinde koşan mikroservis mimarisine sahiptir:
- **Gateway (Nginx):** Tüm istekleri karşılayan ve ilgili servise yönlendiren ana giriş kapısı.
- **Auth Service (Django):** Kullanıcı yönetimi, JWT üretimi ve ana veritabanı şemasının (migrations) sahibi.
- **Game Service (Node.js/Socket.io):** Gerçek zamanlı oyun mantığı ve çoklu oda (multi-room) yönetimi.
- **Chat Service (Django/Daphne):** WebSocket tabanlı gerçek zamanlı mesajlaşma.
- **PostgreSQL:** Tüm servislerin verilerini barındıran tekil veritabanı instance'ı.

## 2. Kimlik Doğrulama (JWT) Mekanizması
- **JWT_SECRET_KEY:** `auth_service` tarafından token imzalamak, `game_service` tarafından ise bu token'ları doğrulamak için kullanılır.
- **Eşleşme Sorunu Giderildi:** Servisler arasındaki gizli anahtar uyumsuzluğu düzeltildi, böylece oyun servisi artık kullanıcıları doğru şekilde tanıyabiliyor.

## 3. Veritabanı ve Tablo Yapısı
Sistemde veritabanı tabloları iki farklı yöntemle yönetilmektedir:

### A. Django Migrations (Kullanılan & Önerilen)
`auth_service` altındaki modeller aracılığıyla yönetilir. Şu tabloları içerir:
- `User`: Kullanıcı profili, ELO puanı, tier bilgisi.
- `PlayerStats`: Toplam maç, galibiyet/mağlubiyet sayıları.
- `MatchRecord`: Detaylı maç geçmişi ve skorlar.
- `FriendRequest`: Arkadaşlık sistemi.

### B. init.sql (Manuel & Yedekli)
Postgres konteyneri ilk açıldığında çalışan manuel SQL komutlarıdır. 
- **Tespit:** `init.sql` içindeki `matches` ve `achievements` tabloları ile Django'nun oluşturduğu `MatchRecord` ve `Achievement` tabloları arasında **çakışma/yedeklilik** vardır.
- **Karar:** Veri bütünlüğü için Django tarafından yönetilen tabloların (A grubu) kullanılması önerilir.

## 4. Servis Bağlantı Durumları
| Servis | DB Bağlantısı | Durum |
| :--- | :--- | :--- |
| **Auth Service** | Aktif (Django ORM) | Tamamlandı. Migrations otomatik çalışıyor. |
| **Chat Service** | Aktif (Django ORM) | Tamamlandı. `init.sql` tabloları ile entegre. |
| **Game Service** | **Eksik (RAM'de tutuluyor)** | Maç sonuçları henüz DB'ye yazılmıyor. `// TODO` aşamasında. |

## 5. Tespit Edilen Eksikler ve Yapılacaklar
1. **Game Service DB Entegrasyonu:** Oyun bittiğinde sonuçların `auth_app_matchrecord` tablosuna yazılması sağlanmalı.
2. **Liderlik Tablosu (Leaderboard):** `game_service` üzerindeki `/api/game/leaderboard/` endpoint'i veritabanından veri çekecek şekilde güncellenmeli.
3. **Tablo Temizliği:** `init.sql` içindeki mükerrer tablo tanımları (`matches`, `achievements`) kaldırılarak Django modelleriyle konsolide edilmeli.
4. **Untracked Dosyalar:** `frontend` tarafındaki yeni eklenen `Privacy` ve `Terms` sayfaları git'e dahil edilmeli.

---
*Bu doküman sistem üzerinde yapılan incelemeler sonucunda oluşturulmuştur.*
