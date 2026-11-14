/**
 * ============================================================================
 * HEADER BLOCK: app/api/fixes/route.ts — Bug Fixes & Platform Updates API
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Provides enterprise REST endpoints for Module 3: Fix & Updates:
 * - GET: Retrieves all bug triage items and platform updates sorted by createdAt
 * - POST: Creates or upserts a new bug report or platform update changelog
 * - PUT: Updates fix severity, status lifecycle, resolution notes, and deployed timestamp
 * - DELETE: Permanently purges a fix/update from MongoDB database by ID
 *
 * WHY THIS FILE EXISTS:
 * Solves the critical bug where fixes and updates would disappear after some time
 * due to missing backend persistence.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Called in real-time by useTaskStore (addFix, updateFix, deleteFix) to ensure
 * instantaneous database writes and cross-session persistence.
 * ============================================================================
 */

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { FixModel } from "@/models/Fix";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const fix = await FixModel.findOne({ id }).lean();
      if (!fix) {
        return NextResponse.json(
          { success: false, message: "Fix/Update not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: fix });
    }

    const fixes = await FixModel.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: fixes });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch fixes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.name || !body.affectedComponent) {
      return NextResponse.json(
        { success: false, message: "Name and affectedComponent are required" },
        { status: 400 }
      );
    }

    const fixId = body.id || `fix-${Date.now().toString(36)}`;
    const fixData = {
      ...body,
      id: fixId,
      reportedBy: body.reportedBy || "Pushkar (Founder)",
      createdAt: body.createdAt || new Date().toISOString().split("T")[0],
    };

    const savedFix = await FixModel.findOneAndUpdate(
      { id: fixId },
      fixData,
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Fix/Update saved to database successfully",
        data: savedFix,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create fix" },
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
        { success: false, message: "Fix ID is required for updates" },
        { status: 400 }
      );
    }

    // Auto-stamp resolvedAt when deployed
    if (updates.status === "deployed" && !updates.resolvedAt) {
      updates.resolvedAt = new Date().toISOString().split("T")[0];
    }

    const updatedFix = await FixModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedFix) {
      return NextResponse.json(
        { success: false, message: "Fix/Update not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Fix/Update updated successfully",
      data: updatedFix,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update fix" },
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
        { success: false, message: "Fix ID query param is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const deleted = await FixModel.findOneAndDelete({ id });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Fix/Update not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Fix/Update ${id} permanently removed from database`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete fix" },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * FOOTER BLOCK: app/api/fixes/route.ts Implementation Notes & Caveats
 * ============================================================================
 * - Workflow & Execution: Connects Next.js App Router to FixModel in MongoDB.
 * - Data Movement: Incoming HTTP JSON payloads -> Mongoose schema validation -> MongoDB.
 * - Key Exports: GET, POST, PUT, DELETE route handlers.
 * - Caveats to Avoid Regressions:
 *   1. Always use { upsert: true } on POST for idempotent saves.
 *   2. Matches on custom string id ('fix-xxx'), not MongoDB _id.
 *   3. DELETE must delete by { id } to properly purge items removed from UI.
 * ============================================================================
 */
