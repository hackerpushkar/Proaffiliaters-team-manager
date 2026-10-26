/**
 * ============================================================================
 * HEADER BLOCK: models/TeamMember.ts — MongoDB Schema for Team Accounts
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Defines the Mongoose model for TeamMember accounts with roles, credentials,
 * permissions, skills, and account lifecycle states.
 *
 * WHY THIS FILE EXISTS:
 * Serves as the database contract for the Admin Team Management panel.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Queried by /api/team route handler for persistent storage in MongoDB.
 * ============================================================================
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeamMemberDocument extends Document {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  avatar: string;
  accessLevel: string;
  status: string;
  skills: string[];
  joinedAt: string;
  bio?: string;
  telegramHandle?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMemberDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true },
    password: { type: String, default: "ProAffiliate@2026" },
    role: { type: String, required: true },
    avatar: { type: String, default: "/founder.jpg" },
    accessLevel: {
      type: String,
      enum: ["admin", "lead", "developer", "ops", "viewer"],
      default: "developer",
    },
    status: {
      type: String,
      enum: ["active", "invited", "inactive"],
      default: "active",
    },
    skills: { type: [String], default: [] },
    joinedAt: { type: String, default: () => new Date().toISOString().split("T")[0] },
    bio: { type: String, default: "" },
    telegramHandle: { type: String, default: "" },
  },
  { timestamps: true }
);

export const TeamMemberModel: Model<ITeamMemberDocument> =
  mongoose.models.TeamMember ||
  mongoose.model<ITeamMemberDocument>("TeamMember", TeamMemberSchema);

/**
 * ============================================================================
 * FOOTER BLOCK: models/TeamMember.ts Implementation Notes
 * ============================================================================
 * - Workflow: Validates uniqueness of member ID and email.
 * - Exports: TeamMemberModel.
 * ============================================================================
 */
