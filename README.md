# ft_transcendence: Teknik Tasarım ve Yol Haritası (GDD & TDD)

**Proje:** Haxball Klonu (Web-Based Multiplayer Game)
**Mimari:** Microservices
**İletişim:** HTTP/REST (Servisler arası) + WebSocket (Client-Server arası)

Bu döküman, zaman çizelgesinden bağımsız olarak, mantıksal "yapılması gerekenler" sırasını takip eder.

---

## BÖLÜM 1: MİMARİ TASARIM (The Skeleton)

Projeyi 4 ana servise (Docker container) böleceğiz. Bu modüler yapı hem puan kazandırır hem de iş bölümünü kolaylaştırır.

### 1. API Gateway (Nginx)
* **Görevi:** Tüm trafiğin kapısıdır. Dış dünyadan gelen istekleri karşılar ve ilgili servise yönlendirir (Reverse Proxy).
* **Yönlendirmeler:**
    * `/api/auth` -> Auth Service
    * `/api/game` -> Game Service
    * `/socket.io` -> Game Service (WebSocket Upgrade)
    * `/` -> Frontend (Statik dosyaların sunulması)

### 2. Auth & User Service (Backend - Express)
* **Görevi:** Kayıt, Giriş, OAuth (42/Google), Profil Yönetimi, Avatar Yükleme.
* **AI Modülü:** Kullanıcı avatar yüklediğinde, görseli **Image Recognition API**'ye (örn. Clarifai veya Python microservice) gönderir. "Bu resim güvenli mi?" onayı alırsa kaydeder.
* **Veritabanı:** `db_user` (Users, Friends, Blocked_Users tabloları).

### 3. Game Service (Backend - Express + WebSocket)
* **Görevi:** Haxball oyun motoru burada çalışır.
* **Fizik:** Basit 2D çember çarpışma mantığı (Collision Detection) sunucuda hesaplanır (Server-Side Physics).
* **Oda Yönetimi:** Oyun kurma, odaya katılma, map seçimi.
* **Veritabanı:** `db_stats` (MatchHistory, Achievements tabloları).

### 4. Chat & Social Service (Backend - Express)
* **Görevi:** Genel sohbet, DM, arkadaşlık istekleri.
* **AI Modülü:** Mesaj geldiğinde **Content Moderation AI** ile tarar. Küfür/Hakaret varsa sansürler veya engeller.
* **Veritabanı:** `db_chat` (Messages, Channels tabloları).

---

## BÖLÜM 2: GÖREV ADIMLARI (Step-by-Step Implementation)

Görevleri bu sırayla yapmanız, "önce temel, sonra süsleme" mantığıyla ilerlemenizi sağlar.

### ADIM 1: Altyapı ve "Hello World" (Infrastructure)
* [ ] **Docker Compose:** 4 servisi (Gateway, Auth, Game, Chat) ve PostgreSQL veritabanını ayağa kaldıran `docker-compose.yml` dosyasını yazın.
* [ ] **Frontend:** Svelte projesini oluşturun ve Tailwind CSS'i kurun.
* **Hedef:** `docker-compose up` dediğinizde tüm servisler hatasız kalkmalı ve tarayıcıda "Merhaba Dünya" görülmeli.

### ADIM 2: Kullanıcı Yönetimi (The Key)
* [ ] **Postgres:** `Users` tablosunu oluşturun.
* [ ] **Auth:** JWT (JSON Web Token) yapısını kurun. Giriş yapana Token verin.
* [ ] **OAuth:** 42 API veya Google girişini entegre edin.
* [ ] **Frontend:** Login ve Profil sayfalarını tasarlayın.

### ADIM 3: OYUN ÇEKİRDEĞİ (The Hardest Part)
*Bu adım projenin kalbidir.*
* [ ] **WebSocket:** Socket.io kullanarak sunucu ve istemci iletişimini kurun.
* [ ] **Server-Side Loop:** Sunucuda saniyede 60 kez (60 FPS) çalışan bir döngü kurun.
    * *Input:* Oyuncuların bastığı tuşları (WASD) al.
    * *Physics:* Yeni konumları hesapla (x = x + hız). Top duvara veya oyuncuya çarptı mı kontrol et.
    * *Broadcast:* Yeni koordinatları tüm oyunculara gönder (`socket.emit`).
* [ ] **Client-Side:** Svelte tarafında sunucudan gelen koordinatları sadece ekrana çizin (**Input Delay** yöntemi).

### ADIM 4: Oyun Odaları ve Eşleşme
* [ ] **Room Logic:** "Oyun Kur" dendiğinde benzersiz bir Room ID üretin.
* [ ] **Join:** Başka kullanıcıların ID ile odaya katılmasını sağlayın.
* [ ] **Map Seçimi:** Oyun kurarken 3-4 hazır JSON harita config'i arasından seçim yaptırın.

### ADIM 5: Chat ve Sosyal Özellikler
* [ ] **Chat Service:** Ayrı bir servis olarak yazın.
* [ ] **Auth:** Token doğrulayarak kimin konuştuğunu belirleyin.
* [ ] **AI Mod:** Mesajları iletmeden önce AI servisine sorup onay alın.

### ADIM 6: İstatistikler ve Achievements
* [ ] **Game End:** Oyun bitince kazananı belirleyip `db_stats`'a yazın.
* [ ] **Achievements:** Maç sonu tetikleyicileri ile (örn: "Gol Yemeden Kazan") başarımları verin.

### ADIM 7: Cila (Polish)
* [ ] **Image Rec:** Avatar yükleme endpoint'ine AI kontrolü ekleyin.
* [ ] **UI/UX:** Hataları giderin, yükleme ekranları ekleyin.

---

## Sıkça Sorulacak Sorular (SSS)

**S: Fizik Motoru Zorlar mı?**
C: Matter.js gibi kütüphaneler kullanılabilir ama Haxball sadece dairelerden ibaret olduğu için kendi çarpışma fonksiyonunuzu (`checkCollision(circleA, circleB)`) yazmak hem daha performanslı hem de daha öğreticidir.

**S: Lag Sorunu (Remote Players)?**
C: İlk etapta **Input Delay** yöntemini kullanın. Client sadece sunucudan gelen emri uygular, tahmin yapmaz. Yerel ağda ve düşük pingli ortamlarda bu yöntem sorunsuzdur ve kodlaması çok daha basittir.

**S: Deploy?**
C: Her şey Docker içinde olduğu için `docker-compose up --build` komutu projenin her bilgisayarda aynı şekilde çalışmasını garanti eder.
