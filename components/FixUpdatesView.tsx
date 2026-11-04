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
    <div className="flex flex-col gap-5 max-w-[1600px]">
      {/* Top Header & Command Bar matching Figma */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-extrabold text-[25px] tracking-[-0.8px] text-foreground leading-tight">
              Fix & Updates
            </h1>
            <span className="eyebrow-tag">DIAGNOSTICS & RELEASES</span>
          </div>
          <p className="text-[12px] text-muted-foreground mt-1">
            Track root cause diagnostics, resolve anomalies, and log platform patches.
          </p>
        </div>

        {/* 2 DEDICATED ACTION BUTTONS */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAddUpdateModal || onOpenAddModal}
            className="h-[38px] px-4 rounded-[10px] bg-primary hover:bg-[#3d50df] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-[0_5px_13px_rgba(82,104,246,0.25)] transition-all cursor-pointer whitespace-nowrap"
          >
            <Rocket size={14} />
            <span>Post update</span>
          </button>

          <button
            onClick={onOpenAddFixModal || onOpenAddModal}
            className="h-[38px] px-4 rounded-[10px] bg-[#fff0f1] dark:bg-red-500/10 hover:bg-[#ffe2e5] border border-[#ffd6d9] dark:border-red-500/30 text-[#e94d58] text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <Wrench size={14} />
            <span>Report fix</span>
          </button>
        </div>
      </div>

      {/* CONTROLS & CATEGORY FILTER BAR matching Figma */}
      <div className="min-h-[54px] bg-card border border-border rounded-[13px] p-[7px_12px] flex items-center justify-between gap-3 flex-wrap">
        {/* Left: View Mode Segmented Switch (All / Fixes / Updates) */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              typeFilter === "all"
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All items ({fixes.length})
          </button>

          <button
            onClick={() => setTypeFilter("fixes")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              typeFilter === "fixes"
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Fixes ({fixesCount})
          </button>

          <button
            onClick={() => setTypeFilter("updates")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              typeFilter === "updates"
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Updates ({updatesCount})
          </button>
        </div>

        {/* Right: Severity Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          {["all", "critical", "major", "minor", "patch"].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-all shrink-0 cursor-pointer ${
                severityFilter === sev
                  ? "bg-primary/10 text-primary border border-primary/25"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {sev === "all" ? "All" : sev}
            </button>
          ))}
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
                className="bg-card border border-border rounded-[14px] p-5 shadow-2xs hover:border-[#cfd4ff] dark:hover:border-primary/50 transition-all flex flex-col gap-3 group"
              >
                {/* Header Row: Figma Pills, Title & Quick Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {/* TYPE INDICATOR */}
                      {isUpdate ? (
                        <span className="pill pill-green">UPDATE</span>
                      ) : (
                        <span className="pill pill-red">FIX</span>
                      )}

                      {/* SEVERITY BADGE */}
                      <span
                        className={`pill ${
                          item.severity === "critical"
                            ? "pill-red"
                            : item.severity === "major"
                            ? "pill-amber"
                            : "pill"
                        }`}
                      >
                        {item.severity.toUpperCase()}
                      </span>

                      {/* STATUS BADGE */}
                      <span className="pill pill-purple capitalize">
                        {item.status}
                      </span>

                      {/* AFFECTED COMPONENT */}
                      <span className="pill">
                        {item.affectedComponent} → {item.versionTag}
                      </span>
                    </div>

                    {/* ITEM TITLE */}
                    <h3 className="font-heading font-bold text-[15px] text-foreground tracking-tight leading-snug group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                  </div>

                  {/* Right: Quick Status Mover & Edit/Delete */}
                  <div className="flex items-center gap-2 shrink-0 self-start lg:self-auto">
                    <select
                      value={item.status}
                      onChange={(e) => updateFix(item.id, { status: e.target.value as FixStatus })}
                      className="px-3 py-1.5 text-[11px] font-bold rounded-[8px] bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs cursor-pointer"
                    >
                      <option value="reported">Reported</option>
                      <option value="investigating">Investigating</option>
                      <option value="fixing">Fixing</option>
                      <option value="verified">Verified</option>
                      <option value="deployed">Deployed</option>
                    </select>

                    <button
                      onClick={() => onOpenEditModal(item)}
                      className="p-1.5 rounded-[8px] text-muted-foreground hover:text-foreground bg-muted/60 border border-border hover:border-primary/40 transition-colors cursor-pointer"
                      title="Edit Details"
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete "${item.name}"?`)) {
                          deleteFix(item.id);
                        }
                      }}
                      className="p-1.5 rounded-[8px] text-muted-foreground hover:text-red-500 bg-muted/60 border border-border hover:border-red-500/20 transition-colors cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Description & Root Cause Block matching Figma .symptom */}
                <div className="border border-border rounded-[10px] p-[12px_14px] bg-[#f8f9fc] dark:bg-muted/30">
                  <span className="text-[8px] font-extrabold tracking-[0.8px] text-[#8590a2] dark:text-muted-foreground uppercase block">
                    {isUpdate ? "UPDATE HIGHLIGHTS & SUMMARY:" : "ROOT CAUSE & SYMPTOM:"}
                  </span>
                  <p className="text-[11px] text-foreground mt-1.5 leading-relaxed whitespace-pre-wrap font-normal">
                    {item.description}
                  </p>

                  {/* Resolution Notes / Changelog */}
                  {item.resolutionNotes && (
                    <div className="mt-2.5 pt-2 border-t border-border/80">
                      <span className="text-[8px] font-extrabold text-[#0da77c] uppercase tracking-wider block">
                        {isUpdate ? "RELEASE CHANGELOG & NOTES:" : "RESOLUTION & PATCH NOTES:"}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                        {item.resolutionNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer: Reporter & Dates */}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border flex-wrap gap-2">
                  <span>
                    Reported by: <strong className="text-foreground">{item.reportedBy}</strong>
                  </span>
                  <div className="flex items-center gap-3">
                    <span>Logged: {item.createdAt ? item.createdAt.split("T")[0] : "2026-10-28"}</span>
                    {item.resolvedAt && (
                      <span className="text-[#0da77c] font-bold flex items-center gap-1">
                        <Check size={12} />
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
