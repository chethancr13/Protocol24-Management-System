# Protocol 24 - Hackathon Management System

A state-of-the-art, real-time collaborative dashboard for managing large-scale hackathons. Protocol 24 provides a unified platform for organizers, mentors, and staff to coordinate logistics, participants, and volunteers seamlessly.

---

## 🚀 Key Features

### 🔐 Multi-User & RBAC (Role-Based Access Control)
- **Granular Permissions**: Automated access control for different team roles (Admin, Logistics, Tech, Finance, Registration).
- **Secure Authentication**: Multi-user login system with hardcoded secure credentials for core team members.
- **Collaborative Workspace**: Admins see who is online and which module they are currently editing in real-time.

### ⚡ Real-Time Synchronization
- **Centralized State Engine**: Powered by a custom `shared-storage` layer that synchronizes all modifications across all connected clients instantly.
- **No Manual Refresh**: Participant check-ins, team formations, and expense tracking update live on every user's dashboard.
- **Global Search**: Command Center (Cmd+K) allows for lightning-fast searching of live participants and pages.

### 🏗️ Operational Modules
- **Volunteers Management**: Manage staff roles (Hall Monitor, Registration, Tech Support), assigned rooms, and live status with inline editing support.
- **Seating Management**: Visualize and manage seating arrangements by Lab and Seminar Hall with team-based grouping.
- **Financial Tracking**: Real-time budget monitoring with categorical expense tracking and budget threshold alerts.
- **Project Submissions**: Track team projects and tracks (AI/ML, Web, Blockchain, Open Innovation).

### 🔔 Smart Monitoring & UI
- **Activity Feed**: A transparent, live log of all administrative actions taken by team members.
- **Global Alerts**: System-wide notifications for budget warnings (90% threshold) and high-priority mentor requests.
- **Premium Aesthetics**: High-performance UI with glassmorphism, dynamic transitions, and responsive dark-mode support.

---

## 🛠️ Technology Stack

- **Core**: React 18 + TypeScript
- **State**: Custom Real-time Shared State Engine (`window.storage` abstraction)
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **Notifications**: Sonner (Toast notifications)
- **Build**: Vite

---

## 💻 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/chethancr13/Protocol24-Management-System.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Access the dashboard**:
   The app will typically run at `http://localhost:8080` (or `http://localhost:5173`).

---

## 🔑 Default Credentials

Organizers can use the following default credentials to access the system:

| Role | Username | Password |
| :--- | :--- | :--- |
| Event Head | `admin` | `admin123` |
| Logistics Lead | `logistics` | `log123` |
| Tech Lead | `tech` | `tech123` |
| Finance Head | `finance` | `finance123` |
| Reg Coordinator | `registration` | `reg123` |

---

## 📄 License

This project is developed for **Protocol 24** hackathon management and demonstration. Developed by **NullPoint Team**.
