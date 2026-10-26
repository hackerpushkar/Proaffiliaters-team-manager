/**
 * ============================================================================
 * HEADER BLOCK: models/Task.ts — MongoDB Schema for Project Tasks
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Defines the Mongoose model for prioritized project deliverables.
 * Stores priority rank, assignees, subtask checklists, and completion lifecycle.
 *
 * WHY THIS FILE EXISTS:
 * Serves as the database contract for Module 1 Tasks in MongoDB.
 * ============================================================================
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITaskDocument extends Document {
  id: string;
  projectId: string;
  name: string;
  description: string;
  priority: string;
  priorityRank: number;
  status: string;
  assignee: {
    name: string;
    avatar: string;
    role: string;
  };
  assigneeEmail?: string;
  dueDate: string;
  subtasks: { id: string; title: string; completed: boolean }[];
  tags: string[];
  createdAt: string;
  updatedAt?: string;
}

const SubtaskSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const TaskSchema = new Schema<ITaskDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    projectId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    priority: { type: String, enum: ["P0", "P1", "P2", "P3"], default: "P1", index: true },
    priorityRank: { type: Number, default: 1, index: true },
    status: {
      type: String,
      enum: ["backlog", "todo", "in_progress", "review", "done"],
      default: "todo",
      index: true,
    },
    assignee: {
      name: { type: String, required: true },
      avatar: { type: String, default: "/founder.jpg" },
      role: { type: String, default: "Team Member" },
    },
    assigneeEmail: { type: String, default: "", index: true },
    dueDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
    subtasks: { type: [SubtaskSchema], default: [] },
    tags: { type: [String], default: [] },
    createdAt: { type: String, default: () => new Date().toISOString().split("T")[0] },
    updatedAt: { type: String },
  },
  { timestamps: true }
);

export const TaskModel: Model<ITaskDocument> =
  mongoose.models.Task || mongoose.model<ITaskDocument>("Task", TaskSchema);

/**
 * ============================================================================
 * FOOTER BLOCK: models/Task.ts Implementation Notes
 * ============================================================================
 * - Workflow: Indexed by projectId, priority, and priorityRank for fast sorting.
 * ============================================================================
 */
