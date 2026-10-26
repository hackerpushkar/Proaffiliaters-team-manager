/**
 * ============================================================================
 * HEADER BLOCK: models/Fix.ts — MongoDB Schema for Bug Fixes & Platform Updates
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Defines the Mongoose model for system diagnostics, bug reports, and version patches.
 *
 * WHY THIS FILE EXISTS:
 * Serves as the database contract for Module 3 Fix & Updates in MongoDB.
 * ============================================================================
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFixDocument extends Document {
  id: string;
  name: string;
  description: string;
  affectedComponent: string;
  severity: string;
  status: string;
  reportedBy: string;
  assignee?: string;
  resolutionNotes: string;
  versionTag: string;
  createdAt: string;
  resolvedAt?: string;
}

const FixSchema = new Schema<IFixDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    affectedComponent: { type: String, required: true, index: true },
    severity: {
      type: String,
      enum: ["critical", "major", "minor", "patch"],
      default: "major",
      index: true,
    },
    status: {
      type: String,
      enum: ["reported", "investigating", "fixing", "verified", "deployed"],
      default: "reported",
      index: true,
    },
    reportedBy: { type: String, required: true },
    assignee: { type: String, default: "" },
    resolutionNotes: { type: String, default: "" },
    versionTag: { type: String, default: "v2.1.4" },
    createdAt: { type: String, default: () => new Date().toISOString().split("T")[0] },
    resolvedAt: { type: String },
  },
  { timestamps: true }
);

export const FixModel: Model<IFixDocument> =
  mongoose.models.Fix || mongoose.model<IFixDocument>("Fix", FixSchema);

/**
 * ============================================================================
 * FOOTER BLOCK: models/Fix.ts Implementation Notes
 * ============================================================================
 * - Workflow: Captures severity, resolution changelogs, and affected services.
 * ============================================================================
 */
