/**
 * ============================================================================
 * HEADER BLOCK: components/InviteTeammateModal.tsx — Project Invites Dialog
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Modal dialog enabling project owners to invite colleagues by Gmail:
 * - Enter any Gmail address to send an invitation request
 * - Quick-pick colleagues from the registered team directory
 * - View existing joined teammates with role badges
 * - View pending invitations awaiting recipient approval
 *
 * WHY THIS FILE EXISTS:
 * Fulfills the requirement: "when user create projects also option to add team mates,
 * user add their gmail and after that request goes to other member if they approve
 * they are joined in project."
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Dispatches sendProjectInvite via useTaskStore; updates MongoDB and client state.
 * ============================================================================
 */

"use client";

import React, { useState } from "react";
import {
  X,
  UserPlus,
  Mail,
  Send,
  CheckCircle2,
  Clock,
  Shield,
  Users,
  AlertCircle,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { OngoingProject } from "@/lib/types";

interface InviteTeammateModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: OngoingProject | null;
}

export const InviteTeammateModal: React.FC<InviteTeammateModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const { teamMembers, invitations, sendProjectInvite, removeProjectTeammate } = useTaskStore();

  const [gmailInput, setGmailInput] = useState("");
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !project) return null;

  const joinedEmails = project.teamMemberEmails || [];
  const projectInvites = invitations.filter(
    (inv) => inv.projectId === project.id && inv.status === "pending"
  );

  const handleSendInvite = async (emailToSend: string) => {
    const targetEmail = (emailToSend || gmailInput).trim().toLowerCase();
    if (!targetEmail) {
      setStatusMsg({ type: "error", text: "Please enter a valid Gmail address." });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);

    const result = await sendProjectInvite(project.id, targetEmail);
    setIsSubmitting(false);

    if (result.success) {
      setStatusMsg({ type: "success", text: result.message });
      setGmailInput("");
    } else {
      setStatusMsg({ type: "error", text: result.message });
    }
  };

  // Colleagues in directory not yet in project
  const eligibleDirectoryMembers = teamMembers.filter(
    (m) =>
      !joinedEmails.map((e) => e.toLowerCase()).includes(m.email.toLowerCase()) &&
      !projectInvites.some((inv) => inv.inviteeEmail.toLowerCase() === m.email.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Dimmed Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Slide-Over Drawer Container */}
      <div
        className="relative w-full max-w-xl bg-card border-l border-border shadow-2xl h-full flex flex-col z-10 animate-slideInRight overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Gradient Bar */}
        <div
          className="h-1.5 w-full shrink-0"
          style={{ background: `linear-gradient(90deg, ${project.color}, #7c3aed)` }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/95 backdrop-blur-xs shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs"
              style={{ backgroundColor: `${project.color}20`, color: project.color }}
            >
              <UserPlus size={16} />
            </div>
            <div>
              <h2 className="font-heading font-bold text-sm text-foreground">
                Invite Teammates to Project
              </h2>
              <p className="text-[11px] text-muted-foreground truncate max-w-xs">
                {project.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-5 overflow-y-auto">
          {/* Status feedback */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                statusMsg.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
              }`}
            >
              {statusMsg.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Direct Gmail Input Form */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Enter Teammate Gmail / Work Email
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1 flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={gmailInput}
                  onChange={(e) => setGmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSendInvite(gmailInput);
                    }
                  }}
                  placeholder="colleague@gmail.com or @proaffiliaters.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>
              <button
                type="button"
                onClick={() => handleSendInvite(gmailInput)}
                disabled={isSubmitting || !gmailInput.trim()}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Send size={13} />
                <span>Invite</span>
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              The recipient will receive an interactive join request banner in their dashboard to approve.
            </p>
          </div>

          {/* Quick Select from Directory */}
          {eligibleDirectoryMembers.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                Or Quick-Invite from Team Directory
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {eligibleDirectoryMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={member.avatar || "/founder.jpg"}
                        alt={member.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-foreground truncate">
                          {member.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {member.email}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSendInvite(member.email)}
                      disabled={isSubmitting}
                      className="px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-[11px] font-bold transition-all shrink-0 active:scale-95"
                    >
                      + Send
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Invitations list */}
          {projectInvites.length > 0 && (
            <div className="pt-2 border-t border-border">
              <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1 mb-2">
                <Clock size={12} />
                <span>Pending Approvals ({projectInvites.length})</span>
              </span>
              <div className="space-y-1.5">
                {projectInvites.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-amber-500" />
                      <span className="font-medium text-foreground">{inv.inviteeEmail}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      Awaiting Response
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Joined Teammates */}
          <div className="pt-2 border-t border-border">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2 flex items-center gap-1">
              <Users size={12} className="text-primary" />
              <span>Joined Teammates ({joinedEmails.length})</span>
            </span>

            {joinedEmails.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No teammates have joined this project yet.
              </p>
            ) : (
              <div className="space-y-1.5">
                {joinedEmails.map((email) => {
                  const member = teamMembers.find(
                    (m) => m.email.toLowerCase() === email.toLowerCase()
                  );
                  return (
                    <div
                      key={email}
                      className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={member?.avatar || "/founder.jpg"}
                          alt={member?.name || email}
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-semibold text-foreground">
                            {member?.name || email}
                          </span>
                          {member && (
                            <span className="text-[10px] text-muted-foreground ml-2">
                              ({member.role})
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={10} />
                        <span>Active Member</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-muted/40 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold border border-border transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * FOOTER BLOCK: components/InviteTeammateModal.tsx Implementation Notes
 * ============================================================================
 * - Workflow: Direct invite dispatch via sendProjectInvite in useTaskStore.
 * - Caveat: Checks for duplicate invitations and existing memberships.
 * ============================================================================
 */
