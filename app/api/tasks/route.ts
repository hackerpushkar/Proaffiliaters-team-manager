/**
 * ============================================================================
 * HEADER BLOCK: app/api/tasks/route.ts — Tasks CRUD & Priority API
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Provides CRUD endpoints for Tasks within initiatives:
 * - GET: Retrieves tasks from MongoDB (supports ?projectId= and ?assigneeEmail=)
 * - POST: Creates a new prioritized task
 * - PUT: Updates task status, subtasks, priority rank, or assignee
 * - DELETE: Deletes task
 *
 * WHY THIS FILE EXISTS:
 * Ensures full database storage of project deliverables in MongoDB.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Called by useTaskStore when managing sprint tasks and "My Tasks" filters.
 * ============================================================================
 */

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { TaskModel } from "@/models/Task";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const assigneeEmail = searchParams.get("assigneeEmail");

    const query: any = {};
    if (projectId) query.projectId = projectId;
    if (assigneeEmail) query.assigneeEmail = assigneeEmail.toLowerCase().trim();

    const tasks = await TaskModel.find(query).sort({ priorityRank: 1 }).lean();
    return NextResponse.json({ success: true, data: tasks });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.name || !body.projectId) {
      return NextResponse.json(
        { success: false, message: "Task name and projectId are required" },
        { status: 400 }
      );
    }

    const taskId = body.id || `task-${Date.now()}`;
    const newTask = await TaskModel.create({
      id: taskId,
      projectId: body.projectId,
      name: body.name,
      description: body.description || "",
      priority: body.priority || "P1",
      priorityRank: body.priorityRank || 1,
      status: body.status || "todo",
      assignee: body.assignee || {
        name: "Pushkar (Founder)",
        avatar: "/founder.jpg",
        role: "Lead",
      },
      assigneeEmail: body.assigneeEmail ? body.assigneeEmail.toLowerCase().trim() : "",
      dueDate: body.dueDate || new Date().toISOString().split("T")[0],
      subtasks: body.subtasks || [],
      tags: body.tags || [],
      createdAt: body.createdAt || new Date().toISOString().split("T")[0],
    });

    return NextResponse.json({
      success: true,
      message: "Task created in database",
      data: newTask,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create task" },
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
        { success: false, message: "Task ID is required" },
        { status: 400 }
      );
    }

    if (updates.assigneeEmail) {
      updates.assigneeEmail = updates.assigneeEmail.toLowerCase().trim();
    }

    updates.updatedAt = new Date().toISOString().split("T")[0];

    const updated = await TaskModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task updated in database",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update task" },
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
        { success: false, message: "Task ID query param is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    await TaskModel.findOneAndDelete({ id });

    return NextResponse.json({
      success: true,
      message: "Task deleted from database",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete task" },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * FOOTER BLOCK: app/api/tasks/route.ts Implementation Notes
 * ============================================================================
 * - Workflow: Direct MongoDB operations with sorting by priorityRank.
 * ============================================================================
 */
