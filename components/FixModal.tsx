/**
 * ============================================================================
 * HEADER BLOCK: components/FixModal.tsx — Fix & Update Slide-Over Drawer
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Provides a right-side slide-over drawer to log or update an issue in "Fix & Updates":
 * - Glides in smoothly from the right edge with a dimmed backdrop (no center popup)
 * - Issue Name / Update Title
 * - Problem Description & Root Cause Analysis / Update Highlights
 * - Affected Component / Service dropdown with common suggestions
 * - Severity Level selection (Critical, Major, Minor, Patch)
 * - Lifecycle Status (Reported -> Investigating -> Fixing -> Verified -> Deployed)
 * - Resolution Notes / Changelog
 * - Target Version Tag (e.g. v2.1.4)
 * - Reporter & Assignee
 *
 * WHY THIS FILE EXISTS:
 * Fulfills user request: Replace center pop-up modals across the platform with
 * unified right-side slide-over drawers matching the Task Slide-Over peek panel experience.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Dispatches addFix or updateFix in useTaskStore, keeping bug triage and release logs live.
 * ============================================================================
 */

"use client";

import React, { useState, useEffect } from "react";
import { X, Wrench, ShieldAlert, Check, Sparkles, AlertTriangle, Layers, Tag, User } from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { FixUpdate, FixSeverity, FixStatus } from "@/lib/types";

interface FixModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixToEdit?: FixUpdate | null;
  initialMode?: "fix" | "update";
}

const COMMON_COMPONENTS = [
  "Prowasp Telegram Bot",
  "Amazon Scraper Worker",
  "Flipkart Scraper",
  "AutoPilot Deals Daemon",
  "Next.js Web Client",
  "Backend REST API",
  "Razorpay Webhook",
  "WhatsApp Forwarder",
  "Pinterest Studio",
];

