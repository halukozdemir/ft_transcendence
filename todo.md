# ft_transcendence - Yapılacaklar Listesi

## Altyapı & DevOps (furkan)
- [x] Docker Compose: Tüm servisler tanımlı
- [x] Gateway (Nginx): Reverse proxy, SSL, WebSocket desteği
- [x] SSL sertifikası oluşturma scripti
- [x] Makefile komutları
- [x] .env dosyasını git'ten kaldır (güvenlik)
- [x] Chat Service container'ını docker-compose'a ekle
- [x] Frontend Dockerfile'ı Vite için güncelle
- [x] Game Service'i Node.js (Express + Socket.io) ortamına çevir
- [ ] CI/CD pipeline (GitHub Actions) - ileride değerlendirilecek
- [ ] game-demo branch'indeki node_modules temizliği

## Auth Service (Backend - Django)
- [ ] User modeli oluştur (username, email, avatar, online_status vb.)
- [ ] Register endpoint (POST /api/auth/register)
- [ ] Login endpoint (POST /api/auth/login) - JWT token döndür
- [ ] Token refresh endpoint
- [ ] 42 OAuth entegrasyonu
- [ ] Profil görüntüleme / güncelleme endpoint'leri
- [ ] Avatar yükleme endpoint'i
- [ ] Arkadaş ekleme / engelleme sistemi

## Game Service (Backend - Node.js + Socket.io)
- [ ] game-demo kodlarını game_service'e entegre et
- [ ] 60 FPS server-side game loop
- [ ] Fizik motoru (çarpışma, top hareketi, duvar sekmeleri)
- [ ] Oda oluşturma / katılma sistemi (Room ID)
- [ ] Harita seçimi (JSON config)
- [ ] Maç sonu skor kaydetme (db_stats)
- [ ] Oyuncu input yönetimi (WASD)
- [ ] Gol / kazanan belirleme mantığı

## Chat & Social Service (Backend - Django)
- [ ] Mesaj modeli oluştur
- [ ] Kanal/oda modeli
- [ ] WebSocket ile gerçek zamanlı mesajlaşma
- [ ] DM (direkt mesaj) desteği
- [ ] AI content moderation entegrasyonu
- [ ] Arkadaşlık isteği sistemi (auth service ile iletişim)

## AI Service (FastAPI)
- [ ] POST /analyze/text - mesaj moderasyonu
- [ ] POST /analyze/image - avatar güvenlik kontrolü
- [ ] ML model entegrasyonu veya harici API bağlantısı

## Frontend (React + Vite + TypeScript + Tailwind)
- [ ] Router yapısı (react-router-dom)
- [ ] Login / Register sayfaları
- [ ] Profil sayfası
- [ ] Oyun lobisi (oda listesi, oda oluşturma)
- [ ] Oyun ekranı (Canvas render)
- [ ] Chat arayüzü
- [ ] Skor tablosu / istatistikler sayfası
- [ ] Responsive tasarım

## Son Aşama (Cila)
- [ ] Hata yönetimi ve loading ekranları
- [ ] Achievements sistemi
- [ ] Deployment testi (docker-compose up --build)
- [ ] Tüm servisler arası entegrasyon testi
