*This project has been created as part of the 42 curriculum by halozdem, fkuyumcu, emyildir, ayasar, aakyuz.*

# ft_transcendence

## Description

**ft_transcendence** is a real-time multiplayer web application built as the final project of the 42 school curriculum. The project is a Haxball-inspired browser-based soccer game where players can compete against each other in real-time from separate computers.

### Key Features

- Real-time multiplayer gameplay powered by WebSockets (Socket.io)
- 60 FPS server-side physics simulation with 30 FPS network broadcast
- Configurable team sizes supporting 1v1 up to 3v3+ matches
- Full user management: registration, login, profiles, avatars, and friends
- In-game chat with AI-powered content moderation (text & image)
- Player statistics, match history, achievements, and global leaderboard
- Microservices architecture with 5 independent backend services
- Nginx reverse proxy with SSL/TLS, CORS, and rate limiting

---

## Instructions

### Prerequisites

The following software must be installed before running the project:

| Tool           | Minimum Version | Purpose                       |
|----------------|-----------------|-------------------------------|
| Docker         | 24.x            | Container runtime             |
| Docker Compose | 2.x             | Multi-container orchestration |
| Make           | 4.x             | Build automation              |
| OpenSSL        | 3.x             | SSL certificate generation    |

> **Note:** The project is fully containerized. No Python, Node.js, or database installations are required on the host machine.

### Environment Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd ft_transcendence

# 2. Create environment file from template
cp .env.example .env
```

Edit `.env` and configure the following variables:

| Variable                              | Description                   | Default             |
|---------------------------------------|-------------------------------|---------------------|
| `DOMAIN`                              | Site domain                   | `localhost`         |
| `DJANGO_SECRET_KEY`                   | Django secret key             |                     |
| `DEBUG`                               | Debug mode (1=on, 0=off)      | `1`                 |
| `POSTGRES_DB`                         | Database name                 | `ft_transcendence`  |
| `POSTGRES_USER`                       | Database user                 |                     |
| `POSTGRES_PASSWORD`                   | Database password             |                     |
| `POSTGRES_HOST`                       | Database host                 | `postgres`          |
| `POSTGRES_PORT`                       | Database port                 | `5432`              |
| `REDIS_HOST`                          | Redis host                    | `redis_broker`      |
| `REDIS_PORT`                          | Redis port                    | `6379`              |
| `REDIS_PASSWORD`                      | Redis password                |                     |
| `JWT_SECRET_KEY`                      | JWT signing key               |                     |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES`   | Access token lifetime (min)   | `60`                |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS`     | Refresh token lifetime (days) | `7`                 |

> **Security:** Never commit your `.env` file. Fill in all empty fields before running the project.

### Running the Project

```bash
# Build SSL certificates, build images, and start all services
make

