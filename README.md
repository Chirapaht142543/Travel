# LUNAR JOURNEY - Travel Booking Web Application

Lunar Journey is a premium, modern travel booking website built using a Next.js (React) frontend, Python (FastAPI) backend, PostgreSQL database, and Redis cache. It features a complete dark glassmorphic Cappadocia design theme, simulated Stripe/Omise payment gateways, and a real-time notification logger for Email, SMS, and LINE notifications.

## Key Features

1. **Premium UI/UX:** Dark glassmorphism, responsive grid list, custom curved sidebar, favorites badges, responsive tabbed search filters, and smooth micro-animations.
2. **Tabbed Search Widget:** Search and filter capabilities for Flights, Stays, Tour Packages, and Car Rentals.
3. **Interactive Booking & Payments:** Pick dates, adjust guests, create pending bookings, checkout using simulated cards (Stripe/Omise), and view active receipts.
4. **Live Notification Logger:** Live logging of simulated dispatch events (SMTP Email, Twilio SMS, LINE Notify) sent upon creation or payment confirmation.
5. **Automatic DB & Cache Fallback:** 
   - If PostgreSQL is not running, the API automatically falls back to an **SQLite database (`backend/travel.db`)**.
   - If Redis is not running, the API automatically falls back to an **In-Memory Cache dictionary**.
   - **This allows you to run `npm run dev` and python scripts immediately out-of-the-box without configuring service daemons first!**

---

## Folder Structure

```
Travel/
├── frontend/               # Next.js Frontend Client
│   ├── src/
│   │   ├── app/            # App Router pages (Home, Trips, Layout)
│   │   ├── components/     # UI Components (Sidebar, Header, Modals)
│   │   └── context/        # AppContext (Auth, Search API, Booking, Theme)
│   └── package.json
├── backend/                # Python FastAPI Backend Server
│   ├── services/           # Services (Auth, Place, Booking, Pay, Notif)
│   ├── config.py           # Configuration (Postgres/Redis connection checks)
│   ├── database.py         # DB Engine & Models (User, Place, Booking)
│   ├── cache.py            # Cache Engine (Redis with Local Dict fallback)
│   ├── seed.py             # DB Seeding Script
│   ├── main.py             # FastAPI entrypoint
│   └── requirements.txt
└── README.md               # High-level Documentation
```

---

## Setup & Running Instructions

### 1. Start the Backend API (FastAPI)

Ensure you have Python 3.10+ installed. Open a terminal in `/backend`:

```bash
# Navigate to backend folder
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the database seeder (seeds default user and places)
python seed.py

# Start the development server
python main.py
```

The API will start at `http://127.0.0.1:8000/`. You can view the Interactive OpenAPI Swagger docs at `http://127.0.0.1:8000/docs`.

### 2. Start the Frontend client (Next.js)

Open a second terminal in `/frontend`:

```bash
# Navigate to frontend folder
cd frontend

# Install packages
npm install

# Start the dev server
npm run dev
```

Open `http://localhost:3000/` in your browser to view the application.

---

## Quick Testing Credentials

Use these details to test the booking and checkout features:
- **Test Login Username:** `lunar_traveler`
- **Test Login Password:** `password123`
- **Test Payments:** Put any credit card details. If you use a card ending in `9999`, the transaction will fail simulating "Insufficient Funds". Any other card will succeed.
