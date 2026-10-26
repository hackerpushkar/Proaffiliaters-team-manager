/**
 * ============================================================================
 * HEADER BLOCK: models/Project.ts — MongoDB Schema for Ongoing Projects
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Defines the Mongoose model for Major Initiatives (e.g. Prowasp Telegram Bot).
 * Stores project metadata, category, lead, accent color, and status.
 *
 * WHY THIS FILE EXISTS:
 * Serves as the database contract for Module 1 Projects in MongoDB.
 * ============================================================================
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProjectDocument extends Document {
  id: string;
  name: string;
  description: string;
  category: string;
  lead: string;
  color: string;
  iconName?: string;
  status: string;
  createdAt: string;
  teamMemberEmails: string[];
  pendingInvites: string[];
}

const ProjectSchema = new Schema<IProjectDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, default: "General" },
    lead: { type: String, required: true },
    color: { type: String, default: "#3b5bfa" },
    iconName: { type: String, default: "Folder" },
    status: {
      type: String,
      enum: ["active", "planning", "paused", "completed"],
      default: "active",
      index: true,
    },
    createdAt: { type: String, default: () => new Date().toISOString().split("T")[0] },
    teamMemberEmails: { type: [String], default: [] },
    pendingInvites: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const ProjectModel: Model<IProjectDocument> =
  mongoose.models.Project || mongoose.model<IProjectDocument>("Project", ProjectSchema);

/**
 * ============================================================================
 * FOOTER BLOCK: models/Project.ts Implementation Notes
 * ============================================================================
 * - Workflow: Indexed by id and status for fast workspace queries.
 * ============================================================================
 */
