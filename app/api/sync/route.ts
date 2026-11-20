/**
 * ============================================================================
 * HEADER BLOCK: app/api/sync/route.ts — Master Database Synchronization API
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Provides two-way synchronization between the client workspace and MongoDB:
 * - GET: Hydrates the full workspace state from MongoDB (Features, Projects, Tasks, Fixes, Team)
 * - POST: Batch saves or migrates entire workspace collections to MongoDB
 *
 * WHY THIS FILE EXISTS:
 * Ensures seamless migration from local development storage to real MongoDB
 * when deployed to VPS.
 * ============================================================================
 */

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ProjectModel } from "@/models/Project";
import { TaskModel } from "@/models/Task";
import { FeatureModel } from "@/models/Feature";
import { FixModel } from "@/models/Fix";
import { TeamMemberModel } from "@/models/TeamMember";
import { ProjectInvitationModel } from "@/models/ProjectInvitation";
import { ContentItemModel } from "@/models/ContentItem";
import { IdeaModel } from "@/models/Idea";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

    const [projects, tasks, features, fixes, teamMembers, invitations, contentItems, ideas] = await Promise.all([
      ProjectModel.find({}).sort({ order: 1, createdAt: -1 }).lean(),
      TaskModel.find({}).sort({ priorityRank: 1 }).lean(),
      FeatureModel.find({}).sort({ order: 1, createdAt: -1 }).lean(),
      FixModel.find({}).sort({ createdAt: -1 }).lean(),
      TeamMemberModel.find({}).sort({ createdAt: 1 }).lean(),
      ProjectInvitationModel.find({}).sort({ createdAt: -1 }).lean(),
      ContentItemModel.find({}).sort({ endDate: 1, createdAt: -1 }).lean(),
      IdeaModel.find({}).sort({ createdAt: -1 }).lean(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        projects,
        tasks,
        features,
        fixes,
        teamMembers,
        invitations,
        contentItems,
        ideas,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to retrieve database collections",
        isOfflineFallback: true,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const { projects, tasks, features, fixes, teamMembers, invitations, contentItems, ideas, deletedIds } = body;

    // Purge any explicitly deleted items
    if (deletedIds) {
      if (Array.isArray(deletedIds.features) && deletedIds.features.length > 0) {
        await FeatureModel.deleteMany({ id: { $in: deletedIds.features } });
      }
      if (Array.isArray(deletedIds.fixes) && deletedIds.fixes.length > 0) {
        await FixModel.deleteMany({ id: { $in: deletedIds.fixes } });
      }
      if (Array.isArray(deletedIds.projects) && deletedIds.projects.length > 0) {
        await ProjectModel.deleteMany({ id: { $in: deletedIds.projects } });
        await TaskModel.deleteMany({ projectId: { $in: deletedIds.projects } });
      }
      if (Array.isArray(deletedIds.tasks) && deletedIds.tasks.length > 0) {
        await TaskModel.deleteMany({ id: { $in: deletedIds.tasks } });
      }
      if (Array.isArray(deletedIds.contentItems) && deletedIds.contentItems.length > 0) {
        await ContentItemModel.deleteMany({ id: { $in: deletedIds.contentItems } });
      }
      if (Array.isArray(deletedIds.ideas) && deletedIds.ideas.length > 0) {
        await IdeaModel.deleteMany({ id: { $in: deletedIds.ideas } });
      }
    }

    // Batch upsert Projects
    if (Array.isArray(projects)) {
      for (const p of projects) {
        await ProjectModel.findOneAndUpdate({ id: p.id }, p, { upsert: true });
      }
    }

    // Batch upsert Tasks
    if (Array.isArray(tasks)) {
      for (const t of tasks) {
        await TaskModel.findOneAndUpdate({ id: t.id }, t, { upsert: true });
      }
    }

    // Batch upsert Features
    if (Array.isArray(features)) {
      for (const f of features) {
        await FeatureModel.findOneAndUpdate({ id: f.id }, f, { upsert: true });
      }
    }

    // Batch upsert Fixes
    if (Array.isArray(fixes)) {
      for (const fix of fixes) {
        await FixModel.findOneAndUpdate({ id: fix.id }, fix, { upsert: true });
      }
    }

    // Batch upsert TeamMembers
    if (Array.isArray(teamMembers)) {
      for (const m of teamMembers) {
        await TeamMemberModel.findOneAndUpdate({ id: m.id }, m, { upsert: true });
      }
    }

    // Batch upsert Invitations
    if (Array.isArray(invitations)) {
      for (const inv of invitations) {
        await ProjectInvitationModel.findOneAndUpdate({ id: inv.id }, inv, { upsert: true });
      }
    }

    // Batch upsert ContentItems
    if (Array.isArray(contentItems)) {
      for (const item of contentItems) {
        await ContentItemModel.findOneAndUpdate({ id: item.id }, item, { upsert: true });
      }
    }

    // Batch upsert Ideas
    if (Array.isArray(ideas)) {
      for (const idea of ideas) {
        await IdeaModel.findOneAndUpdate({ id: idea.id }, idea, { upsert: true });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Workspace successfully synchronized with MongoDB database",
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to sync workspace to MongoDB",
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * FOOTER BLOCK: app/api/sync/route.ts Implementation Notes
 * ============================================================================
 * - Workflow: Uses Promise.all for fast parallel reads and bulk upserts for writes.
 * - Resiliency: Catches connection errors and reports offline status to client.
 * ============================================================================
 */
