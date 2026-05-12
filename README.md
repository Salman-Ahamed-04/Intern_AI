# 🎓 InternAI — AI-Powered Internship Recommendation System

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

**An intelligent full-stack platform that connects students with the right internship opportunities using smart matching algorithms.**

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧠 About

**InternAI** is a full-stack MERN application designed to streamline the internship search and recruitment process. It provides a centralized dashboard for managing candidates, companies, applications, interviews, and AI-driven match recommendations — helping students find the perfect internship fit based on their skills and preferences.

---

## ✨ Features

- **🔐 Authentication** — Secure JWT-based login and registration system
- **📊 Dashboard** — Real-time overview with key metrics and analytics
- **👤 Candidate Management** — Browse, search, and manage candidate profiles
- **🏢 Company Management** — View and manage registered companies
- **📝 Applications Tracking** — Track application statuses end-to-end
- **🤖 AI Matching** — Intelligent candidate-to-internship matching engine
- **🗓️ Interview Scheduling** — Manage and track interview pipelines
- **📈 Analytics** — Visual analytics with charts and insights
- **🌙 Modern UI** — Glassmorphism design with smooth animations

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI library |
| React Router v6 | Client-side routing |
| Vite | Build tool & dev server |
| Lucide React | Icon library |
| Vanilla CSS | Styling with glassmorphism effects |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB | NoSQL database |
| Mongoose | ODM for MongoDB |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |

---

## 📁 Project Structure

```
Intern_AI/
├── internai-frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # Sidebar, Navbar, Layout
│   │   │   └── pages/          # Dashboard, Candidates, Companies,
│   │   │                       # Applications, Matches, Interviews,
│   │   │                       # Analytics, Login
│   │   ├── lib/                # API utilities
│   │   ├── store/              # State management
│   │   ├── App.jsx             # Root component with routing
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── internai-backend/           # Node.js + Express backend
│   ├── src/
│   │   ├── config/             # Database configuration
│   │   ├── controllers/        # Route handlers
│   │   ├── data/               # Seed data scripts
│   │   ├── middleware/         # Auth & validation middleware
│   │   ├── models/             # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Candidate.js
│   │   │   ├── Company.js
│   │   │   ├── Application.js
│   │   │   ├── Match.js
│   │   │   └── Interview.js
│   │   ├── routes/             # API route definitions
│   │   └── server.js           # App entry point
│   ├── .env                    # Environment variables (not tracked)
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ — [Download](https://nodejs.org/)
- **MongoDB** — [Install locally](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Git** — [Download](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Salman-Ahamed-04/Intern_AI.git
   cd Intern_AI
   ```

2. **Setup the backend**
   ```bash
   cd internai-backend
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in `internai-backend/`:
   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   MONGO_URI=mongodb://localhost:27017/internship_recommendation_db
   ```

4. **Seed the database** *(optional)*
   ```bash
   npm run seed
   ```

5. **Setup the frontend**
   ```bash
   cd ../internai-frontend
   npm install
   ```

### Running the Application

Open **two terminals**:

```bash
# Terminal 1 — Backend (port 5000)
cd internai-backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd internai-frontend
npm run dev
```

Then visit **http://localhost:5173** in your browser.

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login & receive JWT |
| `GET` | `/api/dashboard` | Dashboard statistics |
| `GET` | `/api/candidates` | List all candidates |
| `GET` | `/api/companies` | List all companies |
| `GET` | `/api/applications` | List all applications |
| `GET` | `/api/matches` | AI-generated matches |
| `GET` | `/api/interviews` | Interview schedules |
| `GET` | `/api/analytics` | Analytics data |
| `GET` | `/api/health` | API health check |

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ by [Salman Ahamed](https://github.com/Salman-Ahamed-04)**

</div>