# Open the application in your browser
# https://localhost
```

> Accept the self-signed certificate warning in your browser for local development.

### Useful Commands

| Command                        | Description                                    |
|--------------------------------|------------------------------------------------|
| `make`                         | SSL setup + build + start all services         |
| `make up`                      | Start all services                             |
| `make down`                    | Stop all services                              |
| `make restart`                 | Restart all services                           |
| `make status`                  | Show container status                          |
| `make logs`                    | View logs for all services                     |
| `make logs-auth_service`       | View logs for a specific service               |
| `make migrate-auth`            | Run auth service database migrations           |
| `make migrate-chat`            | Run chat service database migrations           |
| `make test`                    | Run all auth service tests                     |
| `make test-auth T=test_login`  | Run a specific test file                       |
| `make superuser`               | Create a Django admin superuser                |
| `make clean`                   | Remove all containers, volumes, and images     |

---

## Resources

### Documentation & References

| Resource                  | URL                                                      | Purpose                                         |
|---------------------------|----------------------------------------------------------|-------------------------------------------------|
| Docker Documentation      | https://docs.docker.com/                                 | Containerization and Docker Compose             |
| Django Documentation      | https://docs.djangoproject.com/en/6.0/                   | Backend framework (auth & chat services)        |
| Django ORM Queries        | https://docs.djangoproject.com/en/6.0/topics/db/queries/ | Database query construction                     |
| React Documentation       | https://tr.legacy.reactjs.org/docs/getting-started.html  | Frontend SPA framework                          |
| JavaScript Reference      | https://devdocs.io/javascript/                           | JavaScript language reference                   |
| WebSockets Documentation  | https://websockets.readthedocs.io/en/stable/             | WebSocket protocol reference                    |
| Haxball                   | https://www.haxball.com                                  | Game design inspiration and mechanics reference |

### AI Usage

**Claude (Anthropic)** was used as an AI assistant throughout the development of this project. Specifically, AI assistance was used for:

- **Documentation:** Writing and structuring this README
- **Bug fixing:** Consulting on bugs encountered during development (game physics, WebSocket handling, API logic)
- **Technical consultations:** Discussing architectural decisions, microservices design, and performance trade-offs

---

## Team Information

| Login         | Role            | Responsibilities                                                             |
|---------------|-----------------|------------------------------------------------------------------------------|
| **halozdem**  | Product Owner   | Auth system (JWT, register, login, logout), database schema                    |
| **fkuyumcu**  | Tech Lead       | Docker/DevOps, Nginx gateway, SSL, microservices infrastructure, Ai content moderation |
| **ayasar**    | Project Manager | Sprint planning (Notion), React frontend pages, UI components (Tailwind CSS) |
| **aakyuz**    | Developer       | Profile management, chat backend (Channels), game mechanics                  |
| **emyildir**  | Developer       | API integration (frontend services), game rendering, UI improvements         |

---

## Project Management

### Organization

The team used **Notion** as the primary project management tool. Work was organized into weekly sprints with clearly defined tasks for each team member. A Kanban board tracked task status (To Do → In Progress → Done) across all sprints.

### Meetings

- **Weekly sync:** Every Monday evening via **Google Meet**
- **Day-to-day communication:** **WhatsApp** group for quick decisions and blockers

### Workflow

1. Tasks were created and assigned in Notion at the start of each sprint
2. Progress was reviewed at the Monday meeting
3. Blockers were discussed synchronously on Google Meet or asynchronously on WhatsApp
4. Code was integrated via Git pull requests with peer review

---

## Technical Stack

### Frontend

| Technology       | Version | Purpose                      |
|------------------|---------|------------------------------|
| React            | 19.2.0  | SPA framework                |
| TypeScript       | 5.9.3   | Type-safe JavaScript         |
| Vite             | 7.3.x   | Build tool and dev server    |
| Tailwind CSS     | 4.2.0   | Utility-first CSS framework  |
| React Router     | v7      | Client-side routing          |
| Socket.io Client | 4.7.4   | Real-time game communication |
| React Icons      | 5.6.0   | Icon library                 |

### Backend Services

| Service       | Framework                      | Version          | Role                                                |
|---------------|--------------------------------|------------------|-----------------------------------------------------|
| Auth Service  | Django + DRF + Gunicorn        | 5.0 + 3.14       | User authentication, profiles, friends, leaderboard |
| Game Service  | Node.js + Express + Socket.io  | 20 + 4.18 + 4.7  | Real-time game engine, physics simulation           |
| Chat Service  | Django Channels + Daphne       | 5.0 + 4.0        | WebSocket-based real-time chat                      |
| AI Service    | FastAPI + Uvicorn              | 0.109 + 0.27     | Content moderation (text & image)                   |
| Gateway       | Nginx                          | 1.25             | Reverse proxy, SSL termination, request routing     |

### Infrastructure

| Technology     | Version | Purpose                                              |
|----------------|---------|------------------------------------------------------|
| Docker         | 24.x    | Service containerization                             |
| Docker Compose | 2.x     | Multi-service orchestration                          |
| PostgreSQL     | 16      | Primary relational database (shared by all services) |
| Redis          | 7       | WebSocket channel layer broker for Django Channels   |

### Technical Decisions

- **Single PostgreSQL instance:** All services share one database to simplify infrastructure while keeping schema separation via Django's app-level migrations.
- **Redis as broker:** Django Channels requires a channel layer backend for WebSocket state; Redis 7 provides low-latency pub/sub.
- **Nginx as gateway:** All external traffic enters through Nginx, which enforces SSL, applies rate limiting (30 req/min anonymous, 100 req/min authenticated), and routes requests to the correct backend service.
- **JWT Authentication:** Stateless token-based auth allows the game service and chat service to validate users without calling the auth service on every request.
- **Microservices:** Each service has a single responsibility and can be scaled, restarted, or replaced independently.

---

## Database Schema

All tables are managed by Django ORM migrations. A single PostgreSQL instance (`ft_transcendence`) hosts schemas from both the auth and chat services.

### Auth Service Tables

```
auth_app_user
├── id (UUID, PK)
├── email (unique)
├── username (unique)
├── password_hash
├── avatar (image path)
├── banner (image path)
├── bio (text)
├── online_status (boolean)
├── last_seen (datetime)
├── friends (M2M → self)
└── blocked_users (M2M → self)

