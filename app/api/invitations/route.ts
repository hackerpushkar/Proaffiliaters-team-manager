/**
 * ============================================================================
 * HEADER BLOCK: app/api/invitations/route.ts — Project Team Invites API
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Handles the Gmail project invitation and approval workflow:
 * - GET: Retrieves pending project invitations for an employee's email address
 * - POST: Creates and records a new project invitation sent to a teammate's Gmail
 * - PUT: Handles approval or decline of the invitation. If approved, adds the member
 *   to the project's teamMemberEmails list.
 *
 * WHY THIS FILE EXISTS:
 * Enables peer project collaboration without manual admin intervention.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Called from ProjectModal/InviteTeammateModal and the notification bell dropdown.
 * ============================================================================
 */

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ProjectInvitationModel } from "@/models/ProjectInvitation";
import { ProjectModel } from "@/models/Project";

export const dynamic = "force-dynamic";

// GET: fetch invitations for user (?email=...)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email query param is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const invitations = await ProjectInvitationModel.find({
      inviteeEmail: email.toLowerCase().trim(),
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: invitations });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}

// POST: create new project invitation
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      projectId,
      projectName,
      projectColor,
      inviterName,
      inviterEmail,
      inviteeEmail,
    } = body;

    if (!projectId || !inviteeEmail || !inviterEmail) {
      return NextResponse.json(
        { success: false, message: "Missing required fields (projectId, inviteeEmail, inviterEmail)" },
        { status: 400 }
      );
    }

    const cleanInviteeEmail = inviteeEmail.trim().toLowerCase();
    const cleanInviterEmail = inviterEmail.trim().toLowerCase();

    await connectToDatabase();

    // Check if invitation already pending
    const existing = await ProjectInvitationModel.findOne({
      projectId,
      inviteeEmail: cleanInviteeEmail,
      status: "pending",
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "An invitation is already pending for this teammate" },
        { status: 400 }
      );
    }

    const inviteId = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newInvite = await ProjectInvitationModel.create({
      id: inviteId,
      projectId,
      projectName: projectName || "Project Initiative",
      projectColor: projectColor || "#3b5bfa",
      inviterName: inviterName || "Team Lead",
      inviterEmail: cleanInviterEmail,
      inviteeEmail: cleanInviteeEmail,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    // Also register in project pendingInvites
    await ProjectModel.findOneAndUpdate(
      { id: projectId },
      { $addToSet: { pendingInvites: cleanInviteeEmail } }
    );

    return NextResponse.json({
      success: true,
      message: `Invitation successfully sent to ${cleanInviteeEmail}`,
      data: newInvite,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to send invitation" },
      { status: 500 }
    );
  }
}

// PUT: respond to an invitation (accept or decline)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { invitationId, action, userEmail } = body;

    if (!invitationId || !action || !["accept", "decline"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Valid invitationId and action ('accept' | 'decline') required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const invite = await ProjectInvitationModel.findOne({ id: invitationId });

    if (!invite) {
      return NextResponse.json(
        { success: false, message: "Invitation not found" },
        { status: 404 }
      );
    }

    const newStatus = action === "accept" ? "accepted" : "declined";
    invite.status = newStatus;
    invite.respondedAt = new Date().toISOString();
    await invite.save();

    // If accepted, add teammate email to Project.teamMemberEmails
    if (action === "accept") {
      const emailToJoin = userEmail ? userEmail.trim().toLowerCase() : invite.inviteeEmail;
      await ProjectModel.findOneAndUpdate(
        { id: invite.projectId },
        {
          $addToSet: { teamMemberEmails: emailToJoin },
          $pull: { pendingInvites: emailToJoin },
        }
      );
    } else {
      // If declined, remove from pendingInvites
      await ProjectModel.findOneAndUpdate(
        { id: invite.projectId },
        { $pull: { pendingInvites: invite.inviteeEmail } }
      );
    }

    return NextResponse.json({
      success: true,
      message: action === "accept" ? "Joined project successfully!" : "Invitation declined",
      data: invite,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process invitation response" },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * FOOTER BLOCK: app/api/invitations/route.ts Implementation Notes
 * ============================================================================
 * - Workflow: Creates invites, notifies users, and adds them to project rosters.
 * - Caveats: Atomic $addToSet ensures no duplicate emails in project rosters.
 * ============================================================================
 */
