/**
 * ============================================================================
 * HEADER BLOCK: components/FixUpdatesView.tsx — Issue Triage & Patch Management
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Implements Category 3: "Fix & Updates".
 * Enables the Proaffiliaters engineering team to:
 * - Post Platform Updates (releases, version rollouts, changelogs, patches)
 * - Report & Debug System Fixes (bugs, root cause diagnostics, severity triage)
 * - Switch between All, Fixes, and Updates with 1-click segmented views
 * - Track resolution notes, deployment timestamps, and affected subsystems
 * - Increased typography scale matching Ongoing Projects (16px–18px titles, 14px–16px body)
 *
 * WHY THIS FILE EXISTS:
 * Fulfills the user requirement: "here add 2 button for updates and second for fix
 * and edit the page according, redesign according to them and also increase the font size
 * like ongoing projects section".
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Connects to useTaskStore to manage fixes, trigger dedicated modals, and update statuses.
 * ============================================================================
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Wrench,
  Rocket,
  CheckCircle2,
  Clock,
  Tag,
  Plus,
  Filter,
  ShieldAlert,
  Server,
  Zap,
  Check,
  Edit2,
  Trash2,
  Sparkles,
  GitCommit,
  AlertTriangle,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { FixUpdate, FixSeverity, FixStatus } from "@/lib/types";

interface FixUpdatesViewProps {
  onOpenAddFixModal?: () => void;
  onOpenAddUpdateModal?: () => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (fix: FixUpdate) => void;
}

type ItemTypeFilter = "all" | "fixes" | "updates";

export const FixUpdatesView: React.FC<FixUpdatesViewProps> = ({
  onOpenAddFixModal,
  onOpenAddUpdateModal,
  onOpenAddModal,
  onOpenEditModal,
}) => {
  const { fixes, updateFix, deleteFix, searchQuery } = useTaskStore();

  const [typeFilter, setTypeFilter] = useState<ItemTypeFilter>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Helper to determine if an item is an Update vs a Fix
  const isUpdateItem = (fix: FixUpdate): boolean => {
    return (
      fix.severity === "patch" ||
      fix.status === "deployed" ||
      fix.name.toLowerCase().includes("update") ||
      fix.name.toLowerCase().includes("rollout") ||
      fix.name.toLowerCase().includes("release")
    );
  };

  const fixesCount = useMemo(() => fixes.filter((f) => !isUpdateItem(f)).length, [fixes]);
  const updatesCount = useMemo(() => fixes.filter((f) => isUpdateItem(f)).length, [fixes]);

  const filteredFixes = useMemo(() => {
    return fixes.filter((fix) => {
      // Type filter (All vs Fixes vs Updates)
      if (typeFilter === "fixes" && isUpdateItem(fix)) return false;
      if (typeFilter === "updates" && !isUpdateItem(fix)) return false;

      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = fix.name.toLowerCase().includes(q);
        const matchesDesc = fix.description.toLowerCase().includes(q);
        const matchesComp = fix.affectedComponent.toLowerCase().includes(q);
        const matchesVer = fix.versionTag.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesComp && !matchesVer) return false;
      }

      // Severity & Status
      if (severityFilter !== "all" && fix.severity !== severityFilter) return false;
      if (statusFilter !== "all" && fix.status !== statusFilter) return false;
      return true;
    });
  }, [fixes, typeFilter, searchQuery, severityFilter, statusFilter]);

  const getSeverityBadge = (severity: FixSeverity) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30";
      case "major":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "minor":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30";
      case "patch":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    }
  };

  const getStatusBadge = (status: FixStatus) => {
    switch (status) {
      case "reported":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30";
      case "investigating":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30";
      case "fixing":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30";
      case "verified":
        return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-500/30";
      case "deployed":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30";
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* =========================================================================
          TOP COMMAND RIBBON WITH DEDICATED BUTTONS: + REPORT FIX & + POST UPDATE
          ========================================================================= */}
      {/* Top Header & Command Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-heading font-extrabold text-foreground tracking-tight">
              Fix & Updates
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              DIAGNOSTICS & RELEASES
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track root cause diagnostics, resolve anomalies, and log platform version patches.
          </p>
        </div>

        {/* 2 DEDICATED ACTION BUTTONS */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0 self-start sm:self-auto">
          {/* Button 1: Post Update */}
          <button
            onClick={onOpenAddUpdateModal || onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold text-xs text-white bg-primary hover:bg-primary/90 shadow-2xs transition-all active:scale-98 whitespace-nowrap"
            title="Post a new platform or service update"
          >
            <Rocket size={14} />
            <span>Post Update</span>
          </button>

          {/* Button 2: Report Fix */}
          <button
            onClick={onOpenAddFixModal || onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold text-xs text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 shadow-2xs transition-all whitespace-nowrap"
            title="Report a bug or system issue for investigation"
          >
            <Wrench size={14} />
            <span>Report Fix</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          CONTROLS & CATEGORY FILTER BAR (ALL / FIXES / UPDATES)
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-2.5 rounded-xl bg-card border border-border shadow-2xs text-xs">
        {/* Left: View Mode Segmented Switch (All / Fixes / Updates) */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border/40">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              typeFilter === "all"
                ? "bg-card text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Items ({fixes.length})
          </button>

          <button
            onClick={() => setTypeFilter("fixes")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              typeFilter === "fixes"
                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-rose-500"
            }`}
          >
            <Wrench size={13} />
            <span>Fixes ({fixesCount})</span>
          </button>

          <button
            onClick={() => setTypeFilter("updates")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              typeFilter === "updates"
                ? "bg-primary/15 text-primary border border-primary/25 shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            <Rocket size={13} />
            <span>Updates ({updatesCount})</span>
          </button>
        </div>

        {/* Right: Severity and Status Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Severity Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {["all", "critical", "major", "minor", "patch"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  severityFilter === sev
                    ? "bg-primary text-white shadow-xs"
                    : "bg-muted/80 text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                {sev === "all" ? "All" : sev}
              </button>
            ))}
          </div>

          <span className="text-border">|</span>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-card border border-border text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="investigating">Investigating</option>
              <option value="fixing">Fixing</option>
              <option value="verified">Verified</option>
              <option value="deployed">Deployed</option>
            </select>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ITEMS LIST (UPGRADED HIGH-DENSITY & READABLE CARDS)
          ========================================================================= */}
      {filteredFixes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl bg-card border border-border shadow-xs">
          <Wrench size={38} className="text-muted-foreground mb-3 opacity-50" />
          <h3 className="text-base font-bold text-foreground">
            {typeFilter === "fixes"
              ? "No bug fixes reported"
              : typeFilter === "updates"
              ? "No platform updates posted"
              : "No fixes or updates found"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Everything is running smoothly! Use the buttons below to document a fix or publish an update.
          </p>
          <div className="flex items-center gap-2.5 mt-4">
            <button
              onClick={onOpenAddUpdateModal || onOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold bg-primary text-white"
            >
              <Rocket size={15} />
              Post Update
            </button>
            <button
              onClick={onOpenAddFixModal || onOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold bg-muted text-foreground border border-border hover:border-red-500/40"
            >
              <Wrench size={15} className="text-red-500" />
              Report Fix
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {filteredFixes.map((item) => {
            const isUpdate = isUpdateItem(item);

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-xl border shadow-xs transition-all flex flex-col gap-3.5 ${
                  isUpdate
                    ? "bg-card border-border hover:border-primary/50"
                    : "bg-card border-border hover:border-red-500/50"
                }`}
              >
                {/* Header Row: Type Badge, Component, Severity, Title & Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      {/* TYPE INDICATOR */}
                      {isUpdate ? (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 text-xs font-extrabold rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
                          <Rocket size={12} />
                          Update
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 text-xs font-extrabold rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 uppercase tracking-wide">
                          <Wrench size={12} />
                          Fix
                        </span>
                      )}

                      {/* SEVERITY BADGE */}
                      <span
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-md border uppercase tracking-wider ${getSeverityBadge(
                          item.severity
                        )}`}
                      >
                        {item.severity}
                      </span>

                      {/* STATUS BADGE */}
                      <span
                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border capitalize ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>

                      {/* AFFECTED COMPONENT */}
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-muted border border-border text-foreground text-xs font-mono font-bold">
                        <Server size={12} className="text-primary" />
                        {item.affectedComponent}
                      </span>

                      {/* VERSION TAG */}
                      <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground font-semibold">
                        <GitCommit size={12} />
                        {item.versionTag}
                      </span>
                    </div>

                    {/* ITEM TITLE (INCREASED FONT SIZE: 16px - 18px) */}
                    <h3 className="text-base sm:text-lg font-heading font-extrabold text-foreground tracking-tight leading-snug">
                      {item.name}
                    </h3>
                  </div>

                  {/* Right: Quick Status Mover & Edit/Delete */}
                  <div className="flex items-center gap-2 shrink-0 self-start lg:self-auto">
                    <select
                      value={item.status}
                      onChange={(e) => updateFix(item.id, { status: e.target.value as FixStatus })}
                      className="px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs cursor-pointer"
                    >
                      <option value="reported">Reported</option>
                      <option value="investigating">Investigating</option>
                      <option value="fixing">Fixing</option>
                      <option value="verified">Verified</option>
                      <option value="deployed">Deployed</option>
                    </select>

                    <button
                      onClick={() => onOpenEditModal(item)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground bg-muted border border-border hover:border-primary/40 transition-colors"
                      title="Edit Details"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete "${item.name}"?`)) {
                          deleteFix(item.id);
                        }
                      }}
                      className="p-2 rounded-lg text-muted-foreground hover:text-red-500 bg-muted border border-border hover:border-red-500/20 transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Description & Root Cause Block (INCREASED FONT SIZE: 14px - 16px) */}
                <div className={`p-4 rounded-xl border ${
                  isUpdate
                    ? "bg-muted/30 border-border"
                    : "bg-muted/40 border-border"
                }`}>
                  <div className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-1.5">
                    {isUpdate ? "Update Highlights & Summary:" : "Root Cause & Symptom:"}
                  </div>
                  <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-wrap font-normal">
                    {item.description}
                  </p>

                  {/* Resolution Notes / Changelog */}
                  {item.resolutionNotes && (
                    <div className="mt-3.5 pt-3 border-t border-border/80">
                      <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <CheckCircle2 size={14} />
                        {isUpdate ? "Release Changelog & Notes:" : "Resolution & Patch Notes:"}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                        {item.resolutionNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer: Reporter & Dates (Clear 12px - 13px) */}
                <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground pt-0.5 flex-wrap gap-2">
                  <span>
                    Reported by: <strong className="text-foreground">{item.reportedBy}</strong>
                  </span>
                  <div className="flex items-center gap-3">
                    <span>Logged: {item.createdAt}</span>
                    {item.resolvedAt && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <Check size={13} />
                        Deployed: {item.resolvedAt}
                      </span>
                    )}
                  </div>
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
 * FOOTER BLOCK: components/FixUpdatesView.tsx Implementation Notes
 * ============================================================================
 * - Workflow: Dual-action triage station for both Bug Fixes and Platform Updates.
 * - Categorization: Differentiates Fixes vs Updates dynamically with 1-click filter switches.
 * - Font Scale: Conforms strictly to comfortable 16px–18px titles and 14px–16px body.
 * ============================================================================
 */
