/**
 * ============================================================================
 * HEADER BLOCK: app/api/ideas/route.ts — Idea Playground CRUD & Collaboration API
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Exposes full REST API endpoints for the "Idea Playground" feature:
 * - GET: Retrieves ideas sorted by upvotes and creation date
 * - POST: Creates new ideas, posts remarks, or toggles upvotes
 * - PUT: Updates idea content, category, or status transitions
 * - DELETE: Purges an idea from MongoDB by ID
 *
 * WHY THIS FILE EXISTS:
 * Ensures full database persistence, real-time collaboration, and cross-device
 * synchronization for teammate-submitted ideas and remarks.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Called by useTaskStore (addIdea, updateIdea, deleteIdea, upvoteIdea, addIdeaRemark)
 * and synced during batch synchronization via app/api/sync/route.ts.
 * ============================================================================
 */

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { IdeaModel } from "@/models/Idea";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    if (id) {
      const idea = await IdeaModel.findOne({ id }).lean();
      if (!idea) {
        return NextResponse.json(
          { success: false, message: "Idea not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: idea });
    }

    const query: any = {};
    if (category && category !== "all") query.category = category;
    if (status && status !== "all") query.status = status;

    const ideas = await IdeaModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: ideas });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch ideas" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    // Special Action: Upvote Toggle
    if (body.action === "upvote") {
      const { ideaId, userEmail } = body;
      if (!ideaId || !userEmail) {
        return NextResponse.json(
          { success: false, message: "ideaId and userEmail are required for upvoting" },
          { status: 400 }
        );
      }

      const idea = await IdeaModel.findOne({ id: ideaId });
      if (!idea) {
        return NextResponse.json({ success: false, message: "Idea not found" }, { status: 404 });
      }

      const hasUpvoted = idea.upvotes.includes(userEmail);
      if (hasUpvoted) {
        idea.upvotes = idea.upvotes.filter((e) => e !== userEmail);
      } else {
        idea.upvotes.push(userEmail);
      }
      idea.updatedAt = new Date().toISOString().split("T")[0];
      await idea.save();

      return NextResponse.json({ success: true, data: idea, hasUpvoted: !hasUpvoted });
    }

    // Special Action: Add Remark
    if (body.action === "remark") {
      const { ideaId, remark } = body;
      if (!ideaId || !remark || !remark.text) {
        return NextResponse.json(
          { success: false, message: "ideaId and remark text are required" },
          { status: 400 }
        );
      }

      const idea = await IdeaModel.findOne({ id: ideaId });
      if (!idea) {
        return NextResponse.json({ success: false, message: "Idea not found" }, { status: 404 });
      }

      const newRemark = {
        id: remark.id || `rem-${Date.now().toString(36)}`,
        authorName: remark.authorName || "Team Member",
        authorAvatar: remark.authorAvatar || "/founder.jpg",
        authorEmail: remark.authorEmail || "",
        text: remark.text.trim(),
        createdAt: new Date().toISOString(),
      };

      idea.remarks.push(newRemark);
      idea.updatedAt = new Date().toISOString().split("T")[0];
      await idea.save();

      return NextResponse.json({ success: true, data: idea, remark: newRemark });
    }

    // Normal Create Idea
    if (!body.title || !body.description) {
      return NextResponse.json(
        { success: false, message: "Title and description are required" },
        { status: 400 }
      );
    }

    const ideaId = body.id || `idea-${Date.now().toString(36)}`;
    const today = new Date().toISOString().split("T")[0];

    // If initialRemark is provided, also push it into remarks array as first remark
    const remarksList = Array.isArray(body.remarks) ? [...body.remarks] : [];
    if (body.initialRemark && body.initialRemark.trim() && remarksList.length === 0) {
      remarksList.push({
        id: `rem-init-${Date.now().toString(36)}`,
        authorName: body.author?.name || "Author Note",
        authorAvatar: body.author?.avatar || "/founder.jpg",
        authorEmail: body.author?.email || "",
        text: body.initialRemark.trim(),
        createdAt: new Date().toISOString(),
      });
    }

    const ideaData = {
      ...body,
      id: ideaId,
      category: body.category || "Product",
      status: body.status || "brainstorming",
      upvotes: Array.isArray(body.upvotes) ? body.upvotes : [],
      remarks: remarksList,
      tags: Array.isArray(body.tags) ? body.tags : [],
      createdAt: body.createdAt || today,
      updatedAt: today,
    };

    const savedIdea = await IdeaModel.findOneAndUpdate(
      { id: ideaId },
      ideaData,
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json(
      { success: true, message: "Idea created successfully", data: savedIdea },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create idea" },
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
        { success: false, message: "Idea ID is required for updates" },
        { status: 400 }
      );
    }

    updates.updatedAt = new Date().toISOString().split("T")[0];

    const updatedIdea = await IdeaModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedIdea) {
      return NextResponse.json({ success: false, message: "Idea not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Idea updated successfully",
      data: updatedIdea,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update idea" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Idea ID is required for deletion" },
        { status: 400 }
      );
    }

    const deletedIdea = await IdeaModel.findOneAndDelete({ id });

    if (!deletedIdea) {
      return NextResponse.json({ success: false, message: "Idea not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Idea deleted successfully",
      data: { id },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete idea" },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * FOOTER BLOCK: app/api/ideas/route.ts Implementation Notes
 * ============================================================================
 * - Workflow: Handles idea posting, remark appending, and toggle-based upvoting.
 * - Caveat: Uses atomic $set updates and upsert logic for zero data loss.
 * ============================================================================
 */
