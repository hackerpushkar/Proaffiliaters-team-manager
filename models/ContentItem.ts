/**
 * ============================================================================
 * HEADER BLOCK: models/ContentItem.ts — MongoDB Schema for Content Manager
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Defines the Mongoose model for Content Pieces (Organic Videos) and
 * Paid Advertising Creatives (Ads) tracked through their 6-stage pipelines:
 * - Organic: Researching -> Scripting -> Shooting -> Editing -> Review -> Public
 * - Ads: Researching -> Scripting -> Shooting -> Checking -> Reviews -> Live
 *
 * WHY THIS FILE EXISTS:
 * Serves as the database contract for the Content Manager module in MongoDB,
 * providing persistent tracking of video deadlines, stage transitions,
 * and archived / completed assets.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Queried and mutated by app/api/content/route.ts and app/api/sync/route.ts.
 * ============================================================================
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContentItemDocument extends Document {
  id: string;
  type: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: string;
  platform?: string;
  assignee?: {
    name: string;
    avatar: string;
    role?: string;
  };
  assigneeEmail?: string;
  scriptUrl?: string;
  rawFootageUrl?: string;
  publishedUrl?: string;
  notes?: string;
  isArchived?: boolean;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}

const ContentItemSchema = new Schema<IContentItemDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ["organic", "ad"], required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    startDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
    endDate: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: [
        "researching",
        "scripting",
        "shooting",
        "editing",
        "review",
        "public",
        "checking",
        "reviews",
        "live",
      ],
      default: "researching",
      index: true,
    },
    platform: { type: String, default: "YouTube" },
    assignee: {
      name: { type: String, default: "Pushkar (Founder)" },
      avatar: { type: String, default: "/founder.jpg" },
      role: { type: String, default: "Lead" },
    },
    assigneeEmail: { type: String, default: "" },
    scriptUrl: { type: String, default: "" },
    rawFootageUrl: { type: String, default: "" },
    publishedUrl: { type: String, default: "" },
    notes: { type: String, default: "" },
    isArchived: { type: Boolean, default: false, index: true },
    createdAt: { type: String, default: () => new Date().toISOString().split("T")[0] },
    updatedAt: { type: String },
    completedAt: { type: String },
  },
  { timestamps: true }
);

export const ContentItemModel: Model<IContentItemDocument> =
  mongoose.models.ContentItem || mongoose.model<IContentItemDocument>("ContentItem", ContentItemSchema);

/**
 * ============================================================================
 * FOOTER BLOCK: models/ContentItem.ts Implementation Notes
 * ============================================================================
 * - Workflow: Captures video title, start/end deadlines, 6-stage lifecycle, and archive flag.
 * - Caveats: Indexes 'id', 'type', 'status', and 'endDate' for high-speed deadline queries.
 * ============================================================================
 */
