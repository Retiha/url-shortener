# 🔗 LinkSnap — URL Shortener with Analytics

A full-stack URL shortening platform with click analytics, built for the Katomaran Hackathon.

> This project is a part of a hackathon run by https://katomaran.com

---

## 🚀 Live Demo

🎥 **Demo Video:** [Paste your Loom video link here]

🌐 **Live Frontend:** https://url-shortener-ge13.vercel.app

⚙️ **Live Backend:** https://url-shortener-see3.onrender.com

---

## 🏗️ Architecture Diagram
┌─────────────────┐          ┌──────────────────────┐         ┌─────────────────┐
│  React Frontend  │ ←REST→  │  Node.js/Express API  │ ←ODM→  │    MongoDB       │
│   (Vercel)       │         │     (Render)           │        │  (MongoDB Atlas) │
└─────────────────┘          └──────────────────────┘         └─────────────────┘
↑                            ↑
react-router-dom            JWT Auth Middleware
recharts (charts)           bcryptjs (hashing)
qrcode.react (QR)           nanoid (short codes)

---

## ✅ Features Implemented

### Mandatory
- ✅ **Authentication** — Signup, Login, JWT-protected routes
- ✅ **URL Shortening** — Unique short codes via nanoid, URL validation
- ✅ **User Dashboard** — View all links, original URL, short URL, created date, click count
- ✅ **Delete** shortened URLs
- ✅ **Copy** short URL from UI

### Analytics
- ✅ Click count per short URL
- ✅ Timestamp of each visit
- ✅ Analytics page per URL
- ✅ Total click count, last visited, recent history (last 10)
- ✅ Browser breakdown (Chrome, Firefox, Safari, Edge)
- ✅ Device breakdown (Desktop, Mobile, Tablet)
- ✅ Daily clicks chart (last 30 days)

### UI
- ✅ Responsive interface
- ✅ Clean dark dashboard layout
- ✅ Loading, success, and error states
- ✅ Form validation messages

### Bonus
- ✅ Custom alias for short URL
- ✅ QR code generation per link
- ✅ Expiry date for links
- ✅ Device/browser analytics
- ✅ Charts for daily click trends
- ✅ Edit destination URL
- ✅ Search/filter links

---

## 🛠️ Tech Stack

| Layer      | Technology                                                  |
|------------|-------------------------------------------------------------|
| Frontend   | React 18, React Router v6                                   |
| Styling    | Custom CSS, Google Fonts (Syne)                             |
| Charts     | Recharts                                                    |
| QR Codes   | qrcode.react                                                |
| Backend    | Node.js + Express.js                                        |
| Database   | MongoDB + Mongoose ODM                                      |
| Auth       | JWT (jsonwebtoken) + bcryptjs                               |
| URL Codes  | nanoid                                                      |
| Security   | helmet, express-rate-limit, cors                            |
| Deployment | Vercel (Frontend), Render (Backend), MongoDB Atlas (DB)     |

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

cp .env.example .env
# Edit .env:
#   MONGODB_URI=mongodb://localhost:27017/urlshortener
#   JWT_SECRET=your_secret_key_here
#   BASE_URL=https://url-shortener-see3.onrender.com
#   PORT=5000

npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install

echo "REACT_APP_API_URL=https://url-shortener-see3.onrender.com/api" > .env

npm start
```

---

## 🔌 API Endpoints

| Method | Endpoint                  | Auth | Description              |
|--------|---------------------------|------|--------------------------|
| POST   | /api/auth/signup          | No   | Register new user        |
| POST   | /api/auth/login           | No   | Login, get JWT           |
| GET    | /api/auth/me              | Yes  | Get current user         |
| POST   | /api/urls                 | Yes  | Create short URL         |
| GET    | /api/urls                 | Yes  | Get all user's URLs      |
| GET    | /api/urls/:id/analytics   | Yes  | Get analytics for URL    |
| PUT    | /api/urls/:id             | Yes  | Update URL               |
| DELETE | /api/urls/:id             | Yes  | Delete URL               |
| GET    | /r/:code                  | No   | Redirect to original URL |

---

## 🔒 Security

- Passwords hashed with **bcryptjs** (12 salt rounds)
- **JWT tokens** for stateless authentication
- Rate limiting (100 req / 15 min per IP)
- **Helmet.js** for HTTP security headers
- CORS configured for allowed origins
- Backend validation on all inputs
- No external URL shortening service used

---

## 📐 Assumptions Made

- Short codes are 7 characters (alphanumeric) generated via nanoid
- Custom aliases must be alphanumeric with hyphens/underscores
- Analytics store last N clicks in the URL document (embedded for performance)
- Each user can only manage their own URLs (no admin panel)
- URL redirect uses HTTP 301 (permanent redirect)
- MongoDB is used as the database (not PostgreSQL)

---

## 📁 Project Structure
urlshort/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Url.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── urls.js
│   ├── server.js
│   └── .env.example
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

---

## 🤖 AI Planning Document

### How AI Was Used
- Claude (Anthropic) was used to generate the full-stack boilerplate, component structure, API design, and MongoDB schema
- Prompts were structured around the hackathon requirements, broken into backend, frontend, and deployment phases
- All generated code was reviewed, tested, and understood before submission

### Planning Steps
1. Broke down the problem statement into backend models, API routes, and frontend pages
2. Designed the MongoDB schema for User and URL with embedded analytics
3. Built backend auth and URL routes with JWT middleware
4. Built React frontend with protected routes and context-based auth
5. Added bonus features: QR codes, custom aliases, expiry dates, charts
6. Deployed frontend to Vercel and backend to Render

---

> This project is a part of a hackathon run by https://katomaran.com