# BnBly

BnBly is a full-stack Airbnb-style booking app built with Next.js on the frontend and Django REST Framework on the backend.

It supports browsing listings, saving favourites, messaging hosts, creating reservations, managing hosted properties, and viewing booked dates on listing calendars.

## Features

- User authentication with JWT
- Browse and search property listings
- Property detail pages with map support
- Add, edit, and manage hosted properties
- Favourite / unfavourite properties
- Create and cancel reservations
- View personal trips and host-side reservations
- Inbox and conversation flow between guests and hosts
- Booked-date API for unavailable reservation ranges
- Django admin for managing users, properties, reservations, and conversations

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Zustand
- React Leaflet

### Backend

- Django 5
- Django REST Framework
- Simple JWT
- PostgreSQL
- Redis
- Django Channels / Daphne

## Project Structure

```text
bnbly/
├── app/                 # Next.js app router frontend
├── backend/             # Django backend
├── docker-compose.yml   # Local Docker services
├── package.json         # Frontend scripts
└── README.md
```

## Main Pages

- `/` - home page and listing feed
- `/properties/[id]` - property details and reservation UI
- `/myproperties` - host property management
- `/myreservations` - guest and host reservation views
- `/myfavourites` - saved properties
- `/inbox` - conversations and messaging
- `/profile` - user profile
- `/admin` - Django admin

## How To Run

## Option 1: Run With Docker

This is the easiest way to run the backend services locally.

From the project root:

```bash
docker compose up -d --build
```

This starts:

- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`
- Django backend on `http://localhost:8000`

Then start the frontend in another terminal:

```bash
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:3000
```

## Option 2: Run Frontend Only

If your backend is already running elsewhere, you can start only the Next.js app:

```bash
npm install
npm run dev
```

Make sure your `.env.local` points `NEXT_PUBLIC_API_URL` to the correct backend.

## Backend Notes

The backend is configured in Docker to:

- run migrations on startup
- expose the API on port `8000`
- use PostgreSQL as the main database
- use Redis for Channels

Important API groups:

- `/api/auth/`
- `/api/properties/`
- `/api/reservations/`
- `/api/conversations/`

## Admin

To use Django admin, create a superuser inside the backend container:

```bash
docker compose exec backend python manage.py createsuperuser
```

Then visit:

```text
http://localhost:8000/admin
```

## Environment

Frontend:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_WS_URL` if needed for websockets

Backend Docker environment is currently defined in `docker-compose.yml`, including:

- `DEBUG`
- `DJANGO_SECRET_KEY`
- `ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`
- `REDIS_URL`

## Current Local Workflow

1. Start backend services with Docker
2. Run `npm run dev` for the frontend
3. Open the app on `localhost:3000`
4. Open Django admin on `localhost:8000/admin`

## Repository

GitHub:

```text
https://github.com/xzhu411/Bnbly
```
