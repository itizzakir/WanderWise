<h1 align="center">WanderWise</h1>

<p align="center">
  <strong>AI-powered travel planning platform built with React, Vite, Spring Boot, and MySQL.</strong>
</p>

<p align="center">
  Plan trips, browse tours, discover hotel matches, manage bookings, and operate traveler and admin dashboards from one full-stack app.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 7" />
  <img src="https://img.shields.io/badge/Spring_Boot-4.0.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot 4" />
  <img src="https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL 8" />
  <img src="https://img.shields.io/badge/Auth-JWT-F59E0B?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT auth" />
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#feature-snapshot">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#api-overview">API</a>
</p>

## Overview

WanderWise is a full-stack travel planner that combines public tour discovery, role-based authentication, bookings, payments, hotel suggestions, AI-assisted planning, and separate traveler/admin workspaces. The project uses a React frontend for the user experience and a Spring Boot backend for secure APIs, business logic, and MySQL persistence.

## Feature Snapshot

| Area | What it includes |
| --- | --- |
| Public experience | Home page, tours listing, tour details, booking pages, about/services, contact, review, and legal pages |
| Traveler workspace | Dashboard, My Trips, trip details, hotel suggestions, notifications, profile/settings, and demo payment flow |
| Admin workspace | Overview dashboard, users, hotels, tours, bookings, payments, contact messages, and recommendations |
| AI tools | Chat assistant, travel recommendation engine, and travel-mode suggestion |
| Security | JWT authentication with `USER` and `ADMIN` role-based access |

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | React 19, Vite 7, React Router, Tailwind CSS 4, React Hook Form, Yup, Framer Motion, Recharts |
| Backend | Spring Boot 4, Spring Web MVC, Spring Security, Spring Data JPA, Validation, Lombok |
| Database | MySQL |
| Auth | JWT (`jjwt`) |
| AI | OpenAI-compatible chat completions with database-grounded prompts and fallback behavior |

## Project Structure

```text
Travel-Planner/
|-- Travel-Planner Frontend/
|   |-- src/
|   |-- public/
|   `-- package.json
|-- Travel-Planner Backend/
|   |-- src/main/java/
|   |-- src/main/resources/
|   `-- pom.xml
|-- AI_PROMPTS.md
`-- README.md
```

## Core Capabilities

- Browse tours and tour details with dynamic destination-based routes.
- Create traveler bookings and hotel booking requests.
- View trips, notifications, budget widgets, and personalized hotel suggestions.
- Manage users, hotels, tours, bookings, payments, and contact messages from the admin dashboard.
- Use AI to answer travel questions, recommend trips, and compare travel modes.
- Seed tours and hotels automatically from JSON files on backend startup.

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Java 17+
- MySQL 8+

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Travel-Planner
```

### 2. Create the database

```sql
CREATE DATABASE wanderwise_db;
```

### 3. Configure the backend

Update `Travel-Planner Backend/src/main/resources/application.properties` with your local values:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/wanderwise_db
spring.datasource.username=your_mysql_user
spring.datasource.password=your_mysql_password

app.jwt.secret=your_minimum_32_character_secret_key
app.jwt.expiration-ms=86400000
app.cors.allowed-origins=http://localhost:5173
```

Optional AI environment variables:

```env
AI_ENABLED=true
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4.1
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_TEMPERATURE=0.4
```

### 4. Run the backend

```powershell
cd "Travel-Planner Backend"
.\mvnw.cmd spring-boot:run
```

Backend default URL: `http://localhost:8080`

### 5. Run the frontend

Create `Travel-Planner Frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_SUPPORT_PHONE=+91 98765 43210
```

Start the app:

```powershell
cd "Travel-Planner Frontend"
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`

## Development Commands

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Backend

```powershell
.\mvnw.cmd spring-boot:run
.\mvnw.cmd test
```

## API Overview

- `POST /api/auth/signup` and `POST /api/auth/login` for authentication
- `GET /api/tours` and `GET /api/tours/{slug}` for tour discovery
- `GET /api/hotels` and `GET /api/hotels/suggestions` for hotel data and suggestions
- `POST /api/bookings`, `GET /api/bookings/me`, and admin booking status endpoints for tour bookings
- `POST /api/hotel-bookings`, `GET /api/hotel-bookings/me`, and admin status endpoints for hotel bookings
- `POST /api/payments`, `GET /api/payments/me`, and `GET /api/payments/admin` for payments
- `GET /api/dashboard/me`, `GET /api/trips/me`, and `GET /api/notifications/me` for traveler workspace data
- `GET /api/admin/dashboard/overview`, `/api/admin/users`, `/api/admin/tours`, `/api/admin/hotels`, `/api/admin/recommendations`, and `/api/admin/contact-messages` for admin operations
- `POST /api/chat`, `POST /api/recommend`, and `POST /api/travel-mode` for AI-assisted planning

## Seed Data

The backend automatically syncs startup data from:

- `Travel-Planner Backend/src/main/resources/seed/all-tours.json`
- `Travel-Planner Backend/src/main/resources/seed/hotels.json`

This helps the app boot with ready-to-use catalog data for tours and hotels.

## Roles

- `USER` can browse, book, manage trips, view notifications, and use traveler features
- `ADMIN` can access operational dashboards and management APIs

JWT tokens are expected in the `Authorization` header using the `Bearer <token>` format.

## Security Note

Do not commit real database passwords, JWT secrets, or AI API keys. Move sensitive values to environment variables or a secret manager before sharing or deploying this project.

## Future Improvements

- Add screenshots or GIF demos for the home page, traveler dashboard, and admin dashboard
- Add Docker support for one-command local setup
- Add CI checks for frontend build and backend tests
- Add API documentation with Swagger or OpenAPI

<p align="center">
  Built for smarter trip planning with structured data, AI assistance, and role-based workflows.
</p>