export const FixModal: React.FC<FixModalProps> = ({
  isOpen,
  onClose,
  fixToEdit,
  initialMode = "fix",
}) => {
  const { addFix, updateFix, teamMembers, fixes } = useTaskStore();

  const allComponentSuggestions = React.useMemo(() => {
    const fromFixes = (fixes || []).map((f) => f.affectedComponent).filter(Boolean);
    return Array.from(new Set([...COMMON_COMPONENTS, ...fromFixes]));
  }, [fixes]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [affectedComponent, setAffectedComponent] = useState(COMMON_COMPONENTS[0]);
  const [severity, setSeverity] = useState<FixSeverity>("major");
  const [status, setStatus] = useState<FixStatus>("reported");
  const [reportedBy, setReportedBy] = useState(teamMembers[0]?.name || "Pushkar (Founder)");
  const [assignee, setAssignee] = useState(teamMembers[0]?.name || "Pushkar (Founder)");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [versionTag, setVersionTag] = useState("v2.1.4");

  const isUpdateMode = fixToEdit
    ? fixToEdit.severity === "patch"
    : initialMode === "update";

  useEffect(() => {
    if (fixToEdit) {
      setName(fixToEdit.name);
      setDescription(fixToEdit.description);
      setAffectedComponent(fixToEdit.affectedComponent);
      setSeverity(fixToEdit.severity);
      setStatus(fixToEdit.status);
      setReportedBy(fixToEdit.reportedBy);
      setAssignee(fixToEdit.assignee || teamMembers[0]?.name || "");
      setResolutionNotes(fixToEdit.resolutionNotes || "");
      setVersionTag(fixToEdit.versionTag);
    } else {
      setName("");
      setDescription("");
      setAffectedComponent(COMMON_COMPONENTS[0]);
      setSeverity(initialMode === "update" ? "patch" : "major");
      setStatus(initialMode === "update" ? "deployed" : "reported");
      setReportedBy(teamMembers[0]?.name || "Pushkar (Founder)");
      setAssignee(teamMembers[0]?.name || "Pushkar (Founder)");
      setResolutionNotes("");
      setVersionTag("v2.1.4");
    }
  }, [fixToEdit, isOpen, initialMode, teamMembers]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter a fix/issue name.");
      return;
    }

    if (fixToEdit) {
      updateFix(fixToEdit.id, {
        name: name.trim(),
        description: description.trim(),
        affectedComponent,
        severity,
        status,
        reportedBy,
        assignee,
        resolutionNotes: resolutionNotes.trim(),
        versionTag: versionTag.trim(),
      });
    } else {
      addFix({
        name: name.trim(),
        description: description.trim(),
        affectedComponent,
        severity,
        status,
        reportedBy,
        assignee,
        resolutionNotes: resolutionNotes.trim(),
        versionTag: versionTag.trim(),
      });
    }

    onClose();
  };

  const severityOptions: { id: FixSeverity; label: string; desc: string; color: string }[] = [
    { id: "critical", label: "Critical", desc: "Blocking core operations", color: "text-red-500 bg-red-500/10 border-red-500/30" },
    { id: "major", label: "Major", desc: "Degraded functionality", color: "text-amber-500 bg-amber-500/10 border-amber-500/30" },
    { id: "minor", label: "Minor", desc: "Edge case / UI glitch", color: "text-blue-500 bg-blue-500/10 border-blue-500/30" },
    { id: "patch", label: "Patch", desc: "Routine release update", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" },
  ];

  const statusOptions: { id: FixStatus; label: string }[] = [
    { id: "reported", label: "Reported" },
    { id: "investigating", label: "Investigating" },
    { id: "fixing", label: "Fixing" },
    { id: "verified", label: "Verified" },
    { id: "deployed", label: "Deployed" },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Dimmed Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Slide-Over Drawer Container */}
      <div className="relative w-full max-w-xl sm:max-w-2xl bg-card border-l border-border shadow-2xl h-full flex flex-col z-10 animate-slideInRight overflow-hidden">
        {/* Top Accent Gradient Bar */}
        <div
          className={`h-1.5 w-full shrink-0 ${
            isUpdateMode
              ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-primary"
              : "bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-600"
          }`}
        />

        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/95 backdrop-blur-xs shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-xs ${
                isUpdateMode
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                  : "bg-red-500/10 border-red-500/20 text-red-500"
              }`}
            >
              {isUpdateMode ? <Sparkles size={18} /> : <Wrench size={18} />}
            </div>
            <div>
              <h3 className="text-base font-heading font-extrabold text-foreground tracking-tight">
                {fixToEdit
                  ? isUpdateMode
                    ? "Edit Platform Update"
                    : "Edit Bug Fix"
                  : isUpdateMode
                    ? "Post Platform Update"
                    : "Report Bug / System Fix"}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {isUpdateMode
                  ? "Document release highlights, affected service, version tag, and deployment notes."
                  : "Identify the root cause, affected subsystem, severity level, and debugging notes."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="Close drawer (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              {isUpdateMode ? "Update Title / Release Name *" : "Issue / Bug Title *"}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                isUpdateMode
                  ? "e.g. Amazon Deep Link Shortener v2.2 Rollout"
                  : "e.g. Amazon PA-API 429 Too Many Requests Spike"
              }
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 hover:bg-muted/70 focus:bg-card border border-border text-foreground placeholder:text-muted-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-xs"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              {isUpdateMode ? "Summary & Release Highlights" : "Description & Root Cause Analysis"}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Explain error trace, behavior, and how it was diagnosed..."
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 hover:bg-muted/70 focus:bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-xs resize-y"
            />
          </div>

          {/* Affected Component & Version Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1.5">
                <Layers size={13} className="text-primary" />
                <span>Affected Subsystem *</span>
              </label>
              <input
                type="text"
                list="common-components-list"
                value={affectedComponent}
                onChange={(e) => setAffectedComponent(e.target.value)}
                placeholder="e.g. Prowasp Telegram Bot"
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/50 hover:bg-muted/70 focus:bg-card border border-border text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-xs"
                required
              />
              <datalist id="common-components-list">
                {allComponentSuggestions.map((comp) => (
                  <option key={comp} value={comp} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1.5">
                <Tag size={13} className="text-primary" />
                <span>Target Version Tag</span>
              </label>
              <input
                type="text"
                value={versionTag}
                onChange={(e) => setVersionTag(e.target.value)}
                placeholder="e.g. v2.1.4"
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/50 hover:bg-muted/70 focus:bg-card border border-border text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Severity Pills */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-2">
              Severity Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {severityOptions.map((opt) => {
                const isSelected = severity === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSeverity(opt.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-primary text-white border-transparent ring-2 ring-primary/40 shadow-sm"
                        : `${opt.color} opacity-80 hover:opacity-100`
                    }`}
                  >
                    <div className="font-extrabold text-xs">{opt.label}</div>
                    <div
                      className={`text-[10px] mt-0.5 truncate ${
                        isSelected ? "text-white/80" : "text-muted-foreground"
                      }`}
                    >
                      {opt.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Status Pills */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-2">
              Current Lifecycle Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((opt) => {
                const isSelected = status === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStatus(opt.id)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs border transition-all ${
                      isSelected
                        ? "bg-primary text-white border-transparent ring-2 ring-primary/40 shadow-sm"
                        : "bg-muted/40 hover:bg-muted/70 border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reporter & Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1.5">
                <User size={13} className="text-primary" />
                <span>Reported By</span>
              </label>
              <select
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-2xs"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1.5">
                <User size={13} className="text-primary" />
                <span>Lead Assignee</span>
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-2xs"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Resolution Notes */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Resolution Notes / Patch Verification
            </label>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={2}
              placeholder="How was or will this issue be resolved? (e.g. Added session failover handler and retry counter)"
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 hover:bg-muted/70 focus:bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-xs resize-y"
            />
          </div>

          {/* Drawer Footer Controls */}
          <div className="px-6 py-4 -mx-6 -mb-6 border-t border-border bg-card/95 backdrop-blur-xs flex items-center justify-between shrink-0 sticky bottom-0">
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              * Required fields
            </span>
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 border border-border font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-extrabold shadow-md shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <Check size={16} className="stroke-[2.5]" />
                <span>
                  {fixToEdit
                    ? "Save Changes"
                    : isUpdateMode
                      ? "Publish Update"
                      : "Log Fix"}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * FOOTER BLOCK: components/FixModal.tsx Implementation Notes & Caveats
 * ============================================================================
 * - Workflow: Validates fields, updates resolution status, and records timestamps.
 * - Presentation: Rendered as a full right-side slide-over drawer (no center modal).
 * - Key Exports: FixModal React functional component.
 * ============================================================================
 */
