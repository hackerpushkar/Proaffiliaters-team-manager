/**
 * ============================================================================
 * HEADER BLOCK: app/api/projects/route.ts — Project Management API
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Provides CRUD endpoints for Ongoing Projects (Initiatives):
 * - GET: Returns all projects from MongoDB
 * - POST: Creates a new project with owner and teammate emails
 * - PUT: Updates project details and member roster
 * - DELETE: Deletes project
 *
 * WHY THIS FILE EXISTS:
 * Ensures full database storage of projects in MongoDB.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Called by useTaskStore to persist projects in database.
 * ============================================================================
 */

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ProjectModel } from "@/models/Project";
import { TaskModel } from "@/models/Task";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const projects = await ProjectModel.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: projects });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.name || !body.lead) {
      return NextResponse.json(
        { success: false, message: "Project name and lead are required" },
        { status: 400 }
      );
    }

    const projectId = body.id || `proj-${Date.now()}`;
    const newProject = await ProjectModel.create({
      id: projectId,
      name: body.name,
      description: body.description || "",
      category: body.category || "General",
      lead: body.lead,
      color: body.color || "#3b5bfa",
      iconName: body.iconName || "Folder",
      status: body.status || "active",
      teamMemberEmails: body.teamMemberEmails || [],
      pendingInvites: body.pendingInvites || [],
      createdAt: body.createdAt || new Date().toISOString().split("T")[0],
    });

    return NextResponse.json({
      success: true,
      message: "Project created in database",
      data: newProject,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create project" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Project ID is required" },
        { status: 400 }
      );
    }

    const updated = await ProjectModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project updated successfully",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Project ID query param is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    await ProjectModel.findOneAndDelete({ id });
    await TaskModel.deleteMany({ projectId: id });

    return NextResponse.json({
      success: true,
      message: "Project and associated tasks removed from database",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete project" },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * FOOTER BLOCK: app/api/projects/route.ts Implementation Notes
 * ============================================================================
 * - Workflow: Direct MongoDB operations with cascade deletion of child tasks.
 * ============================================================================
 */
