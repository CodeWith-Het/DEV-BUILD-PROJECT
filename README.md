🚀 CollabCode — Real-Time AI-Powered Collaborative IDE

CollabCode is a low-latency, AI-augmented collaborative IDE engineered for real-time multi-user development. It combines Operational Transformation (OT), WebSocket-based synchronization, and AI-driven code intelligence to deliver a seamless, conflict-free coding experience across distributed teams.

📚 Table of Contents
System Architecture
Features
Directory Structure
Installation Guide
Environment Variables
API Reference
WebSocket Events
Contributing

🏗 System Architecture

CollabCode follows a client-server distributed architecture optimized for real-time collaboration and AI-assisted workflows.

At the frontend, a React + Monaco Editor instance captures granular user edits (character-level diffs). These edits are immediately dispatched via Socket.io to the backend. The backend acts as the central synchronization authority, where a custom-built Operational Transformation (OT) engine transforms incoming operations against concurrent edits from other users before broadcasting them.

Each collaboration session is scoped to an isolated room namespace, ensuring that events are strictly partitioned per workspace. The transformed operations are then broadcasted to all connected clients in the same room, guaranteeing strong eventual consistency across all editor instances.

Simultaneously, code snapshots can be sent to the Google Gemini 2.5 Flash API, where strict prompt engineering enforces structured JSON outputs. The backend parses and validates this JSON before sending it to the frontend, where Recharts renders analytical visualizations such as Radar Charts for code quality, security, and performance.

MongoDB Atlas persists user sessions, metadata, and audit logs, while Passport.js handles OAuth-based authentication.

✨ Features
🔄 Real-Time Collaborative Editing
Multi-user editing with sub-100ms latency
Character-level synchronization using WebSockets
Conflict-free editing powered by OT

🧠 AI-Powered Code Review
Integration with Gemini 2.5 Flash API
Enforced JSON schema responses
Analysis dimensions:
Code Quality
Security Vulnerabilities
Performance Efficiency

⚙️ Operational Transformation Engine
Custom OT implementation for concurrent edits
Handles:
Insert vs Insert conflicts
Insert vs Delete overlaps
Cursor position adjustments
Guarantees:
Convergence
Causality Preservation
Intention Preservation

📊 Dynamic Visualization
AI response parsed into structured metrics
Rendered using Recharts Radar Charts
Real-time updates on code analysis

🔐 Authentication & Authorization
OAuth 2.0 via Google & GitHub
Managed with Passport.js
Session-based authentication

🌐 Socket Architecture
Room-based isolation (roomId)
Efficient event broadcasting
Scalable connection handling

📁 Directory Structure
collabcode/
│
├── client/                # Frontend (React + Vite)
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── assets/        # Images, icons
│   │   ├── components/    # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Editor.jsx
│   │   │   └── Chart.jsx
│   │   │
│   │   ├── pages/         # Pages (Routing level)
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Dashboard.jsx
│   │   │
│   │   ├── hooks/         # Custom hooks
│   │   │   └── useSocket.js
│   │   │
│   │   ├── services/      # API & socket calls
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   │
│   │   ├── utils/         # Helper functions
│   │   │   └── helpers.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │
│   ├── vite.config.js
│   ├── package.json
│
│
├── server/                # Backend (Node + Express)
│   ├── controllers/       # Logic (business logic)
│   │   ├── authController.js
│   │   ├── codeController.js
│   │
│   ├── routes/            # API routes
│   │   ├── authRoutes.js
│   │   ├── codeRoutes.js
│   │
│   ├── models/            # MongoDB schemas
│   │   ├── User.js
│   │   ├── Code.js
│   │
│   ├── services/          # External services (AI, APIs)
│   │   ├── geminiService.js
│   │
│   ├── sockets/           # Socket.io logic
│   │   ├── socketHandler.js
│   │
│   ├── ot/                # Operational Transformation (collab editing)
│   │   ├── otHandler.js
│   │
│   ├── config/            # Config files
│   │   ├── db.js
│   │   ├── passport.js
│   │
│   ├── middleware/        # Custom middlewares
│   │   ├── authMiddleware.js
│   │
│   ├── server.js          # Main entry point
│   ├── .env               # Environment variables
│   ├── package.json
│
│
├── README.md
└── package.json (optional root)

⚙️ Installation Guide
🔧 Prerequisites
Node.js ≥ 18.x
npm / yarn
MongoDB Atlas account
Google & GitHub OAuth credentials
Gemini API access

📦 Clone Repository
git clone https://github.com/your-username/collabcode.git
cd collabcode

🖥️ Client Setup
cd client
npm install
npm run dev

🧠 Server Setup
cd server
npm install
npm run dev

🔐 Environment Variables
| Variable Name          | Description                     |
| ---------------------- | ------------------------------- |
| `PORT`                 | Server port (e.g., 3000)        |
| `MONGODB_URI`          | MongoDB Atlas connection string |
| `SESSION_SECRET`       | Secret for session encryption   |
| `GEMINI_API_KEY`       | Google Gemini API key           |
| `GOOGLE_CLIENT_ID`     | Google OAuth Client ID          |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret             |
| `GITHUB_CLIENT_ID`     | GitHub OAuth Client ID          |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Secret             |
| `CLIENT_URL`           | Frontend URL (for CORS)         |

📡 API Reference
| Method | Endpoint           | Description                  |
| ------ | ------------------ | ---------------------------- |
| GET    | `/api/auth/google` | Google OAuth login           |
| GET    | `/api/auth/github` | GitHub OAuth login           |
| GET    | `/api/auth/logout` | Logout user                  |
| GET    | `/api/user`        | Fetch authenticated user     |
| POST   | `/api/ai/review`   | Analyze code using Gemini AI |

🔌 WebSocket Events
| Event Name    | Payload                 | Description             |
| ------------- | ----------------------- | ----------------------- |
| `join_room`   | `{ roomId, userId }`    | Join collaboration room |
| `code_change` | `{ roomId, operation }` | Broadcast OT operation  |
| `sync_code`   | `{ roomId, content }`   | Initial state sync      |
| `leave_room`  | `{ roomId, userId }`    | Exit room               |
| `cursor_move` | `{ roomId, position }`  | Cursor tracking         |

🤖 AI Integration (Gemini 2.5 Flash)
Strict prompt engineering enforces:
{
  "quality": number,
  "security": number,
  "performance": number,
  "issues": [ ... ]
}
Backend validates schema before forwarding
Ensures:
Predictable parsing
No malformed responses
Deterministic UI rendering

📊 Visualization Pipeline
AI returns structured JSON
Backend sanitizes + forwards
Frontend maps metrics → Recharts format
Radar chart dynamically renders:
[
  { subject: "Quality", value: 85 },
  { subject: "Security", value: 70 },
  { subject: "Performance", value: 90 }
]

⚡ Socket Architecture
Each room = isolated namespace
Server maintains:
Active users map
Room state cache
Broadcasting strategy:
socket.to(roomId).emit("code_change", transformedOp);
Guarantees:
Minimal network overhead
No cross-room contamination
Horizontal scalability readiness
🤝 Contributing

We follow a professional, production-grade contribution workflow:

Fork the repository
Create a feature branch:
git checkout -b feature/your-feature
Commit changes with semantic messages:
feat: add OT conflict resolver
fix: resolve socket memory leak
Push and open a Pull Request
Guidelines:
Maintain code modularity
Write unit/integration tests
Follow ESLint & Prettier standards
Document non-trivial logic
