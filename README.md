# 🎓 MLR Student Portal — Computer Science & Engineering (Section - G)

Official academic and attendance portal for **MLR Institute of Technology (UGC Autonomous)**, Laxman Reddy Avenue, Dundigal, Hyderabad - 500 043. Connected to a live **SQLite** database containing verified academic records, subject-wise attendance, examination results, and administrative clearance for **II B.Tech I Semester (CSE-G)** under Class Incharge **Mrs. T. Sai Priyanka**.

---

## 📑 Table of Contents

- [Class & Branch Information](#-class--branch-information)
- [Official Subjects List](#-official-subjects-list)
- [Official Faculty Directory](#-official-faculty-directory)
- [Real-Time Flow & Features](#-real-time-flow--features)
  - [1. Authentication (Roll Number as Password)](#1-authentication-roll-number-as-password)
  - [2. Real-Time Dynamic Timetable & Live Active Class Banner](#2-real-time-dynamic-timetable--live-active-class-banner)
  - [3. Full Master Weekly Matrix Replica](#3-full-master-weekly-matrix-replica)
  - [4. Subject-Wise Attendance Breakdown](#4-subject-wise-attendance-breakdown)
  - [5. Interactive Calendar & Live Day Toggle](#5-interactive-calendar--live-day-toggle)
  - [6. Semester Marks & Evaluation Statements](#6-semester-marks--evaluation-statements)
  - [7. Official Document Downloads](#7-official-document-downloads)
  - [8. Complete CSE-G Class Directory (69 Students)](#8-complete-cseg-class-directory-69-students)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Quick Start Guide](#-quick-start-guide)
- [Login Credentials & Sample Students](#-login-credentials--sample-students)

---

## 🏛️ Class & Branch Information

| Field | Official Value |
|---|---|
| **Institution** | MLR Institute of Technology (UGC Autonomous) |
| **Department / Branch** | Department of Computer Science and Engineering |
| **Class / Course** | II B.Tech I Sem (CSE – G) |
| **Academic Year (A.Y.)** | 2026-27 |
| **With Effect From (W.E.F.)** | 20-July-2026 |
| **Classroom Venue** | Room No: **MG 107** |
| **Lab Venues** | **JC001** (OOPS & DBMS Labs), **MG405, MG406** (SE / Skill Lab) |
| **Class Incharge** | Mrs T. Sai Priyanka |
| **Attendance Reference Window** | 16-09-2026 To 30-09-2026 |
| **Enrolled Cohort Size** | 69 Verified Students |

---

## 📚 Official Subjects & Faculty Directory

Exact mapping from the official MLRIT departmental document:

| Subject Code | Subject Name | Short Key | Faculty Instructor | Venue |
|---|---|---|---|---|
| **A7CS07** | Discrete Mathematics | `DM` | Mrs P SasmitaKumari | MG 107 |
| **A7CS08** | Computer Organization and Architecture | `COA` | Dr. K. Venkata Subbaiah | MG 107 |
| **A7CS09** | Object Oriented Programming through java | `JAVA` | Dr. B MURALI KRISHNA | MG 107 |
| **A7CS11** | Software Engineering | `SE` | Mrs A Nagamani | MG 107 |
| **A7CS13** | Database Management Systems | `DBMS` | Dr Prameela Naga | MG 107 |
| **A7HS08** | Innovation and Entrepreneurship | `IOE` / `COE` | Mrs Hridayama Devvarma(MBA) | MG 107 |
| **A7CS10** | Object Oriented Programming through java Lab | `OOPS LAB` | Dr. B MURALI KRISHNA | JC001 |
| **A7CS12** | Software Engineering Lab | `SE LAB` | Mrs A Nagamani | MG405, MG406 |
| **A7CS14** | Database Management Systems Lab | `DBMS LAB` | Dr Prameela Naga | JC001 |
| **A7CS53** | Skill Development (Web Technologies) | `SKILL LAB` | Mr. V. Bala Krishna Reddy | MG405, MG406 |
| **A7BS12** | Environmental Science | `ES` | Dr Amrita Saha(S&H) | MG 107 |
| **SEMINARS** | Technical Seminars | `SEMINAR` | Dr K Chinnaiah | MG 107 |

---

## ⚡ Real-Time Flow & Features

### 1. Authentication (Roll Number as Password)
- Students can log in using **only their Roll Number** (e.g. `25R21A05JP`).
- The password is also the student's **Roll Number** (case-insensitive).
- Session tokens are stored in `localStorage`, maintaining login across browser refreshes.
- One-click quick login pills are available on the login page for instant testing.

### 2. Real-Time Dynamic Timetable & Live Active Class Banner
- Automatically synchronizes with the system clock:
  - Detects the current active day of the week (Monday through Saturday).
  - Matches the current local time against institutional slot intervals:
    - **Period 1**: `09:10 - 10:20`
    - **Period 2**: `10:20 - 11:20`
    - **Period 3**: `11:20 - 12:20`
    - **Lunch Break**: `12:20 - 01:10`
    - **Period 4**: `01:10 - 02:10`
    - **Period 5**: `02:10 - 03:10`
    - **Period 6**: `03:10 - 04:10`
- Displays a glowing **● ONGOING CLASS NOW** live banner detailing the current active class, faculty instructor, subject code, and classroom/lab location.
- Live clock that ticks every second and recalculates class status in real-time (`Ongoing`, `Completed`, `Upcoming`).

### 3. Full Master Weekly Matrix Replica
- Faithful digital recreation of the official notice board timetable photo for CSE-G.
- Toggle between **Day-by-Day view** (with interactive day tabs) and **Master Weekly Matrix** view.
- Complete 6-period matrix covering Mon–Sat with lunch break and faculty directory.

### 4. Subject-Wise Attendance Breakdown
- Full tabular report rendering conducted classes, attended classes, and percentage for each of the 12 subjects.
- Displays total conducted (`326`–`328`, or `281` for lateral entry), total attended, and total percentage.
- Automatic eligibility tagging: **Eligible (≥ 75%)** or **Condonation Required (< 75%)**.

### 3. Interactive Calendar & Live Day Toggle
- Renders an interactive monthly calendar for the semester.
- **Click to Toggle**: Clicking any weekday updates the database in real-time (`POST /api/attendance/:studentId/toggle`) and recalculates monthly metrics immediately.

### 4. Semester Marks & Evaluation Statements
- Complete course-by-course marks statement across all 12 subjects.
- Computes internal marks (/30), external marks (/70), total score (/100), credits, and grades (`O`, `A+`, `A`, `B+`, `B`, `COMPLETED`).

### 5. Official Document Downloads
- Generates official text documents with MLRIT institutional seal header:
  - **Attendance Statement**: Subject-wise conducted/attended breakdown and incharge signature.
  - **Provisional Semester Marks Memo**: Complete grade report with CGPA.
  - **Examination Hall Tickets**: Autonomous SEE & CIE schedules.
  - **Fee Receipts**: Itemized tuition and valuation fee receipts.

### 6. Complete CSE-G Class Directory (69 Students)
- Lists all 69 students from Section G.
- Searchable by student name or roll number (`25R21A...`, `26R25A...`).
- Filterable by attendance threshold: `All (69)`, `Eligible ≥ 75% (51)`, `Low Attendance < 75% (18)`.
- Detailed student dossiers with academic profiles and course breakdowns.

---

## 🛠️ Architecture & Tech Stack

```text
mlr-student-portal/
├── backend/                       # Node.js + Express + SQLite Backend
│   ├── students_data.js           # 69 student records from official PDF
│   ├── database.js                # SQLite schema & database seed logic
│   ├── portal.db                  # Local SQLite database file
│   ├── server.js                  # Express REST API & document generator
│   └── package.json               # Backend dependencies (express, cors)
│
├── frontend/                      # React 19 + TypeScript + Vite Frontend
│   ├── src/
│   │   ├── components/            # Layout, Sidebar, Topbar, StatCard
│   │   ├── pages/                 # Dedicated TSX pages
│   │   │   ├── LoginPage.tsx          # Real-time login (roll number = password)
│   │   │   ├── DashboardPage.tsx      # CSE-G student overview & schedule
│   │   │   ├── AttendancePage.tsx     # Full 12-subject attendance table & calendar
│   │   │   ├── TimetablePage.tsx      # Real-time timetable, live class banner & master matrix
│   │   │   ├── MarksPage.tsx          # Course marks statement across 12 subjects
│   │   │   ├── StatusPage.tsx         # Clearance checklist & condonation rule
│   │   │   ├── DownloadsPage.tsx      # Official certified document generator
│   │   │   ├── StudentsPage.tsx       # 69-student searchable directory
│   │   │   └── StudentProfilePage.tsx # Individual academic dossier
│   │   ├── services/api.ts        # Typed API client
│   │   ├── types/index.ts         # TypeScript interfaces
│   │   ├── App.css / index.css    # Polished design system
│   │   ├── App.tsx & main.tsx     # App shell & mounting
│   └── package.json               # Frontend dependencies & scripts
│
├── run-dev.js                     # Root launcher
├── package.json                   # Root orchestrator
└── README.md                      # Documentation
```

---

## 🚀 Quick Start Guide

### Start Both Backend and Frontend
From the root directory:

```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API & Database**: `http://localhost:5000`

---

## 🔑 Login Credentials & Sample Students

Every student logs in with their **Roll Number**, and their **password is also their Roll Number** (or you can leave password blank):

| S.No | Roll Number | Password | Student Name | Attended / Total | Attendance % | Status |
|---|---|---|---|---|---|---|
| **1** | `25R21A05JP` | `25R21A05JP` | ALAGANE GANESH GOUD | 285 / 326 | **87.42%** | Eligible |
| **4** | `25R21A05JT` | `25R21A05JT` | BANDARU KEERTHANA | 292 / 326 | **89.57%** | Eligible |
| **8** | `25R21A05JX` | `25R21A05JX` | BEKKAM BHANUPRASAD | 119 / 326 | **36.50%** | Warning |
| **26** | `25R21A05KG` | `25R21A05KG` | KODIPATHINA VAISHNAVI | 298 / 326 | **91.41%** | Eligible |
| **33** | `25R21A05KP` | `25R21A05KP` | KURAKULA PRANAY KUMAR | 184 / 328 | **56.10%** | Warning |
| **60** | `25R21A05LH` | `25R21A05LH` | VITTAL ROHITH | 303 / 328 | **92.38%** | Eligible (Top Rank) |
| **64** | `26R25A0538` | `26R25A0538` | DEVADI VENNELA | 209 / 281 | **74.38%** | Warning |

*(All 69 students from `25R21A05JP` to `26R25A0543` are active and ready to log in).*

---

## 🌐 Deploying to the Internet (Full-Stack with Backend & SQLite)

The project is configured as a **unified full-stack application**. In production, Express automatically serves the compiled React application from `frontend/dist`, handles all `/api/*` endpoints, and manages the SQLite database (`portal.db`). This means you only need to deploy **one service** to get a public URL for both frontend and backend.

### Option 1: Deploy on Render.com (Recommended — 100% Free)

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Deploy MLR Student Portal"
   git remote add origin https://github.com/<your-username>/mlr-student-portal.git
   git branch -M main
   git push -u origin main
   ```
2. **Log in to [Render.com](https://render.com)**.
3. Click **New +** → **Web Service**.
4. Connect your GitHub repository.
5. Fill in the deployment settings:
   - **Name**: `mlr-student-portal`
   - **Region**: Closest to you (e.g., Singapore / Frankfurt / Oregon)
   - **Runtime**: `Node`
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
6. Add Environment Variable:
   - Key: `NODE_VERSION`
   - Value: `22`
7. Click **Create Web Service**.
8. In 2 minutes, Render will provide a free live URL (e.g., `https://mlr-student-portal.onrender.com`).

*(Note: `render.yaml` is included in the project for automatic blueprint configuration).*

### Option 2: Deploy on Railway.app

1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select this repository.
4. Railway will automatically detect the `package.json` scripts (`build` and `start`) and deploy.
5. In **Settings** → **Networking**, click **Generate Domain** to get your public HTTPS link.

### Option 3: Deploy with Docker (Any Cloud Provider)

A production-ready [Dockerfile](file:///c:/Users/Bharath%20kumar/Downloads/mlr-student-portal/mlr-student-portal/Dockerfile) is included:

```bash
# Build the Docker image
docker build -t mlr-student-portal .

# Run locally or on a VPS (DigitalOcean, AWS, Linode)
docker run -p 5000:5000 mlr-student-portal
```
Accessible at `http://your-server-ip:5000`.