auth_app_playerstats
├── id (PK)
├── user (FK → auth_app_user, 1:1)
├── wins (int)
├── losses (int)
├── draws (int)
├── xp (int)
└── level = xp

auth_app_matchrecord
├── id (PK)
├── red_score (int)
├── blue_score (int)
├── duration (int, seconds)
├── end_reason (score_limit | time_limit | forfeit | disconnect)
└── created_at (datetime)

auth_app_matchplayer
├── id (PK)
├── match (FK → auth_app_matchrecord)
├── user (FK → auth_app_user)
└── team (red | blue)

auth_app_achievement
├── id (PK)
├── name (first_win | streak_5 | perfect_win | tournament_champion | unstoppable)
└── description (text)

auth_app_userachievement
├── id (PK)
├── user (FK → auth_app_user)
├── achievement (FK → auth_app_achievement)
└── unlocked_at (datetime)

auth_app_friendrequest
├── id (PK)
├── from_user (FK → auth_app_user)
├── to_user (FK → auth_app_user)
├── status (pending | accepted | rejected)
└── created_at (datetime)
```

### Chat Service Tables

```
chat_app_chatroom
├── id (PK)
├── name (unique)
├── room_type (dm | channel | tournament)
├── created_by (int, user ID)
└── created_at (datetime)

chat_app_chatmessage
├── id (PK)
├── room (FK → chat_app_chatroom)
├── sender_id (int, user ID cache)
├── content (text)
├── message_type (regular | system | notification)
├── is_flagged (boolean, AI moderation)
├── edited_at (datetime, nullable)
└── created_at (datetime)

