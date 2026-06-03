# 🔗 LinkSnap — URL Shortener with Analytics

A full-stack URL shortening platform with click analytics, built for the Katomaran Hackathon.

> **This project is a part of a hackathon run by https://katomaran.com**

---

## 🚀 Live Demo

> Record your Loom/YouTube demo and paste the link here.

---

## 🏗️ Architecture Diagram

```
┌─────────────────┐          ┌──────────────────────┐         ┌─────────────────┐
│   React Frontend │ ←REST→  │  Node.js/Express API  │ ←ODM→  │    MongoDB       │
│   (Port 3000)    │         │     (Port 5000)        │        │  (localhost)     │
└─────────────────┘          └──────────────────────┘         └─────────────────┘
        ↑                            ↑
   react-router-dom            JWT Auth Middleware
   recharts (charts)           bcryptjs (hashing)
   qrcode.react (QR)           nanoid (short codes)
```

---

## ✅ Features Implemented

### Mandatory
- [x] **Authentication** — Signup, Login, JWT-protected routes
- [x] **URL Shortening** — Unique short codes via nanoid, URL validation
- [x] **User Dashboard** — View all links, original URL, short URL, created date, click count
- [x] **Delete** shortened URLs
- [x] **Copy** short URL from UI

### Analytics
- [x] Click count per short URL
- [x] Timestamp of each visit
- [x] Analytics page per URL
- [x] Total click count, last visited, recent history (last 10)
- [x] Browser breakdown (Chrome, Firefox, Safari, Edge)
- [x] Device breakdown (Desktop, Mobile, Tablet)
- [x] Daily clicks chart (last 30 days)

### UI
- [x] Responsive interface
- [x] Clean dark dashboard layout
- [x] Loading, success, error states
- [x] Form validation messages

### Bonus
- [x] Custom alias for short URL
- [x] QR code generation per link
- [x] Expiry date for links
- [x] Device/browser analytics
- [x] Charts for daily click trends
- [x] Edit destination URL
- [x] Search/filter links

---

## 🛠️ Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | React 18, React Router v6         |
| Styling     | Custom CSS, Google Fonts (Syne)   |
| Charts      | Recharts                          |
| QR Codes    | qrcode.react                      |
| Backend     | Node.js + Express.js              |
| Database    | MongoDB + Mongoose ODM            |
| Auth        | JWT (jsonwebtoken) + bcryptjs     |
| URL Codes   | nanoid                            |
| Security    | helmet, express-rate-limit, cors  |

---

## 📦 Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd urlshort
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your values:
#   MONGODB_URI=mongodb://localhost:27017/urlshortener
#   JWT_SECRET=your_secret_key_here
#   BASE_URL=http://localhost:5000
#   PORT=5000

npm start
# Backend runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

npm start
# Frontend runs on http://localhost:3000
```

---

## 🔌 API Endpoints

| Method | Endpoint                    | Auth | Description                  |
|--------|-----------------------------|------|------------------------------|
| POST   | /api/auth/signup            | No   | Register new user            |
| POST   | /api/auth/login             | No   | Login, get JWT               |
| GET    | /api/auth/me                | Yes  | Get current user             |
| POST   | /api/urls                   | Yes  | Create short URL             |
| GET    | /api/urls                   | Yes  | Get all user's URLs          |
| GET    | /api/urls/:id/analytics     | Yes  | Get analytics for URL        |
| PUT    | /api/urls/:id               | Yes  | Update URL                   |
| DELETE | /api/urls/:id               | Yes  | Delete URL                   |
| GET    | /r/:code                    | No   | Redirect to original URL     |

---

## 🔒 Security

- Passwords hashed with bcryptjs (12 salt rounds)
- JWT tokens for stateless authentication
- Rate limiting (100 req / 15 min per IP)
- Helmet.js for HTTP security headers
- CORS configured for allowed origins
- Backend validation on all inputs
- No external URL shortening service used

---

## 📐 Assumptions Made

1. Short codes are 7 characters (alphanumeric) generated via nanoid
2. Custom aliases must be alphanumeric with hyphens/underscores
3. Analytics store last N clicks in the URL document (embedded for performance)
4. Each user can only manage their own URLs (no admin panel)
5. URL redirect uses HTTP 301 (permanent redirect)
6. MongoDB is used as the database (not PostgreSQL)

---

## 📁 Project Structure

```
urlshort/
├── backend/
│   ├── middleware/
│   │   └── auth.js          # JWT middleware
│   ├── models/
│   │   ├── User.js          # User schema (bcrypt)
│   │   └── Url.js           # URL + analytics schema
│   ├── routes/
│   │   ├── auth.js          # Auth endpoints
│   │   └── urls.js          # URL CRUD + analytics
│   ├── server.js            # Express app + redirect
│   └── .env
└── frontend/
    └── src/
        ├── context/
        │   └── AuthContext.js
        ├── pages/
        │   ├── Landing.js
        │   ├── Login.js
        │   ├── Signup.js
        │   ├── Dashboard.js
        │   ├── URLs.js
        │   └── Analytics.js
        ├── services/
        │   └── api.js
        ├── styles/
        │   └── global.css
        └── App.js
```

---

*This project is a part of a hackathon run by https://katomaran.com*
