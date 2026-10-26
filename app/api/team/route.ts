/**
 * ============================================================================
 * HEADER BLOCK: app/api/team/route.ts — Team Member API Endpoints
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Exposes REST API endpoints for:
 * - GET: Fetching all team member accounts
 * - POST: Creating a new team member account
 * - PUT: Updating an existing member's role, skills, or permissions
 * - DELETE: Removing a team member
 *
 * WHY THIS FILE EXISTS:
 * Connects the Admin Team Management panel to MongoDB for real user persistence.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Called by client data layer and sync routines.
 * ============================================================================
 */

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { TeamMemberModel } from "@/models/TeamMember";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const members = await TeamMemberModel.find({}).sort({ createdAt: 1 }).lean();
    return NextResponse.json({ success: true, data: members });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.name || !body.email || !body.role) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: name, email, role" },
        { status: 400 }
      );
    }

    const memberId = body.id || `tm-${Date.now().toString(36)}`;
    const newMember = await TeamMemberModel.findOneAndUpdate(
      { id: memberId },
      {
        ...body,
        id: memberId,
        joinedAt: body.joinedAt || new Date().toISOString().split("T")[0],
      },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: newMember }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create team member" },
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
      return NextResponse.json({ success: false, message: "Missing member ID" }, { status: 400 });
    }

    const updated = await TeamMemberModel.findOneAndUpdate({ id }, updates, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update team member" },
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
      return NextResponse.json({ success: false, message: "Missing member ID" }, { status: 400 });
    }

    await TeamMemberModel.findOneAndDelete({ id });
    return NextResponse.json({ success: true, message: "Member deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete team member" },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * FOOTER BLOCK: app/api/team/route.ts Implementation Notes
 * ============================================================================
 * - Workflow: Validates inputs, connects to MongoDB, and returns standardized JSON.
 * - HTTP Status: Returns 201 on create, 400 on invalid payload, 500 on database failure.
 * ============================================================================
 */
