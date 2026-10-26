/**
 * ============================================================================
 * HEADER BLOCK: models/Feature.ts — MongoDB Schema for Upcoming Features
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Defines the Mongoose model for brainstormed and voted product features.
 *
 * WHY THIS FILE EXISTS:
 * Serves as the database contract for Module 2 Features in MongoDB.
 * ============================================================================
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFeatureDocument extends Document {
  id: string;
  name: string;
  description: string;
  targetTimeline: string;
  priority: string;
  status: string;
  author: string;
  votes: number;
  tags: string[];
  points: Array<{ id: string; title: string; completed?: boolean; createdAt?: string }>;
  documents: Array<{ id: string; name: string; url: string; type?: string; size?: string; uploadedAt?: string }>;
  notes?: string;
  convertedProjectId?: string;
  createdAt: string;
  updatedAt?: string;
}

const FeatureSchema = new Schema<IFeatureDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    targetTimeline: { type: String, default: "Q4 2026" },
    priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
    status: {
      type: String,
      enum: ["thinking", "research", "ready_to_go", "future_build", "in_progress", "completed", "idea", "approved"],
      default: "thinking",
      index: true,
    },
    author: { type: String, required: true },
    votes: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    points: [
      {
        id: { type: String },
        title: { type: String },
        completed: { type: Boolean, default: false },
        createdAt: { type: String },
      },
    ],
    documents: [
      {
        id: { type: String },
        name: { type: String },
        url: { type: String },
        type: { type: String, default: "link" },
        size: { type: String },
        uploadedAt: { type: String },
      },
    ],
    notes: { type: String, default: "" },
    convertedProjectId: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString().split("T")[0] },
    updatedAt: { type: String },
  },
  { timestamps: true }
);

export const FeatureModel: Model<IFeatureDocument> =
  mongoose.models.Feature || mongoose.model<IFeatureDocument>("Feature", FeatureSchema);

/**
 * ============================================================================
 * FOOTER BLOCK: models/Feature.ts Implementation Notes
 * ============================================================================
 * - Workflow: Tracks team voting and quarterly roadmap targets.
 * ============================================================================
 */