chat_app_chatroommember
├── id (PK)
├── room (FK → chat_app_chatroom)
├── user_id (int)
├── is_admin (boolean)
├── is_muted (boolean)
└── joined_at (datetime)
```

### Relationships

- One `User` → One `PlayerStats` (1:1)
- One `User` → Many `MatchPlayer` → Many `MatchRecord` (M2M through `MatchPlayer`)
- One `User` → Many `UserAchievement` → Many `Achievement` (M2M through `UserAchievement`)
- One `ChatRoom` → Many `ChatMessage` (1:N)
- One `ChatRoom` → Many `ChatRoomMember` (1:N)

---

## Features List

| Feature               | Description                                               | Developed By      |
|-----------------------|-----------------------------------------------------------|-------------------|
| User Registration     | Email-based account creation with validation              | halozdem          |
| User Login / Logout   | JWT token issuance and blacklisting on logout             | halozdem          |
| Token Refresh         | Stateless JWT access/refresh token rotation               | halozdem          |
| User Profile          | View and edit username, bio, avatar, banner               | halozdem, aakyuz  |
| Avatar Upload         | Image upload with AI NSFW validation                      | aakyuz            |
| Password Change       | Secure password update with old password confirmation     | halozdem          |
| Account Deletion      | Full account removal with password confirmation           | halozdem          |
| Friend System         | Add, remove, and list friends; view online status         | aakyuz            |
| Public User Profiles  | View any user's stats, matches, and achievements          | aakyuz            |
| Player Statistics     | Wins, losses, draws, XP, level, win rate                  | aakyuz            |
| Match History         | Per-user match records with scores, opponents, and dates  | aakyuz            |
| Achievements          | Unlock badges (first win, streak, perfect win, etc.)      | aakyuz            |
| Global Leaderboard    | Players ranked by XP                                      | halozdem          |
| Real-time Game        | Haxball-inspired 2D soccer with physics simulation        | aakyuz, fkuyumcu  |
| Remote Multiplayer    | Two players on separate computers via Socket.io           | aakyuz            |
| Team Multiplayer      | Configurable team sizes (1v1 to 3v3+)                     | aakyuz            |
| Game Rooms            | Create and join game rooms with configurable settings     | aakyuz            |
| Game Physics          | Ball and player physics at 60 FPS server-side             | aakyuz            |
| Match Reporting       | Game service posts match results to auth service          | aakyuz            |
| Real-time Chat        | WebSocket-based room chat (DM, channels, tournament rooms)| aakyuz            |
| Chat Moderation       | AI text profanity detection (English + Turkish)           | fkuyumcu          |
| Image Moderation      | NSFW avatar detection via Vision Transformer model        | halozdem          |
| Microservices         | 5 independent backend services orchestrated via Docker    | fkuyumcu          |
| Nginx Gateway         | SSL termination, reverse proxy, rate limiting             | fkuyumcu          |
| Frontend SPA          | React single-page application with full routing           | ayasar, emyildir  |
| API Integration       | Frontend service layer connecting all backend APIs        | emyildir          |
| Test Suite            | 23 auth tests + 26 AI service tests                       | halozdem          |

---

## Modules

### Point Calculation

| Type            | Count  | Points Each | Total  |
|-----------------|--------|-------------|--------|
| Major           | 9      | 2           | 18     |
| Minor           | 5      | 1           | 5      |
| **Grand Total** | **14** |             | **23** |

### Selected Modules

#### IV.1 — Web

| Type       | Module                                                | Implementation                                                                                                                               |
|------------|-------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| **Major**  | Use a framework for both the frontend and backend     | React (frontend) + Django (auth & chat) + Express (game) + FastAPI (AI)                                                                      |
| **Minor**  | Use a frontend framework                              | React 19 with TypeScript and Vite                                                                                                            |
| **Minor**  | Use a backend framework                               | Django 5 (DRF + Channels), Express 4.18, FastAPI 0.109                                                                                       |
| **Major**  | Implement real-time features using WebSockets         | Socket.io for real-time game state; Django Channels for chat WebSockets                                                                      |
| **Major**  | Allow users to interact with other users              | Chat rooms (DM + channels), user profiles, friends list with online status                                                                   |
| **Major**  | A public API with secured API key, rate limiting, 5+  | 17 REST endpoints under `/api/auth/`; JWT Bearer authentication; rate limiting (30/min anon, 100/min auth); full documentation in this README |

#### IV.3 — User Management

| Type       | Module                                | Implementation                                                                    |
|------------|---------------------------------------|-----------------------------------------------------------------------------------|
| **Major**  | Standard user management and auth     | Email-based registration, JWT login/logout, profile CRUD, avatar upload           |
| **Minor**  | Game statistics and match history     | PlayerStats model (wins/losses/XP/level), MatchRecord, achievements, leaderboard  |

#### IV.4 — Artificial Intelligence

| Type       | Module                                | Implementation                                                                                                           |
|------------|---------------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| **Minor**  | Content moderation AI                 | FastAPI service using `better_profanity` + custom Turkish word list (~130 words); flags and censors messages automatically |
| **Minor**  | Image recognition and tagging system  | `Falconsai/nsfw_image_detection` Vision Transformer model; NSFW score threshold 0.7; applied to avatar uploads           |

#### IV.6 — Gaming and User Experience

| Type       | Module                                  | Implementation                                                                                                              |
|------------|-----------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| **Major**  | Implement a complete web-based game     | Haxball-inspired 2D soccer game; real-time physics (ball, player, collisions); win by score limit (5 goals) or time (180 s) |
| **Major**  | Remote players                          | Two players on separate computers connected via Socket.io; state synced at 30 FPS                                           |
| **Major**  | Multiplayer game (more than two players)| Configurable team sizes up to 3v3+; server-side room and team management                                                    |

#### IV.7 — DevOps

| Type       | Module                    | Implementation                                                                                                                                    |
|------------|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| **Major**  | Backend as microservices  | 5 loosely-coupled services (auth, game, chat, AI, gateway) communicating via REST APIs and service-to-service secrets; each with its own Dockerfile |

### Justification for Custom / Choice Modules

**Content Moderation AI (Minor):** This module addresses a real production need — preventing toxic content in a multiplayer game environment. It goes beyond trivial keyword filtering by integrating a multilingual profanity detection library with a custom Turkish word list and exposing it as a standalone microservice with its own test suite. This adds meaningful safety infrastructure rather than cosmetic features.

**Image Recognition and Tagging (Minor):** Avatar uploads in social gaming platforms are a common attack surface for inappropriate content. Instead of manual moderation, we integrated a pretrained Vision Transformer model (`Falconsai/nsfw_image_detection`) that classifies images automatically with a confidence score. This demonstrates real ML model integration — not just an API call to a third-party service — and protects all users without human review overhead.

---

## Individual Contributions

### halozdem — Product Owner

- Designed and implemented the complete authentication system: user registration, email-based login, JWT access/refresh token issuance, logout with token blacklisting
- Built all Django models for the auth service: `User`, `PlayerStats`, `MatchRecord`, `MatchPlayer`, `Achievement`, `UserAchievement`, `FriendRequest`
- Designed the PostgreSQL schema and managed Django migrations for the auth service
- Implemented password change and account deletion endpoints
- Built and integrated the AI moderation service (text profanity detection + image NSFW classification)
- Wrote the full auth service test suite (23 tests) and AI service test suite (26 tests)
- Defined product requirements, user stories, and acceptance criteria for all features

### fkuyumcu — Tech Lead

- Designed the overall microservices architecture and service communication contracts
- Set up and maintained all Dockerfiles for every service (Python, Node.js, Nginx)
- Configured Docker Compose with proper networking (frontend/backend networks), volumes, and health checks
- Set up the Nginx gateway with SSL/TLS (self-signed certificates via `generate_ssl.sh`), reverse proxy routing, HSTS, rate limiting, and gzip compression
- Managed Redis configuration as the Django Channels WebSocket broker
- Created the `Makefile` with all build, test, migration, and utility commands
- Ensured the microservices infrastructure met the DevOps module requirements

### ayasar — Project Manager

- Managed project planning, sprint organization, and task assignment in Notion
- Facilitated weekly Monday meetings and tracked blockers
- Developed the React frontend application: page routing with React Router, layout structure, and major UI pages (Dashboard, Leaderboard, Settings)
- Implemented Tailwind CSS design system and reusable UI components (cards, buttons, dialogs)
- Coordinated cross-team dependencies between frontend and backend development

### aakyuz — Developer

- Implemented user profile management: avatar/banner upload, profile editing, public profile views
- Built the complete chat service backend: Django Channels consumers, ChatRoom/ChatMessage/ChatRoomMember models, REST endpoints for room CRUD, join/leave, message history
- Developed core gameplay mechanics in the game service: `GameRoom.js` (room lifecycle, team assignment, score tracking), `Player.js` (physics), `Ball.js` (physics), `physics.js` (collision detection, kick mechanics)
- Implemented the friend system (add, remove, list)

### emyildir — Developer

- Built the frontend API service layer: `authApi.ts`, `gameApi.ts`, `chatApi.ts`, `profileApi.ts` connecting all React pages to backend services
- Integrated JWT token management in the frontend (storage, refresh, protected routes)
- Implemented the game rendering frontend: `GameCanvas` (SVG-based), `Field`, `Player`, `Ball`, `Scoreboard` components
- Built `useGameSocket` hook for real-time game state synchronization
- Implemented `useGameInput` hook for keyboard-based player controls
- Made UI improvements across multiple pages (Profile, Friends, Game lobby)
- Integrated game service with auth service for posting match results via service-to-service API
