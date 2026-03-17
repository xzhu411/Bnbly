# BnBly

> A full-stack Airbnb-style property booking platform built with **Next.js** and **Django REST Framework**.

BnBly lets users browse and search listings, make reservations, manage hosted properties, save favourites, and chat directly with hosts — all in one place.

---
## 🎬 Watch Demo on Youtube (click the image below)
 
[![Watch the demo](https://img.youtube.com/vi/y4o4HBXYw_Q/maxresdefault.jpg)](https://youtu.be/y4o4HBXYw_Q)
The demo walkthrough covers:
 
- 🔐 Sign up & log in
- 👤 Edit profile
- 🏠 Add a property listing
- 📅 Make a reservation
- ❌ Cancel a reservation
- ❤️ Favourite a property
- 💬 Send messages to a host

## ✨ Features

- 🔐 **JWT Authentication** — register, log in, and stay signed in with rotating refresh tokens
- 🏠 **Property Listings** — browse all properties with image galleries and map view
- 🔍 **Advanced Search** — filter by location, category, price range, guest count, and date availability
- 📅 **Reservations** — book properties, view trips, cancel bookings, and block already-reserved dates on the calendar
- ❤️ **Favourites** — save and unsave properties for quick access
- 💬 **Messaging** — real-time inbox and conversation flow between guests and hosts (Django Channels / WebSocket)
- 🏡 **Host Dashboard** — add, edit, and manage your own listed properties
- 🛠️ **Django Admin** — manage users, properties, reservations, and conversations

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 16 (App Router) | React framework & routing |
| React 19 | UI library |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Zustand | Global state management |
| React Leaflet | Interactive maps |
| React Date Range | Date picker for reservations |

### Backend
| Technology | Purpose |
|---|---|
| Django 5 | Web framework |
| Django REST Framework | REST API |
| Simple JWT | JWT authentication |
| Django Channels + Daphne | WebSocket / real-time messaging |
| PostgreSQL | Primary database |
| Redis | Channel layer for WebSockets |

---

## 📁 Project Structure

```
bnbly/
├── app/                        # Next.js App Router (frontend)
│   ├── components/             # Reusable UI components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and helpers
│   └── ...                     # Route pages
├── backend/                    # Django backend
│   ├── useraccount/            # Auth & user model
│   ├── property/               # Listings and favourites
│   ├── reservation/            # Booking logic
│   ├── conversation/           # Messaging / WebSocket
│   └── bnbly_backend/          # Django settings & routing
├── docker-compose.yml          # Local Docker services
├── package.json                # Frontend scripts & dependencies
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- Node.js ≥ 18

---

### Option 1: Full Stack with Docker (Recommended)

This starts PostgreSQL, Redis, and the Django backend together.

```bash
# 1. Clone the repo
git clone https://github.com/xzhu411/Bnbly.git
cd bnbly

# 2. Start backend services
docker compose up -d --build
```

Services started:

| Service | URL |
|---|---|
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |
| Django API | `http://localhost:8000` |

```bash
# 3. Start the frontend (in a new terminal)
npm install
npm run dev
```

Open the app at **[http://localhost:3000](http://localhost:3000)**

---

### Option 2: Frontend Only

If the backend is already running elsewhere:

```bash
npm install
npm run dev
```

Make sure your `.env.local` points to the correct backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

---

## ⚙️ Environment Variables

### Frontend (`.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the Django backend |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL for real-time messaging |

### Backend (Docker — defined in `docker-compose.yml`)

| Variable | Description |
|---|---|
| `DEBUG` | Enable/disable debug mode |
| `DJANGO_SECRET_KEY` | Django secret key |
| `ALLOWED_HOSTS` | Comma-separated allowed hostnames |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed frontend origins |
| `REDIS_URL` | Redis connection URL |

---

## 🔌 API Overview

| Prefix | Description |
|---|---|
| `/api/auth/` | Register, login, logout, token refresh |
| `/api/properties/` | List, create, search, favourite properties |
| `/api/reservations/` | Create, cancel, and list reservations |
| `/api/conversations/` | Start and fetch conversations |

---

## 🖥 Pages

| Route | Description |
|---|---|
| `/` | Home page — listing feed with search |
| `/properties/[id]` | Property detail page with reservation UI |
| `/myproperties` | Host property management |
| `/myreservations` | Guest trips & host-side reservations |
| `/myfavourites` | Saved properties |
| `/inbox` | Conversations and messaging |
| `/profile` | User profile |
| `/admin` | Django admin panel |

---

## 🛡 Django Admin

Create a superuser to access the admin panel:

```bash
docker compose exec backend python manage.py createsuperuser
```

Then visit: **[http://localhost:8000/admin](http://localhost:8000/admin)**

---

## 📜 License

This project is for educational purposes.

---

> GitHub: [https://github.com/xzhu411/Bnbly](https://github.com/xzhu411/Bnbly)