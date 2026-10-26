/**
 * ============================================================================
 * HEADER BLOCK: components/FixModal.tsx — Bug Triage & Patch Dialog
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Modal to log or update an issue in Category 3: "Fix & Updates".
 * Captures:
 * - Issue Name / Title
 * - Problem Description & Root Cause Analysis
 * - Affected Component / Service
 * - Severity Level (Critical, Major, Minor, Patch)
 * - Lifecycle Status (Reported -> Investigating -> Fixing -> Verified -> Deployed)
 * - Resolution Notes / Changelog
 * - Target Version Tag (e.g. v2.1.4)
 * - Reporter & Assignee
 *
 * WHY THIS FILE EXISTS:
 * Ensures clean tracking and resolution of production anomalies.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Dispatches addFix or updateFix in useTaskStore.
 * ============================================================================
 */

"use client";

import React, { useState, useEffect } from "react";
import { X, Wrench, ShieldAlert } from "lucide-react";
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
  const [assignee, setAssignee] = useState(teamMembers[1]?.name || "Alex (Backend)");
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
      setAssignee(teamMembers[1]?.name || "Alex (Backend)");
      setResolutionNotes("");
      setVersionTag("v2.1.4");
    }
  }, [fixToEdit, isOpen, initialMode, teamMembers]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h3 className="text-lg font-heading font-extrabold text-foreground">
              {fixToEdit
                ? isUpdateMode
                  ? "Edit Platform Update"
                  : "Edit Bug Fix"
                : isUpdateMode
                  ? "Post Platform Update"
                  : "Report Bug / System Fix"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isUpdateMode
                ? "Document release highlights, affected service, version tag, and deployment notes."
                : "Identify the root cause, affected subsystem, severity level, and debugging notes."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4 text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1">
              {isUpdateMode ? "Update Title / Release Name:" : "Issue / Fix Title:"}
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">
              {isUpdateMode ? "Update Summary & Release Highlights:" : "Description & Root Cause:"}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Explain what broke, error logs, and underlying root cause..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">
                Affected Component / Service:
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="common-components-list"
                  value={affectedComponent}
                  onChange={(e) => setAffectedComponent(e.target.value)}
                  placeholder="Type or select service (e.g. Next.js Web Client)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                  required
                />
                <datalist id="common-components-list">
                  {allComponentSuggestions.map((comp) => (
                    <option key={comp} value={comp} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Severity:</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as FixSeverity)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              >
                <option value="critical">Critical (Blocking Core Flow)</option>
                <option value="major">Major (Degraded Behavior)</option>
                <option value="minor">Minor (Edge Case / UI glitch)</option>
                <option value="patch">Patch (Routine Improvement)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Current Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as FixStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              >
                <option value="reported">Reported</option>
                <option value="investigating">Investigating</option>
                <option value="fixing">Fixing</option>
                <option value="verified">Verified</option>
                <option value="deployed">Deployed</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Target Version Tag:</label>
              <input
                type="text"
                value={versionTag}
                onChange={(e) => setVersionTag(e.target.value)}
                placeholder="e.g. v2.1.4"
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">
              Resolution Notes / Patch Details:
            </label>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={2}
              placeholder="How was or will this issue be resolved? (e.g. Added Redis rate limiter and fallback regex)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-muted-foreground hover:text-foreground bg-muted border border-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 shadow-sm transition-all"
            >
              {fixToEdit
                ? "Save Changes"
                : isUpdateMode
                  ? "Publish Update"
                  : "Log Fix"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * FOOTER BLOCK: components/FixModal.tsx Implementation Notes
 * ============================================================================
 * - Workflow: Validates fields, updates resolution status, and records timestamps.
 * ============================================================================
 */
