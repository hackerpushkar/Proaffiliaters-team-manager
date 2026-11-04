/**
 * ============================================================================
 * HEADER BLOCK: lib/types.ts — Master TypeScript Data Contracts
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Defines the core TypeScript types, interfaces, enums, and state schemas
 * for Proaffiliaters Team & Task Manager.
 *
 * WHY THIS FILE EXISTS:
 * Ensures complete type safety across all three requested product categories:
 * 1) New Upcoming Features (ideas, timeline, priority, voting)
 * 2) Ongoing Projects & Priority-Ordered Tasks (Prowasp bot, P0/P1/P2/P3 ranks)
 * 3) Fix & Updates (bug triage, affected systems, severity, patch logs)
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Consumed by useTaskStore, modal forms, list views, and export/import handlers.
 * ============================================================================
 */

export type FeaturePriority = "low" | "medium" | "high" | "critical";
export type FeatureStatus =
  | "thinking"
  | "research"
  | "ready_to_go"
  | "future_build"
  | "in_progress"
  | "completed";

export interface FeaturePoint {
  id: string;
  title: string;
  completed?: boolean;
  createdAt?: string;
}

export interface FeatureDocument {
  id: string;
  name: string;
  url: string;
  type?: string; // e.g. "doc", "pdf", "link", "spec"
  size?: string;
  uploadedAt?: string;
}

export interface UpcomingFeature {
  id: string;
  name: string;
  description: string;
  targetTimeline: string; // e.g. "Q4 2026", "Nov 2026", "v2.5"
  priority: FeaturePriority;
  status: FeatureStatus;
  author: string;
  votes: number;
  hasVoted?: boolean;
  tags: string[];
  points?: FeaturePoint[];
  documents?: FeatureDocument[];
  notes?: string;
  convertedProjectId?: string;
  order?: number; // Custom drag-and-drop position order
  createdAt: string;
  updatedAt?: string;
}

export type ProjectStatus = "active" | "planning" | "paused" | "completed";

export interface OngoingProject {
  id: string;
  name: string; // e.g. "Prowasp Telegram Bot"
  description: string;
  category: string; // "Automation", "Bot", "Web", "Affiliate Engine"
  lead: string;
  color: string; // Hex or gradient accent
  iconName?: string;
  status: ProjectStatus;
  order?: number; // Custom drag-and-drop position order
  createdAt: string;
  teamMemberEmails?: string[]; // Teammates joined to this project
  pendingInvites?: string[]; // Pending Gmail invites
}

export type TaskPriority = "P0" | "P1" | "P2" | "P3"; // P0: Urgent, P1: High, P2: Medium, P3: Low
export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done";

export interface SubtaskItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface ProjectTask {
  id: string;
  projectId: string; // foreign key to OngoingProject
  name: string;
  description: string;
  priority: TaskPriority;
  priorityRank: number; // strictly 1, 2, 3... within the project for priority-wise ordering
  status: TaskStatus;
  assignee: {
    name: string;
    avatar: string;
    role: string;
  };
  assigneeEmail?: string; // Direct email link for "My Tasks" filtering
  dueDate: string;
  subtasks: SubtaskItem[];
  tags: string[];
  createdAt: string;
  updatedAt?: string;
}

export type FixSeverity = "critical" | "major" | "minor" | "patch";
export type FixStatus = "reported" | "investigating" | "fixing" | "verified" | "deployed";

export interface FixUpdate {
  id: string;
  name: string; // Problem or patch title
  description: string; // Detailed description & root cause
  affectedComponent: string; // e.g. "Telegram Worker Bot", "Amazon Scraper", "Payment Webhook"
  severity: FixSeverity;
  status: FixStatus;
  reportedBy: string;
  assignee?: string;
  resolutionNotes: string;
  versionTag: string; // e.g. "v2.1.2"
  createdAt: string;
  resolvedAt?: string;
}

export type MemberAccessLevel = "admin" | "lead" | "developer" | "ops" | "viewer";
export type MemberStatus = "active" | "invited" | "inactive";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  password?: string; // Admin-provisioned credential for employee login
  role: string;
  avatar: string;
  accessLevel: MemberAccessLevel;
  status: MemberStatus;
  skills: string[];
  joinedAt: string;
  bio?: string;
  telegramHandle?: string;
}

export type InvitationStatus = "pending" | "accepted" | "declined";

export interface ProjectInvitation {
  id: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  inviterName: string;
  inviterEmail: string;
  inviteeEmail: string;
  status: InvitationStatus;
  createdAt: string;
  respondedAt?: string;
}

export type ActiveTab = "projects" | "features" | "fixes" | "overview" | "tasks" | "members";

/**
 * ============================================================================
 * FOOTER BLOCK: lib/types.ts Implementation Notes & Caveats
 * ============================================================================
 * - Workflow & Execution: Shared type layer used across both client state & UI components.
 * - Data Movement: Mirrored to localStorage JSON serialization.
 * - Key Exports: UpcomingFeature, OngoingProject, ProjectTask, FixUpdate, TeamMember.
 * - Caveats: Do not rename priority or status keys without migrating stored JSON values.
 * ============================================================================
 */
