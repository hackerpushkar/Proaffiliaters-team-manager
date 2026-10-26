# Proaffiliaters Team & Task Manager — Workflows & Operating Procedures (`workflow.md`)

This guide explains the step-by-step developer workflows for **Proaffiliaters Team & Task Manager**.

---

## Workflow 1: Proposing a New Upcoming Feature

1. Navigate to the **New Upcoming Features** tab from the sidebar.
2. Click the **"Propose Feature"** button in the header banner.
3. Fill in:
   - **Feature Name**: Clear, action-oriented name (e.g. *AI Deal Description Rewriter*).
   - **Detailed Description**: Scope, benefits to creators, and technical architecture.
   - **Target Timeline**: Expected quarter or sprint milestone (e.g. *Q4 2026*).
   - **Priority**: *Critical*, *High*, *Medium*, or *Low*.
   - **Tags**: Subsystem labels (e.g. `#Telegram`, `#AI`).
4. Click **"Submit Feature"**. The feature is automatically logged with an initial upvote from the creator.
5. Other team members can upvote by clicking the thumbs-up button on the card.

---

## Workflow 2: Managing Ongoing Projects & Priority-Ordered Tasks

1. Navigate to the **Ongoing Projects** tab.
2. To start a new project:
   - Click **"+ New Project"** in the sidebar or top project switcher.
   - Enter project name (e.g., *Prowasp Telegram Bot*), category, description, and accent color.
3. Under the chosen project, click **"Add Task"**:
   - Provide Task Title, description, and deadline.
   - Select Priority:
     - **P0 • Urgent**: Must be resolved before anything else.
     - **P1 • High**: Primary sprint deliverable.
     - **P2 • Normal**: Standard backlog task.
     - **P3 • Low**: Non-blocking enhancement.
   - Add subtask checklist items.
   - Choose lead assignee from the Proaffiliaters team.
4. **Reordering Tasks Priority-Wise**:
   - In the **Priority Order List** view, use the **▲ (Move Up)** and **▼ (Move Down)** buttons next to the rank badge (`#1`, `#2`, `#3`...) to reorder tasks according to dynamic team priorities.
   - The numerical order is updated and persisted automatically.
5. **Kanban Mode**:
   - Toggle to **Kanban Board** to see tasks partitioned by status (`To Do`, `In Progress`, `Review`, `Done`).

---

## Workflow 3: Logging and Resolving Fix & Updates

1. Navigate to the **Fix & Updates** tab.
2. Click **"Report Fix / Update"**.
3. Fill in:
   - **Issue Title**: High-level problem summary (e.g., *Amazon PA-API 429 Too Many Requests*).
   - **Description & Root Cause**: Detailed explanation of error logs and underlying reason.
   - **Affected Component**: Target service (e.g. *Telegram Worker Bot*, *Scraper*, *Web Client*).
   - **Severity**: *Critical*, *Major*, *Minor*, or *Patch*.
   - **Version Tag**: Release milestone (e.g. *v2.1.4*).
4. As the team works on the fix, update the status:
   `Reported` ➔ `Investigating` ➔ `Fixing` ➔ `Verified` ➔ `Deployed`.
5. Enter **Resolution / Patch Notes** documenting the fix. Setting status to `Deployed` automatically records the resolution timestamp.

---

## Workflow 4: Data Backup and Multi-Device Synchronization

1. To create an offline backup:
   - Click the **"Backup"** button in the top navigation bar.
   - A complete JSON snapshot (`proaffiliaters_tasks_backup_YYYY-MM-DD.json`) is downloaded immediately.
2. To restore or sync data onto another computer:
   - Click the **"Restore"** button in the header.
   - Select the backup `.json` file.
   - The entire store updates with 0-downtime.
3. To reset to official initial Proaffiliaters projects (Prowasp bot, scrapers, web app):
   - Click the **Reset (counter-clockwise arrow)** icon in the header.
