# AGENTS.md — Instructions for AI Agents & Developers

Welcome to **Proaffiliaters Team & Task Manager**!

Before making ANY code modifications, additions, or refactoring in this repository, you **MUST** strictly adhere to the following rules:

---

## 1. MANDATORY FIRST STEP: Read `projectinfo.md`
- **READ FIRST**: You **MUST** read [projectinfo.md](file:///c:/Users/spush/OneDrive/Desktop/Proaffiliaters/Team%20And%20Task%20Manager/projectinfo.md) before inspecting or editing code.
- It is the definitive master source of truth for the project's architecture, data contracts, state management, UI component structure, port configuration, and end-to-end workflows.
- Never assume code tells the entire story without understanding the broader system context outlined in `projectinfo.md`.

---

## 2. MANDATORY: Intent Confirmation Before Code Execution ("Is this what you mean?")
- **Human Communication Context**:
  - Humans express intent naturally with brevity, typos, or incomplete technical phrasing.
  - An AI agent or developer must verify that their understanding aligns with user intent before modifying core state or executing breaking changes.
- **Mandatory Solution**:
  - When the user gives a prompt or instructions, the agent **MUST FIRST** analyze them and present a clear interpretation:
    > **“Is this what you mean?”**  
    > *[Clear, concise interpretation of the user's request, affected components, and intended solution]*
  - **If the human says YES**: Proceed with implementation.
  - **If the human says NO**: Do **NOT** make any code changes. Stop immediately, ask for clarification, re-analyze, and confirm understanding again.

---

## 3. MANDATORY: Analyze All Project Components Before Making Changes
- **Thorough Project Analysis**: Before writing or modifying code, you **MUST** analyze all related components:
  - **Core Views**:
    1. *New Upcoming Features* (`UpcomingFeaturesView.tsx`): Feature ideas, descriptions, quarter timelines, priority scoring, team voting, status transitions.
    2. *Ongoing Projects* (`OngoingProjectsView.tsx`): Project hierarchy (e.g., Prowasp Telegram Bot, Web App, Profit Bot), tasks ordered priority-wise, checklist items, assignees, Kanban & List modes.
    3. *Fix & Updates* (`FixUpdatesView.tsx`): Bug tracking, root cause analysis, affected services, severity tagging, resolution notes, changelog generation.
  - **Shared State & Persistence**: `useTaskStore.ts` & LocalStorage engine with automatic migration, backup import/export, and real-time cross-tab sync.
  - **Brand Design System**: Adherence to Proaffiliaters visual standards (dark/light mode, deep `#0d1033` navy background, electric `#4f6ef7` primary, `#7c3aed` purple accent, glassmorphism, DM Sans / Plus Jakarta Sans typography).
- **Do NOT make isolated or blind changes** that break data integrity or component synchronization.

---

## 4. MANDATORY: Updating `projectinfo.md` Is a MUST
- **Reading AND Updating `projectinfo.md` is strictly required.**
- Whenever you make any change that impacts:
  - Architecture or state storage format
  - Task schema, priority definitions, or lifecycle statuses
  - New views, modal dialogs, or filter controls
  - Port configurations or scripts
- You **MUST** update [projectinfo.md](file:///c:/Users/spush/OneDrive/Desktop/Proaffiliaters/Team%20And%20Task%20Manager/projectinfo.md) immediately to reflect the current, real state of the code.

---

## 5. Beginner-Friendly Documentation on Every File
- **Header Block (Top of Every File)**:
  ```typescript
  /**
   * ============================================================================
   * HEADER BLOCK: [FileName] — [High-level title]
   * ============================================================================
   * WHAT THIS FILE DOES: [Concise summary]
   * WHY THIS FILE EXISTS: [Architectural role]
   * HOW IT FITS INTO THE OVERALL WORKFLOW: [Interaction with other parts]
   * ============================================================================
   */
  ```
- **Footer Block (Bottom of Every File)**:
  ```typescript
  /**
   * ============================================================================
   * FOOTER BLOCK: [FileName] Implementation Notes & Caveats
   * ============================================================================
   * - Workflow & Execution: [Key lifecycles]
   * - Data Movement: [Inputs, mutations, storage]
   * - Key Exports & Dependencies: [Main interfaces & hooks]
   * - Caveats to Avoid Regressions: [What not to touch blindly]
   * ============================================================================
   */
  ```

---

## 6. Port & Service Resilience
- The application runs on unique port `3050` by default.
- If port `3050` is ever occupied, the application supports fallback ports (`3051`, `3055`, etc.) via `npm run dev:alt` or port negotiation.
- Never hardcode absolute network ports in API clients without fallback mechanisms.
