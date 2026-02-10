# Hackathon Management Dashboard

A modern web application that helps organizers manage a college hackathon efficiently — from participant registration to attendance tracking and team formation.

---

## 🚀 Project Overview

This system simulates a real hackathon control panel used by event coordinators.
It allows organizers to register participants, monitor their check-in/check-out status, and dynamically create teams only from participants who are physically present.

The application is fully frontend-based and stores all data in the browser using local storage.

---

## ✨ Features

### 1. Participant Registration

* Register participants with:

  * Full Name
  * Email
  * College / Organization
  * Primary Skill
  * Hackathon Track
* Validates email format
* Prevents duplicate registrations
* Automatically resets form after successful registration

### 2. Participant Dashboard

* View all participants in a table
* Search by name or email
* Filter by hackathon track
* Sort alphabetically
* Displays:

  * Name
  * Track
  * Skill
  * Team assignment
  * Check-in status

### 3. Check-In / Check-Out System

* Organizer can mark participants as:

  * Not Checked-In
  * Checked-In
  * Checked-Out
* Checked-out participants are automatically removed from teams
* Visual status badges (green, red, gray)

### 4. Team Management

* Create teams with unique names
* Assign participants to teams
* Maximum 4 members per team
* Prevents assigning non-checked-in participants
* Remove participants from teams

### 5. User Interface

* Modern dashboard layout
* Sidebar navigation
* Responsive design
* Card-based UI
* Animated feedback messages

---

## 🧠 Technology Stack

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn UI components
* Browser LocalStorage

---

## 💾 Data Handling

This project does not use a backend database.
All participant and team data are stored locally in the browser using LocalStorage, allowing the application to run entirely on the client side.

---

## 🛠️ Installation (Run Locally)

1. Clone the repository

```
git clone <your-repository-url>
```

2. Navigate to project folder

```
cd hackathon-management-dashboard
```

3. Install dependencies

```
npm install
```

4. Run development server

```
npm run dev
```

The app will start at:

```
http://localhost:5173
```

---

## 🌐 Live Demo

Hosted using GitHub Pages.

(Place your deployed website link here)

---

## 📌 Usage Scenario

During a hackathon event:

* Organizer registers participants at entry desk
* Marks attendance using check-in button
* Forms teams from present participants
* Tracks teams and participation live

---

## 👤 Author
Vaishnavi Deshpande

---

## 📄 License

This project is for academic and demonstration purposes.


