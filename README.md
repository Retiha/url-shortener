# 🔗 LinkSnap — URL Shortener with Analytics

A full-stack URL shortening platform with click analytics, custom aliases, QR code generation, and detailed usage insights.

---

## 🚀 Live Demo

- 🎥 **Demo Video:** [Watch on Loom](https://www.loom.com/share/c75afe15358941de8a8720acdd5d2bf6)
- 🌐 **Live Frontend:** [url-shortener-ge13.vercel.app](https://url-shortener-ge13.vercel.app)
- ⚙️ **Live Backend:** [url-shortener-see3.onrender.com](https://url-shortener-see3.onrender.com)

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│  React Frontend │ ←REST→  │  Node.js/Express API  │  ←ODM→  │    MongoDB      │
│    (Vercel)     │         │      (Render)         │         │ (MongoDB Atlas) │
└─────────────────┘         └──────────────────────┘         └─────────────────┘
        ↑                              ↑
 react-router-dom              JWT Auth Middleware
 recharts (charts)             bcryptjs (hashing)
 qrcode.react (QR)             nanoid (short codes)
```

---

## ✅ Features

### Core
- 🔐 **Authentication** — Signup, Login, JWT-protected routes
- 🔗 **URL Shortening** — Unique short codes via nanoid, with URL validation
- 📋 **User Dashboard** — View all links, original URL, short URL, created date, click count
- ✏️ **Edit** destination URL
- 🗑️ **Delete** shortened URLs
- 📋 **Copy** short URL from UI
- 🔍 **Search/filter** links

### Analytics
- 📊 Click count per short URL
- 🕐 Timestamp of each visit
- 📈 Analytics page per URL (total clicks, last visited, recent history)
- 🌐 Browser breakdown (Chrome, Firefox, Safari, Edge)
- 📱 Device breakdown (Desktop, Mobile, Tablet)
- 📅 Daily clicks chart (last 30 days)

### Bonus
- 🏷️ Custom alias for short URL
- 📷 QR code generation per link
- ⏳ Expiry date for links
- 🎨 Clean dark dashboard layout
- 📱 Fully responsive interface

---

## 🛠️ Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, React Router v6                       |
| Styling    | Custom CSS, Google Fonts (Syne)                 |
| Charts     | Recharts                                        |
| QR Codes   | qrcode.react                                    |
| Backend    | Node.js + Express.js                            |
| Database   | MongoDB + Mongoose ODM                          |
| Auth       | JWT (jsonwebtoken) + bcryptjs                   |
| URL Codes  | nanoid                                          |
| Security   | helmet, express-rate-limit, cors                |
| Deployment | Vercel (Frontend), Render (Backend), MongoDB Atlas (DB) |

---

## 📦 Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm

### 1. Clone the repository
```bash
git clone <repo-url>
cd urlshort
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/urlshortener
JWT_SECRET=your_secret_key_here
BASE_URL=https://url-shortener-see3.onrender.com
PORT=5000
```

```bash
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

## 📐 Design Decisions

- Short codes are 7 characters (alphanumeric) generated via nanoid
- Custom aliases support alphanumeric characters with hyphens/underscores
- Analytics are stored as embedded documents per URL (optimized for read performance)
- Each user can only manage their own URLs
- URL redirect uses HTTP 301 (permanent redirect)
- MongoDB chosen for flexible schema and fast prototyping

---

## 📁 Project Structure

```
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
```

---

## 👩‍💻 Author

**Retiha C**  
Full-Stack Developer | CSE Final Year  
[GitHub](#) • [LinkedIn](#)