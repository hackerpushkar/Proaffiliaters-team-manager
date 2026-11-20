/**
 * ============================================================================
 * HEADER BLOCK: models/Idea.ts — MongoDB Schema for Idea Playground
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Defines the Mongoose model and TypeScript document interface for the
 * "Idea Playground" feature:
 * - Idea title, description, category, and lifecycle status
 * - Submitter/author attribution (name, avatar, email, role)
 * - Initial remark / rationale why the idea matters
 * - Collaborative remarks array from any platform team member
 * - Upvotes tracking by teammate identity
 * - Conversion tracking linking approved ideas to Upcoming Features
 *
 * WHY THIS FILE EXISTS:
 * Fulfills the user request: "feature name as idea playground ... in these we can
 * post our ideas and some remark with these idea anybody on platform can send idea".
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Queried, created, updated, and deleted via app/api/ideas/route.ts and synced
 * in batch via app/api/sync/route.ts to guarantee cross-device persistence.
 * ============================================================================
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IIdeaRemark {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorEmail?: string;
  text: string;
  createdAt: string;
}

export interface IIdeaDocument extends Document {
  id: string;
  title: string;
  description: string;
  category: "Growth" | "Product" | "Automation" | "Marketing" | "UI/UX" | "Internal Tool" | "Other";
  status: "brainstorming" | "under_review" | "planned" | "converted" | "archived";
  initialRemark?: string;
  author: {
    name: string;
    avatar: string;
    email?: string;
    role?: string;
  };
  upvotes: string[];
  remarks: IIdeaRemark[];
  tags?: string[];
  convertedFeatureId?: string;
  createdAt: string;
  updatedAt?: string;
}

const IdeaRemarkSchema = new Schema<IIdeaRemark>(
  {
    id: { type: String, required: true },
    authorName: { type: String, required: true },
    authorAvatar: { type: String, default: "/founder.jpg" },
    authorEmail: { type: String, default: "" },
    text: { type: String, required: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false }
);

const IdeaSchema = new Schema<IIdeaDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Growth", "Product", "Automation", "Marketing", "UI/UX", "Internal Tool", "Other"],
      default: "Product",
      index: true,
    },
    status: {
      type: String,
      enum: ["brainstorming", "under_review", "planned", "converted", "archived"],
      default: "brainstorming",
      index: true,
    },
    initialRemark: { type: String, default: "" },
    author: {
      name: { type: String, default: "Pushkar (Founder)" },
      avatar: { type: String, default: "/founder.jpg" },
      email: { type: String, default: "" },
      role: { type: String, default: "Team Member" },
    },
    upvotes: { type: [String], default: [] },
    remarks: { type: [IdeaRemarkSchema], default: [] },
    tags: { type: [String], default: [] },
    convertedFeatureId: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString().split("T")[0] },
    updatedAt: { type: String },
  },
  { timestamps: true }
);

export const IdeaModel: Model<IIdeaDocument> =
  mongoose.models.Idea || mongoose.model<IIdeaDocument>("Idea", IdeaSchema);

/**
 * ============================================================================
 * FOOTER BLOCK: models/Idea.ts Implementation Notes & Caveats
 * ============================================================================
 * - Workflow: Captures ideas, author info, collaborative remarks, and upvotes.
 * - Caveats: Subdocuments for remarks do not generate separate MongoDB _ids (_id: false).
 * - Upvotes Array: Tracks teammate email/ID to prevent duplicate voting.
 * ============================================================================
 */
