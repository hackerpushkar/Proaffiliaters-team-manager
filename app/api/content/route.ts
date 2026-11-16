/**
 * ============================================================================
 * HEADER BLOCK: app/api/content/route.ts — Content Manager CRUD API
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Provides enterprise REST endpoints for Content Pieces (Organic Videos) and
 * Paid Advertising Creatives (Ads):
 * - GET: Retrieves all content items sorted by endDate and createdAt
 *        (supports ?type=organic|ad, ?status=..., ?archived=true|false)
 * - POST: Creates or upserts a new content item with deadlines and assets
 * - PUT: Updates content pipeline stage, dates, resource links, and archive state
 * - DELETE: Permanently purges a content item from MongoDB by ID
 *
 * WHY THIS FILE EXISTS:
 * Ensures full database persistence and cross-device synchronization for the
 * new Content Manager module.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Called in real-time by useTaskStore (addContentItem, updateContentItem,
 * deleteContentItem, moveContentStatus) to guarantee continuous persistence.
 * ============================================================================
 */

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ContentItemModel } from "@/models/ContentItem";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");
    const archived = searchParams.get("archived");

    if (id) {
      const item = await ContentItemModel.findOne({ id }).lean();
      if (!item) {
        return NextResponse.json(
          { success: false, message: "Content item not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: item });
    }

    const query: any = {};
    if (type) query.type = type;
    if (archived !== null && archived !== undefined) {
      query.isArchived = archived === "true";
    }

    const items = await ContentItemModel.find(query)
      .sort({ endDate: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch content items" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.title || !body.type || !body.endDate) {
      return NextResponse.json(
        { success: false, message: "Title, type, and endDate are required" },
        { status: 400 }
      );
    }

    const contentId = body.id || `cnt-${Date.now().toString(36)}`;
    const today = new Date().toISOString().split("T")[0];

    const contentData = {
      ...body,
      id: contentId,
      startDate: body.startDate || today,
      status: body.status || "researching",
      isArchived: body.isArchived || false,
      createdAt: body.createdAt || today,
      updatedAt: today,
    };

    const savedItem = await ContentItemModel.findOneAndUpdate(
      { id: contentId },
      contentData,
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Content item saved to database successfully",
        data: savedItem,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create content item" },
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
        { success: false, message: "Content ID is required for updates" },
        { status: 400 }
      );
    }

    updates.updatedAt = new Date().toISOString().split("T")[0];

    // Auto-stamp completedAt when transitioning to 'public' or 'live'
    if (
      (updates.status === "public" || updates.status === "live") &&
      !updates.completedAt
    ) {
      updates.completedAt = new Date().toISOString().split("T")[0];
    }

    const updatedItem = await ContentItemModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return NextResponse.json(
        { success: false, message: "Content item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Content item updated successfully",
      data: updatedItem,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update content item" },
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
        { success: false, message: "Content ID query param is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const deleted = await ContentItemModel.findOneAndDelete({ id });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Content item not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Content item ${id} permanently removed from database`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete content item" },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * FOOTER BLOCK: app/api/content/route.ts Implementation Notes & Caveats
 * ============================================================================
 * - Workflow & Execution: Connects Next.js App Router to ContentItemModel in MongoDB.
 * - Data Movement: Incoming JSON -> Mongoose validation -> MongoDB persistence.
 * - Key Exports: GET, POST, PUT, DELETE route handlers.
 * - Caveats to Avoid Regressions:
 *   1. Always match by unique string id (e.g. 'cnt-xxx').
 *   2. Set completedAt timestamp automatically when moving to 'public' or 'live'.
 * ============================================================================
 */
