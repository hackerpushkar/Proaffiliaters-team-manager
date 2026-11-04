# Proaffiliaters Team & Task Manager — Master Architecture Guide (`projectinfo.md`)

> **NOTICE FOR DEVELOPERS AND AI AGENTS:**  
> **READ THIS FILE FIRST** before modifying any code in this repository.  
> It outlines the design system, component hierarchy, data models, persistence lifecycle, and developer rules for **Proaffiliaters Team & Task Manager**.

---

## Table of Contents
1. [Project Overview & Brand Identity](#1-project-overview--brand-identity)
2. [Project Structure & Directory Layout](#2-project-structure--directory-layout)
3. [Design System & Aesthetics (Light & Dark Modes)](#3-design-system--aesthetics-light--dark-modes)
4. [Core Modules](#4-core-modules)
   - [Module 1: Major & Minor Tasks (Hierarchy Engine)](#module-1-major--minor-tasks-hierarchy-engine)
   - [Module 2: New Upcoming Features](#module-2-new-upcoming-features)
   - [Module 3: Fix & Updates (Bug Tracking & Patch Logs)](#module-3-fix--updates-bug-tracking--patch-logs)
5. [State Management & Data Persistence](#5-state-management--data-persistence)
6. [Unique Port & Network Deployment](#6-unique-port--network-deployment)
7. [Developer Guidelines & File Header/Footer Standards](#7-developer-guidelines--file-headerfooter-standards)

---

## 1. Project Overview & Brand Identity

### What is Proaffiliaters Team & Task Manager?
**Proaffiliaters Team & Task Manager** is the internal command center for the Proaffiliaters development and operations team. It provides a modern workspace to:
1. Track **Ongoing Projects** (initiatives such as *Make Prowasp Telegram Bot*, *Proaffiliaters Web Application*, and *AutoPilot Deals Harvesting Daemon*), each containing multiple prioritized **Tasks** arranged strictly in priority sequence (P0 Urgent, P1 High, P2 Normal, P3 Low) with 1-click reordering controls.
2. Brainstorm and plan **New Upcoming Features** before development starts.
3. Log, triage, and resolve **Fix & Updates** with root cause descriptions, affected subsystems, severity levels, and patch changelogs.

### Visual & Brand Alignment
The application utilizes the pixel-perfect design system from the **Figma Redesign** (`https://fish-stack-04160070.figma.site`):
- **Default Light Mode**: Soft grey-lavender canvas (`#f5f6fa`), pure white (`#ffffff`) cards with crisp borders (`#e7e9f1`), dark ink text (`#161d2d`), and electric brand blue buttons (`#5268f6` with hover `#3d50df`).
- **Dark Mode**: Deep midnight navy canvas (`#0d1222`), elevated cards (`#131930`), borders (`#242c4b`), and electric blue accents (`#5268f6`).
- **Typography**: `Manrope` (weights 600, 700, 800) for titles, headings, and bold KPI metrics; `DM Sans` (400, 500, 600, 700) for body and UI elements; `JetBrains Mono` for IDs and code tags.
- **Brand Mark**: Gradient `145deg, #5268ff, #9b5cf5` with 40×40px rounded box and bold "P" mark.
- **Uniform Pills**:
  - Green (`pill-green`): `#e8faf4`, text `#0da77c`
  - Amber (`pill-amber`): `#fff5df`, text `#d78607`
  - Red (`pill-red`): `#ffedef`, text `#e7424e`
  - Purple (`pill-purple`): `#f5eaff`, text `#9650dc`
  - Blue (`pill-blue`): `#eaedff`, text `#4e61e9`
- **Official Assets**: Uses official Proaffiliaters logos (`/logo.png`, `/logo_icon.png`, `/founder.jpg`, `/prowasp_brand_logo.png`, `/profit_bot_logo.png`) directly from `public/`.

---

## 2. Project Structure & Directory Layout

```text
Team And Task Manager/
├── .next/                         # Next.js build cache and runtime
├── app/
│   ├── globals.css                # CSS variables, custom scrollbars, Figma pills, glassmorphism
│   ├── layout.tsx                 # Root layout with Manrope & DM Sans fonts
│   └── page.tsx                   # Main dashboard view switching between 6 core categories
├── components/
│   ├── Header.tsx                 # 76px Figma header with search, cross-category matches, Done chip, and invitations
│   ├── Sidebar.tsx                # 260px Figma sidebar with 6 navigation tabs, active project dots, and admin portal
│   ├── OngoingProjectsView.tsx    # Initiatives Hub (Tier 1) and Dedicated Project Workspace (Tier 2)
│   ├── UpcomingFeaturesView.tsx   # Category 1: Brainstorming & voting upcoming features with 4 roadmap stats
│   ├── FeatureDetailView.tsx      # Full-page feature research workspace
│   ├── FixUpdatesView.tsx         # Category 3: Bug triage, severity tracking & patch changelogs
│   ├── MyTasksView.tsx            # Personal task workspace with status checkboxes and due date highlights
│   ├── TeamMembersView.tsx        # Organization directory with presence indicators and role profiles
│   ├── TeamOverviewView.tsx       # Executive dashboard with 4 KPI stat cards and priority distribution
│   ├── TaskSlideOverDrawer.tsx    # Right-side sliding drawer for instant task inspection
│   ├── TaskModal.tsx              # Create/Edit Minor Task drawer with priority & subtasks
│   ├── ProjectModal.tsx           # Create/Edit Major Project drawer
│   ├── FeatureModal.tsx           # Create/Edit Feature drawer
│   ├── FixModal.tsx               # Create/Edit Fix & Update drawer
│   ├── InviteTeammateModal.tsx    # Gmail teammate invitation drawer
│   └── ui/                        # Reusable UI atoms (Badges, Buttons, Inputs)
├── lib/
│   ├── types.ts                   # Master TypeScript interfaces (ActiveTab: overview, projects, features, fixes, tasks, members)
│   ├── store.tsx                  # React Context store with LocalStorage sync & MongoDB API persistence
│   └── defaultData.ts             # Rich initial data for Proaffiliaters (Prowasp, Profit bot, etc.)
├── public/                        # Official Proaffiliaters brand assets and avatars
├── AGENTS.md                      # Mandatory AI agent instructions & protocol
├── projectinfo.md                 # Master Architecture Guide (this file)
├── package.json                   # Dependencies, scripts, unique port 3050 definition
├── tailwind.config.ts             # Tailwind CSS tokens mirroring Figma redesign
└── tsconfig.json                  # TypeScript compiler configuration
```

---

## 3. Design System & Aesthetics (Light & Dark Modes)

### Color Palette Variables
| Token | Light Value (Default) | Dark Value | Semantic Purpose |
|---|---|---|---|
| `--background` | `#f5f6fa` | `#0d1222` | Master canvas background |
| `--card` | `#ffffff` | `#131930` | Elevated card surfaces |
| `--foreground` | `#161d2d` | `#f1f4fb` | Primary text |
| `--primary` | `#5268f6` | `#5268f6` | Primary buttons, active tabs, brand glow |
| `--accent` | `#9b5cf5` | `#9b5cf5` | Secondary badges, gradient accents, highlights |
| `--border` | `#e7e9f1` | `#242c4b` | Subtle divider and card outlines |
### SSR & Hydration Resilience
- **Root Element Warning Suppression**: `app/layout.tsx` defines `<html lang="en" suppressHydrationWarning>` to prevent Next.js SSR mismatch warnings when client themes toggle the `dark` class on the `<html>` element.
- **Client-Mounted Theme Guard**: Components rendering dynamic theme toggle icons (`Sun` vs `Moon`) in `components/Header.tsx` and `app/admin/page.tsx` utilize a client-mounted lifecycle guard (`mounted && isDark`). Initial SSR and client hydration state strictly align to light mode defaults before reading `localStorage` (`proaffiliaters_theme`), eliminating SVG/path React hydration mismatch errors.

---

## 4. Core Modules

### Module 1: Ongoing Projects & Tasks (Two-Tier Workspace Architecture)
- **Tier 1 (Initiatives Hub / Enterprise Project Containers)**: Lightweight, high-density row containers matching Linear & Vercel design standards:
  - **Clean Header Ribbon**: High-density KPI metric bar (`Active Projects`, `Pending Tasks`, `Sprint Progress` with colored indicator dots) and sleek primary action buttons.
  - **Visual Hierarchy**: Refined project cards featuring a subtle status indicator dot (🟢 `Active`, 🟡 `On Hold`), soft category chips, discreet 9-dot drag handle (`Grip`), project lead avatar, and 1-line description snippet.
  - **Metrics Cluster**: Overlapping team avatar stack with quick `+ Invite` trigger, compact deliverables progress meter (`completed/total tasks • progress%`), and a clean, refined `Workspace →` button.
  - **Sidebar Navigation**: Lightweight quiet active states (`bg-primary/10 text-primary border border-primary/25`) with monospace numeric counter badges, replacing heavy solid-color blocks.
- **Auto-Hold & Single Active Project Policy**: Ensures strict team focus by allowing only 1 active Ongoing Project at a time. Whenever a new project is created or an on-hold project is resumed, any other currently active project is automatically transitioned to **“On Hold”** (`paused`). The Hold/Resume controls are housed inside the dedicated project workspace (Tier 2) to maintain a clean Hub interface.
- **9-Dot Container Drag & Drop Reordering**: Fluid vertical drag & drop with glowing insertion indicator bars above or below the target card. Position changes are saved to `localStorage` and synced to MongoDB with custom `order` indexing.
- **Tier 2 (Dedicated Full-Page Project Workspace)**: Clicking "Continue Workspace →" or selecting a project from the sidebar opens a focused full-page workspace for that project, equipped with breadcrumb navigation (`← Back to All Projects`) and three multi-view modes:
  1. **Hierarchy Tree View**: Linear-style compact task list with 9-dot drag handles (`Grip`) for fluid vertical drag-and-drop priority rank repositioning, priority rank reordering buttons (▲/▼), P0-P3 badges, and expandable checklist drawers.
  2. **Kanban Board View**: 5-column agile workflow (`Backlog`, `To Do`, `In Progress`, `Review`, `Done`) with 1-click status changers and click-to-slide task inspection.
  3. **Table Grid View**: Enterprise spreadsheet matrix for high-speed triage, sorting, and scanning.
- **Unified Right-Side Slide-Over Drawer System**:
  - Eliminates all center pop-up modals across the entire application in favor of smooth, right-side sliding windows (`animate-slideInRight`) with dimmed backdrop blur (`backdrop-blur-xs`), sticky action footers, and top brand gradient lines.
  - **Task Slide-Over Drawer (`TaskSlideOverDrawer.tsx` & `TaskModal.tsx`)**: Clicking any task slides open the peek drawer for live inspection, while clicking `+ Add Task` or "Open full editor" glides open the comprehensive right-side editor with P0-P3 segmented pills, status lifecycle switchers, avatar picker, quick due-date presets (`+3d`, `+1w`, `+2w`), tag chips, and live subtask checklist meters.
  - **Project Slide-Over Drawer (`ProjectModal.tsx`)**: Right-side drawer for creating and editing Ongoing Projects with category tags, team lead selection, status pills (Active, On Hold, Planning, Completed), brand theme color palette, and teammate Gmail invitation input.
  - **Feature Slide-Over Drawer (`FeatureModal.tsx`)**: Right-side drawer for proposing and updating Upcoming Features with lifecycle phase badges (`Thinking`, `Research`, `Ready to Go`, `Future Build`), target timelines, and tag management.
  - **Fix & Update Slide-Over Drawer (`FixModal.tsx`)**: Right-side drawer for logging bugs and posting platform releases with severity pills (`Critical`, `Major`, `Minor`, `Patch`), affected subsystem datalists, and changelog verification notes.
  - **Teammate & Member Drawers (`InviteTeammateModal.tsx`, `MemberModal.tsx`)**: Right-side slide-over windows for project collaboration and administrator credential provisioning.
- **9-Dot Task Priority Repositioning**: In addition to 1-click ▲/▼ buttons, each task features a 9-dot grip square to smoothly drag and drop deliverables to any priority rank, automatically re-indexing `#1`, `#2`, `#3`... with animated insertion lines.
- **Rapid Inline Task Creator**: Type a task title, choose priority (`P0` through `P3`), and press `Enter` to add tasks instantly inside the project workspace without opening heavy modal dialogs.
- **Priority Rank Reordering**: Tasks are ordered strictly `#1`, `#2`, `#3`... with 1-click **▲ (Move Up)** and **▼ (Move Down)** buttons.
  - **P0 • Urgent**: Blocking/critical path deliverable.
  - **P1 • High**: Primary sprint priority.
  - **P2 • Normal**: Standard deliverable.
  - **P3 • Low**: Polish / edge-case item.
- **Interactive Checklists**: Expandable checklist drawer with live percentage completion.
- **Dedicated Workspace Filters Panel**: A separate `Filters` trigger button showing active count badges, housing Project selectors, Status filters, Priority filters, and an active filter chips row with 1-click reset.
- **Project Lifecycle Management (Close & Reopen)**: Each project features a `Close Project` button to archive completed initiatives out of the active view, and a `Reopen` button to restore them. Closed projects are automatically hidden from the left sidebar Projects quick list to keep navigation focused purely on active initiatives.
- **"Show Closed Projects" Toggle**: Inside the Filter Panel, a dedicated toggle button lets users inspect and restore closed/archived projects at any time.
- **"All Unfinished" Active Filter**: 1-click toolbar toggle and dropdown option to instantly screen out completed tasks and display only actionable deliverables.
- **Dynamic Work Percentage & Progress KPIs**:
  - Live progress tracking strictly reflects active pending work: 0% when fresh tasks are assigned, scaling up as tasks are completed, and reaching 100% when all tasks are complete or when a project is closed.
  - Closed projects and their deliverables are marked 100% completed. If all projects in the workspace are closed, global workspace progress registers 100% with 0 pending items.
  - Streamlined command ribbon: displays `Tasks`, `Pending`, and `Progress` with an animated progress bar (excluding redundant `Projects` count), with the `+ New Project` button positioned cleanly to the far right.
- **Enhanced Typography Scale**: High-contrast, comfortable font sizes (14px–16px) across task names, tags, and controls for effortless readability on all display resolutions.

### Module 2: Upcoming Features (Research & Execution Pipeline)
- **Purpose**: Enables team members to submit, research, breakdown, document, and convert product features into real sprint deliverables.
- **1-Line Linear Container Layout**: Replaces the old 2x2 grid with high-density full-width cards displaying phase badges, timeline, research points count, document counts, and action buttons.
- **9-Dot Container Drag & Drop Reordering**: High-precision 9-dot square grip handle (`Grip`) positioned on the left edge of each feature card. Users can click and hold to drag containers up or down to reposition them, complete with pulse insertion lines and instantaneous state/database persistence.
- **Full-Page Feature Workspace (`FeatureDetailView.tsx`)**: Clicking any feature container opens an expansive full-page detail view with breadcrumbs, phase switcher, technical notes editor, research point breakdown, and document attachments.
- **4 Product Lifecycle Phases**:
  1. **`💡 Thinking`**: Initial concept, brainstorming & problem definition.
  2. **`🔬 Research`**: Technical investigation, competitive analysis, and spec gathering.
  3. **`🚀 Ready to Go`**: Research complete, actionable points refined, ready for sprint build.
  4. **`⏳ Future Build`**: Backlogged initiatives scheduled for subsequent quarters.
  *(plus **`⚡ In Progress`** when started)*
- **Research Breakdown Points**: Team members can document granular research bullet points (e.g. *API latency tests*, *Rate limits*, *UI mockups*).
- **Document & Resource Attachments**: Attach research PDFs, Google Docs, Notion specs, or architecture links.
- **1-Click "▶ Start Feature" Conversion Engine**: Clicking "Start Feature" automatically spawns a new **Ongoing Project** and converts every research point into an actionable, prioritized sprint task!
- **Attributes**: `id`, `name`, `description`, `targetTimeline`, `priority`, `status`, `author`, `votes`, `tags`, `points`, `documents`, `notes`, `convertedProjectId`, `order`.

### Module 3: Fix & Updates (Dual Diagnostics & Release Engine)
- **Purpose**: Dedicated station for finding, documenting, fixing, and rolling out patches across all Proaffiliaters bots and web tools.
- **Dual Action Command Bar**: Features two distinct top action buttons:
  1. **`+ Post Update`**: To document and publish platform releases, feature rollouts, and version changelogs.
  2. **`+ Report Fix`**: To report system anomalies, bugs, root cause analyses, and severity triage.
- **Segmented View Switcher**: 1-click filter between **`All Items`**, **`🛠️ Fixes`**, and **`🚀 Updates`**, plus severity filters and status selectors.
- **Dynamic Component / Service Input**: `affectedComponent` supports free-form custom service entry with autocomplete suggestions from common subsystems and past logs.
- **Attributes**: `id`, `name`, `description`, `affectedComponent`, `severity`, `status`, `resolutionNotes`, `versionTag`, `reportedBy`.

### Module 4: Admin Team Management & Role Control (`/admin` Dedicated Route)
- **Purpose**: Dedicated admin panel accessible via the isolated `/admin` route (`http://localhost:3050/admin`) for provisioning real team accounts, configuring role assignments, setting access levels, and assigning task ownership.
- **Dedicated Route Security Gate**: Access to `/admin` is locked behind Super Admin verification requiring `admin@proaffiliaters.com` and password `Pushkar@9084#123`. A security gate intercepts unauthenticated visits, and an on-demand "Lock Console" control allows instant locking.
- **Admin Credential Generation**: Super Admin provisions employee accounts with work email and passwords (including a 1-click **Generate Strong Password** generator). Public signup is strictly disabled.
- **Dedicated Route Isolation**: Kept separate from the main workspace dashboard (`/`) to preserve clean separation of administrative actions, permissions, and team member management from daily sprint workflows.
- **Access Tiers**:
  1. **Super Admin**: Full platform control, member provisioning, database syncing, project deletion.
  2. **Project Lead**: Create initiatives, prioritize sprint tasks, manage team deliverables.
  3. **Developer**: Code assignment, task status workflow, bug fix resolution.
  4. **Affiliate Ops**: Deal harvesting, bot automation monitoring, campaign sync.
  5. **Viewer**: Read-only workspace inspection.
- **Attributes**: `id`, `name`, `email`, `password`, `role`, `avatar`, `accessLevel`, `status`, `skills`, `joinedAt`, `telegramHandle`, `bio`.

### Module 5: Employee Authentication Portal (`/login`)
- **Strict Mandatory Login Gate**: Unauthenticated visitors are strictly blocked from seeing the workspace and redirected to the login portal. `currentUser` defaults to `null` until valid login credentials are verified.
- **Single Master Founder Account**: Only the Founder & Super Admin account is pre-provisioned in the system (`admin@proaffiliaters.com` / `Pushkar@9084#123`). All dummy employee demo accounts have been completely removed.
- **Shared Credentials**: The same Founder credentials unlock both the Workspace (`/login`) and the Super Admin Console (`/admin`).
- **100% Clean Slate**: 0 default projects, 0 default tasks, 0 default features, and 0 default fixes. The system launches with clean, unpolluted data.
- **Session Management**: Authenticates via `/api/auth/login`, persists the session in `localStorage` (`proaffiliaters_session_user_v3`), and protects root workspace access.

### Module 6: Project Teammate Collaboration & Gmail Invitations Engine
- **Gmail Invitations**: Project owners can invite colleagues by Gmail directly when creating projects (via `ProjectModal`) or from the project card via `+ Add Teammates` (`InviteTeammateModal`).
- **Interactive Approval & Join Workflow**:
  - Invitations are stored in MongoDB with `pending` status.
  - When the recipient logs into their account, an interactive Project Invitations Bell lights up in the workspace header.
  - Recipient can click **`✓ Approve & Join`** or **`✕ Decline`**.
  - Upon approval, the recipient's email is appended to the project's `teamMemberEmails`, officially joining them to the initiative and granting task assignment access.

### Module 7: Individual Member Deliverables ("My Tasks" Mode)
- **1-Click "My Tasks" Mode**: Toolbar toggle button in `Header` and `Sidebar` that filters the Linear Tree, Kanban Board, and Table Grid views down to tasks assigned directly to the logged-in employee (`t.assigneeEmail === currentUser.email`).
- **Personalized Sprint Counters**: Top ribbon displays personalized pending counts tailored to each logged-in employee.

---

## 5. State Management & Full Database Persistence

- **Dual-Layer Full Function Database Architecture**:
  1. **MongoDB Master Engine**: Enterprise database integration (`lib/mongodb.ts`) running Mongoose models (`TeamMember`, `Project`, `Task`, `Feature`, `Fix`, `ProjectInvitation`) exposed via dedicated REST API endpoints:
     - `POST /api/auth/login`: Employee credential authentication.
     - `GET / POST / PUT / DELETE /api/projects`: Full project database operations.
     - `GET / POST / PUT / DELETE /api/tasks`: Full task deliverables database operations.
     - `GET / POST / PUT /api/invitations`: Gmail invite dispatch and approval workflow.
     - `GET / POST / PUT / DELETE /api/team`: Admin team member provisioning.
     - `GET / POST /api/sync`: Two-way cloud migration and batch upsert.
  2. **Client State & Offline Engine**: React Context API (`lib/store.tsx`) paired with `localStorage` for instant zero-latency UI interactions with seamless background MongoDB syncing.
- **Storage Keys**:
  - Database Cache: `proaffiliaters_team_task_manager_v2`
  - Active Session: `proaffiliaters_session_user_v2`

---

## 6. Unique Port & Production VPS Deployment (`manage.proaffiliaters.com`)

- **GitHub Repository**: [https://github.com/hackerpushkar/Proaffiliaters-team-manager](https://github.com/hackerpushkar/Proaffiliaters-team-manager)
- **Default Internal Port**: Configured to run on **Port 3050** (`next start -p 3050`).
- **Production Domain**: `https://manage.proaffiliaters.com`
- **Production VPS Stack**:
  - **Master Deployment Script**: `deploy.sh` in repository root.
    - **Initial Full VPS Setup**: `./deploy.sh` (installs Node.js 20, MongoDB 7, Nginx, Certbot SSL, builds Next.js, and configures PM2 systemd daemon).
    - **Quick Code Update**: `./deploy.sh --quick` (zero-downtime update: pulls git, installs dependencies, builds release, and reloads PM2 daemon without touching SSL or system packages).
  - **Process Daemon**: PM2 configuration (`deploy/ecosystem.config.js`) for auto-restarts and zero-downtime reloads under app name `manage-proaffiliaters`.
  - **Reverse Proxy**: Nginx configuration (`deploy/nginx.conf`) upstream to `127.0.0.1:3050` with SSL, WebSockets, and Gzip compression.
  - **Automated SSL**: Auto-renewing Let's Encrypt certificate configured for `manage.proaffiliaters.com`.
- **Local Dev Address**: `http://localhost:3050`

---

## 7. Developer Guidelines & File Header/Footer Standards

All newly created or edited TypeScript files in this repository MUST feature:
1. **Header Block**: Stating What the file does, Why it exists, and How it fits into the overall architecture.
2. **Footer Block**: Documenting the runtime workflow, data flows, exported interfaces, and caveats to avoid regressions.
