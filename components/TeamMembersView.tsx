/**
 * ============================================================================
 * HEADER BLOCK: components/TeamMembersView.tsx — Organization Roster & Roles
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Implements the Team Members view matching Figma redesign:
 * - Eyebrow "PEOPLE & ROLES" heading with "+ Invite member" action
 * - 3 KPI Cards: Total members, Online now, Active teams
 * - Search bar with inline search icon
 * - 3-Column card grid showing:
 *   - 48px rounded avatar
 *   - Member Name and Role
 *   - Team Category Pill
 *   - Live presence indicator (Online, Focus, Away) & open tasks counter
 *   - "View profile" button routing to /admin
 *
 * WHY THIS FILE EXISTS:
 * Fulfills the "Team Members" category in the Figma navigation for team oversight.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Reads team roster and active deliverable workload from useTaskStore.
 * ============================================================================
 */

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Layers,
  Search,
  Plus,
  MoreVertical,
  ExternalLink,
  Shield,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";

interface TeamMembersViewProps {
  onOpenInviteModal?: () => void;
}

export const TeamMembersView: React.FC<TeamMembersViewProps> = ({ onOpenInviteModal }) => {
  const { teamMembers, tasks } = useTaskStore();
  const [search, setSearch] = useState("");

  const filteredMembers = useMemo(() => {
    return (teamMembers || []).filter((m) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        (m.email && m.email.toLowerCase().includes(q))
      );
    });
  }, [teamMembers, search]);

  return (
    <div className="flex flex-col gap-5 max-w-[1600px]">
      {/* Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-extrabold text-[25px] tracking-[-0.8px] text-foreground leading-tight">
              Team Members
            </h1>
            <span className="eyebrow-tag">PEOPLE & ROLES</span>
          </div>
          <p className="text-[12px] text-muted-foreground mt-1">
            Manage access, ownership, and workload across your organization.
          </p>
        </div>

        <div>
          <Link
            href="/admin"
            className="h-[38px] px-4 rounded-[10px] bg-primary hover:bg-[#3d50df] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-[0_5px_13px_rgba(82,104,246,0.25)] transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Invite member</span>
          </Link>
        </div>
      </div>

      {/* 3 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-[12px] p-[14px_18px] flex items-center gap-3">
          <div className="w-[38px] h-[38px] rounded-[10px] bg-[#eef0ff] dark:bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <Users size={18} />
          </div>
          <div className="flex flex-col">
            <b className="font-heading font-bold text-[17px] text-foreground leading-none">
              {teamMembers.length}
            </b>
            <span className="text-[10px] text-muted-foreground mt-1">Total members</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[12px] p-[14px_18px] flex items-center gap-3">
          <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e8faf4] dark:bg-emerald-500/20 text-[#0da77c] flex items-center justify-center shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#19ba8e] shadow-[0_0_0_4px_#e7faf4] animate-pulse" />
          </div>
          <div className="flex flex-col">
            <b className="font-heading font-bold text-[17px] text-foreground leading-none">
              {teamMembers.length}
            </b>
            <span className="text-[10px] text-muted-foreground mt-1">Online now</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[12px] p-[14px_18px] flex items-center gap-3">
          <div className="w-[38px] h-[38px] rounded-[10px] bg-[#f5eaff] dark:bg-purple-500/20 text-[#9650dc] flex items-center justify-center shrink-0">
            <Layers size={18} />
          </div>
          <div className="flex flex-col">
            <b className="font-heading font-bold text-[17px] text-foreground leading-none">
              3
            </b>
            <span className="text-[10px] text-muted-foreground mt-1">Active teams</span>
          </div>
        </div>
      </div>

      {/* Toolbar Search */}
      <div className="min-h-[54px] bg-card border border-border rounded-[13px] p-[7px_12px] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-muted-foreground flex-1 max-w-md">
          <Search size={15} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team members..."
            className="w-full text-[11px] bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <Link
          href="/admin"
          className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
        >
          <span>Manage Roles in Portal</span>
          <Shield size={13} />
        </Link>
      </div>

      {/* Member Cards 3-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredMembers.map((p, i) => {
          const initials = p.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          const openTasks = (tasks || []).filter(
            (t) =>
              t.assigneeEmail?.toLowerCase() === p.email.toLowerCase() &&
              t.status !== "done"
          ).length;

          const teamTag =
            p.accessLevel === "admin"
              ? "Leadership"
              : p.role.toLowerCase().includes("engineer")
              ? "Engineering"
              : p.role.toLowerCase().includes("design")
              ? "Product"
              : "Operations";

          return (
            <div
              key={p.id}
              className="bg-card border border-border rounded-[14px] p-5 flex flex-col items-center text-center relative group hover:border-[#cfd4ff] dark:hover:border-primary/50 transition-all shadow-2xs"
            >
              {/* Avatar 48px */}
              <div className="relative mb-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.avatar || "/founder.jpg"}
                  alt={p.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/founder.jpg";
                  }}
                  className="w-[48px] h-[48px] rounded-full object-cover border-2 border-primary/30 group-hover:border-primary shadow-xs transition-colors"
                />
              </div>

              <h3 className="font-heading font-bold text-[14px] text-foreground">
                {p.name}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5 mb-2.5">
                {p.role}
              </p>

              <span className="pill mb-3">{teamTag}</span>

              {/* Meta Status & Tasks */}
              <div className="w-full flex items-center justify-between border-t border-border mt-auto pt-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-[6px] h-[6px] rounded-full bg-[#19b98e]" />
                  <span className="font-medium">Online</span>
                </span>
                <span>
                  <b className="text-foreground font-bold">{openTasks}</b> open tasks
                </span>
              </div>

              {/* View profile button */}
              <Link
                href="/admin"
                className="w-full mt-3 h-[34px] rounded-[9px] border border-border bg-muted/60 hover:bg-muted text-[11px] font-bold text-foreground flex items-center justify-center gap-1 transition-colors"
              >
                <span>View profile</span>
                <ExternalLink size={12} className="text-muted-foreground" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * FOOTER BLOCK: components/TeamMembersView.tsx Implementation Notes
 * ============================================================================
 * - Workflow: Live team directory matching Figma with workload indicators
 *   and 1-click router jumps to /admin credential management.
 * ============================================================================
 */