/**
 * ============================================================================
 * HEADER BLOCK: components/AdminTeamView.tsx — Admin & Real Team Management
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Dedicated Admin Command Center enabling Super Admins to:
 * - Provision and manage real team member accounts
 * - Assign and change roles (Super Admin, Lead Architect, Developer, Ops, Viewer)
 * - Monitor active deliverables and assigned tasks per member
 * - Filter by role, access level, and account status (Active, Invited, Inactive)
 * - Directly trigger the MemberModal dialog to onboard or edit team members
 *
 * WHY THIS FILE EXISTS:
 * Fulfills user requirement: "admin panel for add real team account and manage their roles".
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Connects to useTaskStore, keeping team assignments synchronized across all projects and tasks.
 * ============================================================================
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Send,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  Check,
  Briefcase,
  Key,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { TeamMember, MemberAccessLevel, MemberStatus } from "@/lib/types";

interface AdminTeamViewProps {
  onOpenAddMemberModal: () => void;
  onOpenEditMemberModal: (member: TeamMember) => void;
}

export const AdminTeamView: React.FC<AdminTeamViewProps> = ({
  onOpenAddMemberModal,
  onOpenEditMemberModal,
}) => {
  const { teamMembers, tasks, projects, deleteTeamMember, searchQuery } = useTaskStore();

  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [localSearch, setLocalSearch] = useState<string>("");

  // Statistics
  const totalMembers = teamMembers.length;
  const activeMembersCount = teamMembers.filter((m) => m.status === "active").length;
  const adminCount = teamMembers.filter((m) => m.accessLevel === "admin" || m.accessLevel === "lead").length;

  const filteredMembers = useMemo(() => {
    return teamMembers.filter((member) => {
      // Global or local search
      const query = (localSearch || searchQuery).toLowerCase();
      if (query) {
        const matchesName = member.name.toLowerCase().includes(query);
        const matchesEmail = (member.email || "").toLowerCase().includes(query);
        const matchesRole = member.role.toLowerCase().includes(query);
        const matchesSkills = (member.skills || []).some((s) => s.toLowerCase().includes(query));
        if (!matchesName && !matchesEmail && !matchesRole && !matchesSkills) return false;
      }

      // Role filter
      if (roleFilter !== "all" && member.accessLevel !== roleFilter) return false;

      // Status filter
      if (statusFilter !== "all" && member.status !== statusFilter) return false;

      return true;
    });
  }, [teamMembers, localSearch, searchQuery, roleFilter, statusFilter]);

  const getAccessBadge = (access: MemberAccessLevel) => {
    switch (access) {
      case "admin":
        return {
          label: "Super Admin",
          class: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
        };
      case "lead":
        return {
          label: "Project Lead",
          class: "bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30",
        };
      case "developer":
        return {
          label: "Developer",
          class: "bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30",
        };
      case "ops":
        return {
          label: "Affiliate Ops",
          class: "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30",
        };
      case "viewer":
        return {
          label: "Viewer",
          class: "bg-muted text-muted-foreground border-border",
        };
    }
  };

  const getStatusBadge = (status: MemberStatus) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "invited":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "inactive":
        return "bg-slate-500/10 text-slate-500 border-slate-500/30";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* =========================================================================
          TOP COMMAND RIBBON: ADMIN HEADER & KPI METRICS
          ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 lg:p-5 rounded-xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-primary/10 text-primary border border-primary/20 shrink-0">
            <Users size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl lg:text-2xl font-heading font-extrabold text-foreground tracking-tight">
                Admin Team Management
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-primary/10 text-primary border border-primary/20">
                Access Control & Roles
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Provision real team accounts, manage roles, configure permissions, and monitor active deliverables.
            </p>
          </div>
        </div>

        {/* Action Button & Live Counters */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap shrink-0">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-muted/60 border border-border text-xs sm:text-sm">
            <span className="text-muted-foreground">Team Size:</span>
            <strong className="text-foreground font-bold">{totalMembers}</strong>
            <span className="text-border">|</span>
            <span className="text-muted-foreground">Active:</span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{activeMembersCount}</strong>
            <span className="text-border">|</span>
            <span className="text-muted-foreground">Admins:</span>
            <strong className="text-primary font-bold">{adminCount}</strong>
          </div>

          <button
            onClick={onOpenAddMemberModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-primary hover:bg-primary/90 shadow-sm transition-all whitespace-nowrap"
          >
            <UserPlus size={16} />
            <span>Add Team Account</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          CONTROLS TOOLBAR & FILTERS
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl bg-card border border-border shadow-xs text-xs sm:text-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search member, email, role, or skill..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>

        {/* Role & Status Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border">
            {(["all", "admin", "lead", "developer", "ops"] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setRoleFilter(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  roleFilter === lvl
                    ? "bg-card text-foreground shadow-xs font-extrabold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lvl === "all" ? "All Roles" : lvl}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs sm:text-sm rounded-xl bg-muted/60 border border-border text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="invited">Invited</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* =========================================================================
          TEAM MEMBERS GRID
          ========================================================================= */}
      {filteredMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl bg-card border border-border shadow-xs">
          <Users size={38} className="text-muted-foreground mb-3 opacity-50" />
          <h3 className="text-base font-bold text-foreground">No Team Members Found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            No team accounts match your filter criteria. Clear filters or add a new team member.
          </p>
          <button
            onClick={onOpenAddMemberModal}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-primary text-white"
          >
            <UserPlus size={16} />
            <span>Add Team Account</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const accessInfo = getAccessBadge(member.accessLevel);
            const statusClass = getStatusBadge(member.status);

            // Active tasks assigned to this person
            const assignedTasks = tasks.filter(
              (t) => t.assignee.name.toLowerCase().includes(member.name.toLowerCase().split(" ")[0])
            );
            const activeAssignedCount = assignedTasks.filter((t) => t.status !== "done").length;
            const completedAssignedCount = assignedTasks.filter((t) => t.status === "done").length;

            return (
              <div
                key={member.id}
                className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
              >
                {/* Header: Avatar, Name, Email, Access Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={member.avatar || "/founder.jpg"}
                        alt={member.name}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-border group-hover:border-primary transition-colors shadow-xs"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-card ${
                          member.status === "active"
                            ? "bg-emerald-500"
                            : member.status === "invited"
                            ? "bg-amber-500"
                            : "bg-slate-400"
                        }`}
                        title={`Status: ${member.status}`}
                      />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-base font-heading font-extrabold text-foreground truncate">
                        {member.name}
                      </h3>
                      <p className="text-xs font-semibold text-primary truncate">{member.role}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{member.email}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onOpenEditMemberModal(member)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground bg-muted/60 border border-border hover:border-primary/40 transition-colors"
                      title="Edit Account & Permissions"
                    >
                      <Edit2 size={13} />
                    </button>
                    {member.accessLevel !== "admin" && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove team account "${member.name}"?`)) {
                            deleteTeamMember(member.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 bg-muted/60 border border-border hover:border-red-500/20 transition-colors"
                        title="Remove Account"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Badges: Access Level + Status + Telegram */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 text-xs font-bold rounded-md border uppercase tracking-wider ${accessInfo.class}`}
                  >
                    {accessInfo.label}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-md border capitalize ${statusClass}`}
                  >
                    {member.status}
                  </span>
                  {member.telegramHandle && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-mono rounded-md bg-muted text-muted-foreground border border-border">
                      <Send size={10} className="text-sky-500" />
                      {member.telegramHandle}
                    </span>
                  )}
                </div>

                {/* Bio / Scope */}
                {member.bio && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {member.bio}
                  </p>
                )}

                {/* Skills */}
                {member.skills && member.skills.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {member.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md bg-muted/80 text-[11px] font-medium text-foreground border border-border/80"
                      >
                        {skill}
                      </span>
                    ))}
                    {member.skills.length > 4 && (
                      <span className="text-[11px] text-muted-foreground font-semibold">
                        +{member.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Footer: Live Deliverables & Joined Date */}
                <div className="flex items-center justify-between pt-3 border-t border-border/70 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {activeAssignedCount} Pending
                    </span>
                    <span className="text-border">|</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {completedAssignedCount} Done
                    </span>
                  </div>
                  <span>Joined: {member.joinedAt}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * ============================================================================
 * FOOTER BLOCK: components/AdminTeamView.tsx Implementation Notes
 * ============================================================================
 * - Workflow: Team administration board for role assignment, skills mapping, and account provisioning.
 * - Synchronization: Seamlessly links team member names to task assignments in useTaskStore.
 * ============================================================================
 */
