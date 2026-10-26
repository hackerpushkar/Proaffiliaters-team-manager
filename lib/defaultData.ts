/**
 * ============================================================================
 * HEADER BLOCK: lib/defaultData.ts — Default Initial Seed Data
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Supplies clean, production-ready starting state for Proaffiliaters Team & Task Manager.
 *
 * PRODUCTION CLEAN SLATE RULES:
 * - ONLY the single Founder & Super Admin account is provisioned.
 * - ZERO dummy projects, ZERO dummy tasks, ZERO dummy features, ZERO dummy fixes.
 * - All tasks and projects start clean for real team usage.
 *
 * WHY THIS FILE EXISTS:
 * Ensures the system launches with pure, unpolluted data tailored for Founder Pushkar.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Imported by lib/store.tsx when initializing state.
 * ============================================================================
 */

import { UpcomingFeature, OngoingProject, ProjectTask, FixUpdate, TeamMember, ProjectInvitation } from "./types";

/**
 * The single primary Founder & Super Admin account.
 * Founder credentials and Super Admin credentials are identical.
 */
export const initialTeamMembers: TeamMember[] = [
  {
    id: "founder-pushkar",
    name: "Pushkar",
    email: "admin@proaffiliaters.com",
    password: "Pushkar@9084#123", // Master Founder & Admin Credential
    role: "Founder & Super Admin",
    avatar: "/founder.jpg",
    accessLevel: "admin",
    status: "active",
    skills: ["System Architecture", "Next.js", "Telegram Automation", "Operations", "Fullstack"],
    joinedAt: "2024-01-01T00:00:00.000Z",
    telegramHandle: "@pushkar_founder",
    bio: "Founder & Chief Architect of Proaffiliaters platform.",
  },
];

/**
 * 100% Clean Slate: No dummy/sample projects.
 */
export const initialProjects: OngoingProject[] = [];

/**
 * 100% Clean Slate: No dummy/sample tasks.
 */
export const initialTasks: ProjectTask[] = [];

/**
 * 100% Clean Slate: No dummy/sample upcoming features.
 */
export const initialFeatures: UpcomingFeature[] = [];

/**
 * 100% Clean Slate: No dummy/sample fixes or patches.
 */
export const initialFixes: FixUpdate[] = [];

/**
 * 100% Clean Slate: No dummy/sample invitations.
 */
export const initialInvitations: ProjectInvitation[] = [];

/**
 * ============================================================================
 * FOOTER BLOCK: lib/defaultData.ts Implementation Notes
 * ============================================================================
 * - Founder Account: Pushkar (admin@proaffiliaters.com / Pushkar@9084#123)
 * - Access Level: "admin" (Level 5)
 * - Clean Slate: Empty arrays ensure no toy data pollutes the production database.
 * ============================================================================
 */
