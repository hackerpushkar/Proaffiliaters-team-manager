/**
 * ============================================================================
 * HEADER BLOCK: models/ProjectInvitation.ts — MongoDB Schema for Project Invites
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Defines the Mongoose model for project collaboration invitations sent via Gmail.
 * Tracks invite status (pending, accepted, declined), project linkage, inviter,
 * and invitee credentials.
 *
 * WHY THIS FILE EXISTS:
 * Enables the peer project invitation and approval workflow requested by the user.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Created when a project lead adds a teammate by Gmail; updated when the recipient
 * approves or declines the invitation.
 * ============================================================================
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProjectInvitationDocument extends Document {
  id: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  inviterName: string;
  inviterEmail: string;
  inviteeEmail: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
  respondedAt?: string;
}

const ProjectInvitationSchema = new Schema<IProjectInvitationDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    projectId: { type: String, required: true, index: true },
    projectName: { type: String, required: true },
    projectColor: { type: String, default: "#3b5bfa" },
    inviterName: { type: String, required: true },
    inviterEmail: { type: String, required: true, lowercase: true },
    inviteeEmail: { type: String, required: true, index: true, lowercase: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
      index: true,
    },
    createdAt: { type: String, default: () => new Date().toISOString() },
    respondedAt: { type: String },
  },
  { timestamps: true }
);

export const ProjectInvitationModel: Model<IProjectInvitationDocument> =
  mongoose.models.ProjectInvitation ||
  mongoose.model<IProjectInvitationDocument>("ProjectInvitation", ProjectInvitationSchema);

/**
 * ============================================================================
 * FOOTER BLOCK: models/ProjectInvitation.ts Implementation Notes
 * ============================================================================
 * - Workflow: Indexed by inviteeEmail and status for fast notification lookups.
 * - Caveat: Upon acceptance, triggers update to Project.teamMemberEmails array.
 * ============================================================================
 */
