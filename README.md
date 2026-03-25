# OKO

A social film tracking web application inspired by Letterboxd. Users can discover movies, log what they've watched, write reviews, keep a diary, build watchlists and lists, and follow other members.

**Live demo:** https://web-production-f5563.up.railway.app

---

## Features

- **Movie discovery** — search TMDB's entire catalogue, browse by genre, year, and language
- **Movie detail pages** — poster, backdrop, cast & crew, TMDB rating, OKO community rating
- **Diary** — log watches with date, rating, and notes; rewatch tracking
- **Reviews** — write and read reviews with spoiler protection and star ratings
- **Watchlist & watched** — track what you've seen and what you want to see
- **Lists** — create curated public or private film lists
- **Social** — follow members, see a personalised activity feed
- **Person pages** — full filmography from TMDB with lazy sync on click
- **Google OAuth2** — sign in with Google or register with email
- **Admin panel** — manage users and movies

---

## Tech Stack

**Backend**
- Java 17, Spring Boot 4
- Spring Security with JWT authentication and Google OAuth2
- Spring Data JPA / Hibernate
- PostgreSQL (production and Docker), H2 (local dev)
- TMDB API integration via WebClient

**Frontend**
- React 18 (Create React App)
- React Router v6
- Axios
- Tailwind CSS
- Heroicons

**Infrastructure**
- Deployed on Railway (backend + PostgreSQL)
- Docker + Docker Compose for local development
- nginx for serving the React build in Docker

---

## Running Locally

### Option 1 — Docker (recommended)

Requires [Docker](https://www.docker.com/products/docker-desktop/) installed.

1. Clone the repository

```bash
git clone <repo-url>
cd oko
```

2. Create a `.env` file in the project root

```
TMDB_API_KEY=your_tmdb_api_key
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

3. Start everything

```bash
docker-compose up --build
```

4. Open `http://localhost:3000`

The Docker setup starts three containers — PostgreSQL, the Spring Boot backend, and the React frontend served by nginx. Data persists between restarts via a Docker volume.

---

### Option 2 — Manual

Requirements: Java 17, Maven, Node.js 20

1. Start the backend

```bash
./mvnw spring-boot:run
```

Uses H2 in-memory database by default.

2. Start the frontend

```bash
cd frontend
npm install
npm start
```

3. Open `http://localhost:3000`

---

## Environment Variables

| Variable | Description |
|---|---|
| `TMDB_API_KEY` | TMDB API v4 bearer token |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret |

For Railway deployment, these are set in the Railway dashboard. For Docker, they are read from the `.env` file in the project root.

---

## Project Structure

```
oko/
├── src/
│   └── main/
│       ├── java/com/oko/
│       │   ├── config/
│       │   ├── controller/
│       │   ├── entity/
│       │   ├── repository/
│       │   ├── service/
│       │   └── external/tmdb/
│       └── resources/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   ├── Dockerfile.frontend
│   └── nginx.conf
├── Dockerfile.backend
├── docker-compose.yml
└── pom.xml
```

---

## API Highlights

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register with email |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `GET` | `/api/movies/search?query=` | Search TMDB |
| `POST` | `/api/movies/sync/{tmdbId}` | Sync movie from TMDB to local DB |
| `GET` | `/api/movies/{id}` | Get movie detail |
| `GET` | `/api/people/{id}/tmdb-filmography` | Full filmography from TMDB |
| `POST` | `/api/reviews` | Create a review |
| `GET` | `/api/feed` | Personalised activity feed |
| `GET` | `/api/users/{username}` | User profile |
