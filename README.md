# WanderWise Travel Planner

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=26&pause=1200&color=2563EB&center=true&vCenter=true&width=980&lines=Full-Stack+Travel+Planning+Platform;React+%2B+Vite+Frontend+%7C+Spring+Boot+Backend;Role-Based+Dashboards%2C+Bookings%2C+Payments%2C+Notifications" alt="Animated project intro" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-0ea5e9?style=for-the-badge&logo=react" alt="Frontend badge" />
  <img src="https://img.shields.io/badge/Backend-Spring%20Boot%204-16a34a?style=for-the-badge&logo=springboot" alt="Backend badge" />
  <img src="https://img.shields.io/badge/Database-MySQL-1d4ed8?style=for-the-badge&logo=mysql" alt="Database badge" />
  <img src="https://img.shields.io/badge/Auth-JWT-f59e0b?style=for-the-badge&logo=jsonwebtokens" alt="Auth badge" />
</p>

## Overview
WanderWise is a full-stack travel planning application with:

- Public travel/tour browsing and booking flows
- Traveler dashboard (trips, budget, notifications, preferences)
- Admin dashboard (users, tours/itineraries, bookings, reports, payments, recommendations)
- JWT-based authentication with role-based access control
- Automatic backend seeding of tour data at startup

## Animated README Sections
This README includes animated SVG banners.  
If you want animated product demos too, add GIF files and link them in this section:

- `docs/animations/traveler-dashboard.gif`
- `docs/animations/admin-dashboard.gif`
- `docs/animations/tour-booking-flow.gif`

Example markdown:

```md
![Traveler Dashboard Demo](docs/animations/traveler-dashboard.gif)
```

## Tech Stack
### Frontend
- React 19
- Vite 7
- Tailwind CSS 4
- React Router
- React Hook Form + Yup
- Framer Motion
- Recharts

### Backend
- Spring Boot 4
- Spring Web MVC
- Spring Data JPA
- Spring Security
- MySQL
- JWT (`jjwt`)
- Lombok

## Project Structure
```text
Travel-Planner/
  Travel-Planner Frontend/   # React app (UI, pages, dashboard widgets, API calls)
  Travel-Planner Backend/    # Spring Boot API (auth, tours, bookings, trips, admin)
```

## Core Features
### Public
- Browse all tours by category
- View tour details, itinerary, dynamic weather, and pricing
- Book tours with traveler details

### Traveler
- Personal dashboard overview
- My Trips view (upcoming/completed + trip detail)
- Notifications center
- Settings (profile, preferences, notification options)

### Admin
- Dashboard overview and recommendations
- User management (role/status updates, delete)
- Trips and itinerary management
- Booking approvals/rejections
- Payment monitoring

## Backend API Modules
Main API groups from backend controllers:

- `/api/auth` - signup/login
- `/api/tours` - list tours and tour by slug
- `/api/bookings` - traveler bookings + admin booking actions
- `/api/payments` - payments and admin payment view
- `/api/trips` - traveler trip history/details
- `/api/notifications` - traveler notification actions
- `/api/dashboard` - traveler dashboard payload
- `/api/admin/dashboard` - admin overview
- `/api/admin/users` - user administration
- `/api/admin/recommendations` - recommendation data
- `/api/users/me/settings` - traveler settings/profile/preferences

## Tour Data Seeding (Automatic)
When backend starts, tours are automatically seeded from:

`Travel-Planner Backend/src/main/resources/seed/all-tours.json`

This means frontend no longer needs static seed files for tours.

## Prerequisites
- Node.js 20+ and npm
- Java 17+
- MySQL 8+

## Local Setup
### 1) Clone
```bash
git clone <your-repo-url>
cd Travel-Planner
```

### 2) Create Database
```sql
CREATE DATABASE wanderwise_db;
```

### 3) Configure Backend
Edit:

`Travel-Planner Backend/src/main/resources/application.properties`

Set at least:

- `spring.datasource.url`
- `spring.datasource.username`
- `spring.datasource.password`
- `app.jwt.secret`
- `app.cors.allowed-origins`

### 4) Run Backend
```powershell
cd "Travel-Planner Backend"
.\mvnw.cmd spring-boot:run
```

Backend runs on: `http://localhost:8080`

### 5) Run Frontend
```powershell
cd "Travel-Planner Frontend"
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

## Frontend Environment Variables
Create `Travel-Planner Frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_SUPPORT_PHONE=+91 98765 43210
```

## Useful Commands
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

## Authentication and Roles
- `USER` role: traveler features and booking flows
- `ADMIN` role: admin dashboard and management APIs

JWT token is issued at login/signup and sent as:

`Authorization: Bearer <token>`

## Troubleshooting
### Backend fails to connect to DB
- Check MySQL service is running
- Verify DB name/user/password in `application.properties`
- Ensure `wanderwise_db` exists

### CORS errors in frontend
- Ensure `app.cors.allowed-origins` includes frontend origin (`http://localhost:5173`)

### Tours not appearing
- Confirm backend startup logs show seed load from `seed/all-tours.json`
- Check `/api/tours` returns data

## Security Note
Avoid committing real secrets.  
Move DB credentials and JWT secret to environment variables or secret management for production.

## Contribution Workflow
1. Create a feature branch
2. Make changes with clear commit messages
3. Run frontend build and backend tests
4. Open pull request with testing notes

---

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=16&pause=1000&color=22C55E&center=true&vCenter=true&width=980&lines=Build+Smart.+Travel+Better.+Ship+Fast." alt="Animated footer line" />
</p>
