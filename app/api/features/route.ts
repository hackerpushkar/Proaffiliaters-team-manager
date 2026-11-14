/**
 * ============================================================================
 * HEADER BLOCK: app/api/features/route.ts — Upcoming Features CRUD API
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Provides enterprise REST endpoints for Module 2: Upcoming Features:
 * - GET: Retrieves all brainstormed features sorted by custom order & createdAt
 * - POST: Creates or upserts a new feature with research points and attachments
 * - PUT: Updates feature lifecycle phase, notes, points, docs, or upvotes
 * - DELETE: Permanently purges a feature from MongoDB database by ID
 *
 * WHY THIS FILE EXISTS:
 * Solves the critical bug where deleted upcoming features/projects would resurrect
 * and newly added features were not persisted to MongoDB.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Called in real-time by useTaskStore (addFeature, updateFeature, deleteFeature,
 * voteFeature, addFeaturePoint, etc.) to guarantee continuous persistence.
 * ============================================================================
 */

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { FeatureModel } from "@/models/Feature";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const feature = await FeatureModel.findOne({ id }).lean();
      if (!feature) {
        return NextResponse.json(
          { success: false, message: "Feature not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: feature });
    }

    const features = await FeatureModel.find({})
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: features });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch features" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json(
        { success: false, message: "Feature name is required" },
        { status: 400 }
      );
    }

    const featureId = body.id || `feat-${Date.now().toString(36)}`;
    const featureData = {
      ...body,
      id: featureId,
      author: body.author || "Pushkar (Founder)",
      createdAt: body.createdAt || new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    const savedFeature = await FeatureModel.findOneAndUpdate(
      { id: featureId },
      featureData,
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Feature saved to database successfully",
        data: savedFeature,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create feature" },
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
        { success: false, message: "Feature ID is required for updates" },
        { status: 400 }
      );
    }

    updates.updatedAt = new Date().toISOString().split("T")[0];

    const updatedFeature = await FeatureModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedFeature) {
      return NextResponse.json(
        { success: false, message: "Feature not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Feature updated successfully",
      data: updatedFeature,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update feature" },
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
        { success: false, message: "Feature ID query param is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const deleted = await FeatureModel.findOneAndDelete({ id });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Feature not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Feature ${id} permanently removed from database`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete feature" },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * FOOTER BLOCK: app/api/features/route.ts Implementation Notes & Caveats
 * ============================================================================
 * - Workflow & Execution: Connects Next.js App Router to FeatureModel in MongoDB.
 * - Data Movement: Incoming HTTP JSON payloads -> Mongoose schema validation -> MongoDB.
 * - Key Exports: GET, POST, PUT, DELETE route handlers.
 * - Caveats to Avoid Regressions:
 *   1. Always use { upsert: true } on POST to ensure idempotent saves.
 *   2. Queries must match on unique string id (not MongoDB _id).
 *   3. DELETE must delete by { id } to match client id tokens ('feat-xxx').
 * ============================================================================
 */
