# Campus Placement Portal

An AI-assisted campus placement management system for colleges, with role-based workflows for Students, Recruiters, and Placement Officers.

## Overview

Covers the full placement lifecycle: student profiles and resume uploads, company/drive management, an automated eligibility engine, applications through interviews and offers, notifications, analytics, and a lightweight skill-based drive recommendation engine.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, React Router, Axios, Tailwind CSS, React Hook Form
- **Backend**: Node.js, Express, TypeScript (layered architecture)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (access + refresh), bcrypt
- **Caching**: Redis
- **Docs**: Swagger / OpenAPI
- **Testing**: Jest, Supertest
- **Infra**: Docker, Docker Compose

## Setup

```bash
git clone <repo-url>
cd soft_project
cp server/.env.example server/.env
cp client/.env.example client/.env
docker compose up
```

## Run Commands

```bash
# Backend
cd server && npm install && npm run dev

# Frontend
cd client && npm install && npm run dev

# Tests
cd server && npm test
```

## Screenshots

_Coming soon._

## Future Improvements

- CI pipeline (GitHub Actions)
- Calendar integration for interview scheduling
- Audit logs for admin actions
