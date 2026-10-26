# Naukri Clone — Job Search Portal (Microservices + MySQL)

A **Naukri.com-style job portal** built as **microservices** for DevOps practice.
No Docker / K8s files included (you will build & deploy manually).

## Architecture

```
                ┌──────────────┐
                │   React UI   │  :5173 (Vite)
                │  (frontend/) │
                └──────┬───────┘
                       │ REST
                ┌──────▼───────┐
                │ API Gateway  │  :5000  (api-gateway/)
                │  (proxy)     │
       ┌────────┼────────┬─────┴────────┐
       │        │        │              │
┌──────▼───┐ ┌──▼────┐ ┌─▼──────────┐
│ user-    │ │ job-  │ │application-│
│ service  │ │service│ │ service    │
│ :5001    │ │ :5002 │ │ :5003      │
└────┬─────┘ └──┬────┘ └─────┬──────┘
     └──────────┼────────────┘
                ▼
         MySQL :3306
         DB: naukri_db
         (database/schema.sql)
```

| Service | Folder | Port | Owns (tables) | Key APIs (WRUD) |
|---|---|---|---|---|
| api-gateway | `api-gateway/` | 5000 | proxy only | `/api/auth/*`, `/api/users/*`, `/api/jobs/*`, `/api/applications/*` → proxies |
| user-service | `services/user-service/` | 5001 | `users` | Register, Login, Me, Get/Update/Delete user |
| job-service | `services/job-service/` | 5002 | `jobs` | Create/List/Search/Get/Update/Delete jobs |
| application-service | `services/application-service/` | 5003 | `applications` | Apply, List by seeker/job, Update status, Withdraw |

> Single shared MySQL DB (`naukri_db`) keeps manual deployment easy. Each service only touches its own tables — clean service boundaries.

## Tech Stack
- **Backend:** Node.js 18+ / Express 4 / mysql2 / bcryptjs / jsonwebtoken / cors / dotenv
- **Gateway:** Express + http-proxy-middleware
- **Frontend:** React 18 + Vite + react-router-dom + axios (Naukri-style UI)
- **DB:** MySQL 8

## 1) Prerequisite — MySQL
Install MySQL 8 locally (or on your server/VM). Then:

```sql
-- in MySQL shell
SOURCE database/schema.sql;
SOURCE database/seed.sql;
-- OR from terminal:
-- mysql -u root -p < database/schema.sql
-- mysql -u root -p naukri_db < database/seed.sql
```

Create a DB user (example):
```sql
CREATE USER IF NOT EXISTS 'naukri'@'localhost' IDENTIFIED BY 'naukri123';
GRANT ALL PRIVILEGES ON naukri_db.* TO 'naukri'@'localhost';
FLUSH PRIVILEGES;
```

> `seed.sql` has demo jobs. For login, **register fresh users from the UI** (passwords are bcrypt-hashed at register time). Demo convenience accounts you can register: `recruiter@naukri.local` / `priya@naukri.local` with password `password123`.

## 2) Configure env
Copy `.env.example` → `.env` in each service + gateway and edit DB credentials:

```env
PORT=5001
DB_HOST=localhost
DB_PORT=3306
DB_USER=naukri
DB_PASSWORD=naukri123
DB_NAME=naukri_db
JWT_SECRET=naukri_secret_dev_change_me
```

Gateway `.env`:
```env
PORT=5000
USER_SERVICE_URL=http://localhost:5001
JOB_SERVICE_URL=http://localhost:5002
APPLICATION_SERVICE_URL=http://localhost:5003
```

Frontend `.env`:
```env
VITE_API_URL=http://localhost:5000
```

## 3) Install & Run (dev — 5 terminals)

```bash
# terminal 1
cd services/user-service && npm install && npm run dev

# terminal 2
cd services/job-service && npm install && npm run dev

# terminal 3
cd services/application-service && npm install && npm run dev

# terminal 4
cd api-gateway && npm install && npm run dev

# terminal 5
cd frontend && npm install && npm run dev
```

Open: **http://localhost:5173**

Health checks:
- http://localhost:5000/health
- http://localhost:5001/health
- http://localhost:5002/health
- http://localhost:5003/health

## 4) WRUD coverage (for your practice)
- **Users:** Register (W), Login (R), Me/Profile (R), Update profile (U), Delete account (D)
- **Jobs:** Post job (W), Search/list + detail (R), Edit job (U), Close/Delete job (D)
- **Applications:** Apply (W), My applications / Applicants list (R), Update status shortlist/reject/hire (U), Withdraw (D)

## 5) Manual deployment notes (for your DevOps practice)
- Build frontend: `cd frontend && npm run build` → serve `dist/` via Nginx.
- Run backend with PM2: `pm2 start src/index.js --name user-service` (repeat per service + gateway).
- Put Nginx reverse proxy in front of gateway `:5000`, serve frontend statically.
- MySQL: run `schema.sql` once per environment, schedule `mysqldump` backups, practice Jenkins/GitHub Actions pipelines per service.

## Repo layout
```
database/            schema.sql, seed.sql
services/user-service/
services/job-service/
services/application-service/
api-gateway/
frontend/            React + Vite Naukri-style UI
README.md
```
