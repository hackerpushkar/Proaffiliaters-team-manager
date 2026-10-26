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

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

    const [projects, tasks, features, fixes, teamMembers, invitations] = await Promise.all([
      ProjectModel.find({}).lean(),
      TaskModel.find({}).sort({ priorityRank: 1 }).lean(),
      FeatureModel.find({}).sort({ votes: -1 }).lean(),
      FixModel.find({}).sort({ createdAt: -1 }).lean(),
      TeamMemberModel.find({}).sort({ createdAt: 1 }).lean(),
      ProjectInvitationModel.find({}).sort({ createdAt: -1 }).lean(),
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

    const { projects, tasks, features, fixes, teamMembers } = body;

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
    const { invitations } = body;
    if (Array.isArray(invitations)) {
      for (const inv of invitations) {
        await ProjectInvitationModel.findOneAndUpdate({ id: inv.id }, inv, { upsert: true });
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
