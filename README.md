# Proaffiliaters Team & Task Manager

> **Official internal command center for the Proaffiliaters engineering & product team.**  
> Purpose-built to manage **New Upcoming Features**, **Ongoing Projects** (with priority-wise task scheduling), and **Fix & Updates**.

---

## 🚀 Key Modules

### 1. 💡 New Upcoming Features
- Ideation and feature proposal station.
- Document title, technical description, target timeline (quarter/month), priority, and tags.
- Team voting system with real-time upvote tallies.
- Track status: `Idea` ➔ `In Research` ➔ `Approved` ➔ `In Progress` ➔ `Completed`.

### 2. 🗂 Ongoing Projects (Project-Centric Task Engine)
- One project encapsulates multiple tasks (e.g. *Prowasp Telegram Bot*, *Web Application*, *Deals Scraper*).
- Team enters the project name first.
- Under each project, tasks are organized **strictly in priority order** (`P0 Urgent`, `P1 High`, `P2 Normal`, `P3 Low`).
- Interactive **Priority Reordering**: Move tasks up or down to dynamically update priority ranks (`#1`, `#2`, `#3`...).
- Subtask checklist with completion tracking.
- Dual views: **Priority Order List** and **Kanban Columns**.

### 3. 🛠 Fix & Updates
- Central hub for reporting and deploying fixes.
- Document issue title, detailed description, and root cause analysis.
- Track affected subsystems (e.g., Telegram Bot, Scraper Worker, Next.js Web Client, Payment Gateway).
- Severity classification: `Critical`, `Major`, `Minor`, `Patch`.
- Resolution & patch notes with release version tags (`v2.1.4`).

---

## 🎨 Brand Design & Aesthetics

- Mirrored directly from the **Proaffiliaters Web Application**:
  - Deep Indigo/Navy `#0d1033` dark canvas.
  - Electric Indigo `#4f6ef7` primary brand glow & `#7c3aed` purple accents.
  - Translucent glassmorphism (`backdrop-filter: blur(16px)`).
  - Modern typography: `Plus Jakarta Sans` for headings and `DM Sans` for body.
  - Official Proaffiliaters logo (`/logo.png`) and team avatars.

---

## 🔌 Running on Unique Port

The application is configured to run on dedicated port **3050**:

```bash
# Start development server on port 3050
npm run dev

# If port 3050 is in use, start on alternative port 3055
npm run dev:alt

# Build production bundle
npm run build
```

---

## 📦 Data Backup & Persistence

- Instant local persistence via `localStorage`.
- **Backup Export**: 1-click download of the complete database as a structured JSON file.
- **Restore Import**: Restore data from any saved JSON file.
- **Sample Reset**: Re-seed with default Proaffiliaters projects (Prowasp bot, scrapers, web app) anytime.

---

## 🤖 AI Agent Guidelines

Before editing any code in this repository:
1. Review [projectinfo.md](file:///c:/Users/spush/OneDrive/Desktop/Proaffiliaters/Team%20And%20Task%20Manager/projectinfo.md).
2. Follow the mandatory rules in [AGENTS.md](file:///c:/Users/spush/OneDrive/Desktop/Proaffiliaters/Team%20And%20Task%20Manager/AGENTS.md).
