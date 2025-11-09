# Y-Ultimate Management Platform 🥏

A comprehensive web platform for managing Ultimate Frisbee tournaments, teams, coaching programs, and community engagement for underprivileged youth.

---

## 🌟 Features

### Tournament Management
- **Create & Manage Tournaments**: Full tournament lifecycle management
- **Match Scheduling**: Automated match generation with field assignments
- **Live Scoring**: Real-time score updates and match results
- **Spirit Scores**: Track Spirit of the Game scores per match
- **Bracket Generation**: Support for Round Robin, Pool Play, and Elimination formats
- **Media Gallery**: Upload and share tournament photos and videos
- **Sponsor Management**: Showcase tournament sponsors with tier-based display

### Team Management
- **Team Registration**: Easy team creation and management
- **Player Roster**: Add registered players or manual entries
- **Team Following**: Follow favorite teams for updates
- **Tournament Registration**: Register teams for upcoming tournaments

### Coaching & Community
- **Program Management**: Track coaching programs and batches
- **Session Tracking**: Record coaching sessions and attendance
- **Child Assessments**: Monitor progress with Spirit of the Game metrics
- **Home Visits**: Document community engagement activities
- **Progress Reports**: Generate comprehensive reports

### User Roles & Permissions
- **Players**: View tournaments, join teams, track stats
- **Team Managers**: Create teams, manage rosters, register for tournaments
- **Tournament Directors**: Create tournaments, manage schedules, approve registrations
- **Coaches**: Track sessions, record assessments, manage programs
- **Volunteers**: Update scores, check attendance
- **Spectators**: View tournaments and follow teams

### Additional Features
- **Announcements**: Tournament-specific announcements and updates
- **Match Predictions**: Users can predict match outcomes
- **Visitor Management**: Track tournament visitors and check-ins
- **Role Approval System**: Request elevated roles with admin approval
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** ([Download](https://git-scm.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/y-ultimate-platform.git
   cd y-ultimate-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
<!--
3. **Set up Supabase**
   - Create a Supabase account at [supabase.com](https://supabase.com)
   - Create a new project
   - Go to **SQL Editor** and run the `database-schema.sql` file from this repo
   - Get your API credentials from **Settings → API**:
     - Project URL
     - anon public key

4. **Configure environment variables**
   
   Create a `.env.local` file in the project root:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
-->
4. **Configure environment variables**
  Create a `.env.local` file in the project root:
   ```env
   VITE_MONGOOSE_URL=your_mongoose_project_url
   ```
5. 
6. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

---

## 📁 Project Structure

```
y-ultimate-platform/
├── public/                     # Static assets
│   └── logo.png               # Y-Ultimate logo
├── src/
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── layout/           # Navbar, Layout
│   │   ├── teams/            # Team management
│   │   ├── tournaments/      # Tournament features
│   │   └── coaching/         # Coaching program components
│   ├── context/              # React Context
│   │   └── AuthContext.jsx   # Authentication context
│   ├── lib/                  # Utilities
│   │   └──mongoDB.js         # Database                                    <!--supabase.js  # Supabase client-->     
│   ├── pages/                # Page components
│   │   ├── auth/             # Login, Signup
│   │   ├── teams/            # Team pages
│   │   ├── tournaments/      # Tournament pages
│   │   └── Dashboard.jsx     # Main dashboard
│   ├── App.jsx               # Main app with routing
│   └── main.jsx              # Entry point
├── database-schema.sql       # Database setup (run in Supabase)
├── .env.local                # Environment variables (create this)
├── .gitignore
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---
<!--
## 🗄 Database Schema

The platform uses **32 interconnected tables** managed by Supabase (PostgreSQL):

### Core Tables
- `profiles` - User accounts and roles
- `teams` - Team information
- `team_players` - Player rosters
- `tournaments` - Tournament details
- `matches` - Match schedules and results
- `spirit_scores` - Spirit of the Game tracking

### Coaching Tables
- `programmes`, `batches`, `sessions`
- `children`, `coaches`, `assessments`
- `attendance`, `home_visits`

### Tournament Features
- `tournament_registrations` - Team registrations
- `fields` - Field management
- `sponsors` - Sponsor information
- `announcements` - Tournament updates
- `tournament_media` - Photos and videos

### User Engagement
- `team_followers` - Team following system
- `match_predictions` - Match prediction game
- `visitors` - Visitor check-in system
- `approval_requests` - Role upgrade requests

For complete schema details, see `database-schema.sql`

---
-->  
## 🎯 Getting Started Guide

### 1. Create Your Account

Visit `/signup` and create an account with one of these roles:
- **Player** - Join teams and participate
- **Team Manager** - Create and manage teams
- **Spectator** - View tournaments

> **Note**: Coach and Tournament Director roles require admin approval for security.

### 2. As a Team Manager

1. Navigate to "My Teams"
2. Click "Create Team"
3. Fill in team details (name, age division, location)
4. Add players:
   - Search for registered players
   - Or add players manually
5. Register for tournaments

### 3. As a Tournament Director

1. Create a tournament with details
2. Set up fields
3. Approve team registrations
4. Generate match schedule
5. Monitor live scores
6. Manage announcements

### 4. As a Coach

1. Create coaching programs
2. Set up batches and sessions
3. Take attendance
4. Record assessments
5. Generate progress reports

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 5173) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18.3.1, Vite 5.4.2 |
| **UI Framework** | Tailwind CSS 3.4.1 |
| **Component Library** | shadcn/ui (Radix UI) |
| **Backend** | MongoDB |<!--Supabase (PostgreSQL)-->  
| **Authentication** | Auth |<!--Supabase Auth--> 
| **Routing** | React Router v6 |
| **Icons** | Lucide React |
| **State Management** | React Context API |
| **Notifications** | Sonner (Toast) |

---

## 🔒 Security Features

✅ Row Level Security (RLS) enabled on all tables  
✅ Role-based access control (RBAC)  
✅ Secure authentication via Supabase Auth  
✅ Password hashing and secure session management  
✅ Environment variables for sensitive data  
✅ SQL injection prevention via Supabase client  
✅ CORS and security headers configured  

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```

4. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**

### Development Guidelines

- Follow React best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Test thoroughly before submitting PR
- Update documentation for new features

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

Need help?

- 📧 **Email**: ykchoudhary110@gmail.com, shubhshukla031@gmail.com, pal975416@gmail.com

---

<div align="center">

Made with ❤️ by **Team Odyssey**

[⭐ Star this repo](https://github.com/yourusername/y-ultimate-platform) • [🐛 Report Bug](https://github.com/yourusername/y-ultimate-platform/issues) • [✨ Request Feature](https://github.com/yourusername/y-ultimate-platform/issues)

</div>
