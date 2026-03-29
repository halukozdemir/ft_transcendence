# ft_transcendence - Yapilacaklar Listesi

> Son guncelleme: 2026-03-17

---

## ADIM 1: Altyapi (Infrastructure) - furkan
- [x] Docker Compose ile tum servisleri tanimla
- [x] Nginx Gateway (SSL, reverse proxy, WebSocket routing)
- [x] PostgreSQL veritabanlari (db_user, db_stats, db_chat)
- [x] Redis broker
- [x] SSL sertifika scripti (generate_ssl.sh)
- [x] Makefile komutlari
- [x] Chat Service container & Django scaffolding
- [x] Game Service: Django -> Node.js donusumu
- [x] Game-demo kodlarini game_service'e entegre et
- [x] Frontend'e oyun client'i ekle (Socket.io + Canvas)
- [ ] `docker-compose up --build` ile tum servislerin hatasiz kalkmasi
- [ ] Frontend branch merge sonrasi Vite Dockerfile guncellemesi
- [ ] game-demo branch'indeki node_modules temizligi

## ADIM 2: Kullanici Yonetimi (Auth Service - Django)
- [ ] User modeli (username, email, avatar, online_status)
- [ ] Register endpoint (POST /api/auth/register/)
- [ ] Login endpoint (POST /api/auth/login/) - JWT token
- [ ] Token refresh (POST /api/auth/token/refresh/)
- [ ] Profil goruntuleme/guncelleme (GET/PUT /api/auth/profile/)
- [ ] Avatar yukleme (POST /api/auth/profile/avatar/)
- [ ] Frontend: Login & Register sayfalari
- [ ] Frontend: Profil sayfasi

## ADIM 3: Oyun Cekirdegi (Game Service - Node.js)
- [x] Socket.io altyapisi
- [x] 60 FPS server-side game loop
- [x] Fizik motoru (Ball, Player, physics)
- [x] Client-side Canvas render
- [ ] JWT token ile oyuncu dogrulama
- [ ] Oyuncu isimleri gosterimi
- [ ] Gol sonrasi skor kaydetme (db_stats)
- [ ] Mac bitis kosulu ve sonuc kaydi

## ADIM 4: Oda ve Eslestirme
- [ ] Room ID ile oda olusturma/katilma
- [ ] Oda listesi API
- [ ] Harita secimi
- [ ] Frontend: Lobi sayfasi

## ADIM 5: Chat ve Sosyal (Chat Service - Django Channels)
- [ ] WebSocket sohbet
- [ ] DM destegi
- [ ] Arkadaslik ve engelleme sistemi
- [ ] AI mesaj moderasyonu
- [ ] Frontend: Chat paneli

## ADIM 6: Istatistikler ve Basarimlar
- [ ] MatchHistory modeli (db_stats)
- [ ] Skor tablosu ve mac gecmisi API
- [ ] Achievements sistemi
- [ ] Frontend: Istatistik sayfasi

## ADIM 7: Cila (Polish)
- [ ] Avatar AI kontrolu
- [ ] UI/UX iyilestirmeleri
- [ ] Responsive tasarim
- [ ] Production build & test
