# The Fluid Ledger

A React-based personal finance tracker that consumes the Daily Spend REST API. Track expenses, view monthly summaries, explore spending insights, and add new transactions — all behind token-based authentication.

## Pages

- **Login** — Authenticate with username/password to obtain an API token
- **Dashboard** — Monthly overview with progress ring, recent activity, and category breakdown
- **Activity** — Full transaction list with monthly/daily/search filters, pagination, and spending velocity chart
- **Insights** — Category donut chart, monthly trajectory bars, largest outflows, and active category breakdowns
- **Add Spend** — Form to create a new expense (amount, category, date, description, location, rating)

## Tech Stack

- React 19 + Vite
- React Router (protected routes)
- Axios (API client)
- CSS (no external UI library)

## Setup

### Prerequisites

- Node.js 20+
- A running instance of the Daily Spend API

### Install & Run

```bash
npm install
cp .env.example .env
```

Edit `.env` and set your API host:

```
VITE_API_HOST=http://localhost:8000/api
```

Start the dev server:

```bash
npm run dev
```

The app runs at `http://localhost:5173`. The Vite dev server proxies `/api` requests to your backend to avoid CORS issues.

### Production Build

```bash
npm run build
npm run preview
```

### Docker

```bash
docker build -t fluid-ledger .
docker run -p 3000:3000 fluid-ledger
```

## Project Structure

```
src/
  api/client.js              # Axios instance with token management
  context/AuthContext.jsx     # Auth provider (login/logout/token persistence)
  components/
    ProtectedRoute.jsx        # Redirects to /login if unauthenticated
    Layout.jsx                # Sidebar navigation + main content area
  pages/
    Login.jsx                 # Login form
    Dashboard.jsx             # Monthly summary
    Activity.jsx              # Transaction list with filters
    Insights.jsx              # Charts and category analytics
    AddSpend.jsx              # New transaction form
  styles/                     # CSS files per component/page
```

## API Endpoints Used

| Endpoint                          | Method | Description                  |
|-----------------------------------|--------|------------------------------|
| `/api/token/`                     | POST   | Obtain auth token            |
| `/api/spends/month/{month}/`      | GET    | List spends by month         |
| `/api/spends/date/{date}/`        | GET    | List spends by exact date    |
| `/api/spends/search/?q={query}`   | GET    | Search spends                |
| `/api/spends/new/`                | POST   | Create a new spend           |
| `/api/categories/`                | GET    | List categories with totals  |
| `/api/spend-types/`               | GET    | List all spend types         |

## Environment Variables

| Variable         | Description                          | Default                      |
|------------------|--------------------------------------|------------------------------|
| `VITE_API_HOST`  | Base URL of the Daily Spend API      | `http://localhost:8000/api`  |
