/**
 * ============================================================================
 * HEADER BLOCK: components/FeatureModal.tsx — Feature Slide-Over Drawer
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Provides a right-side slide-over drawer to propose or update an Upcoming Feature:
 * - Glides in smoothly from the right edge with a dimmed backdrop (no center popup)
 * - Feature Name / Title & Architectural Scope Description
 * - Target Timeline (Quarter / Month / Milestone)
 * - Priority Level selection (Critical, High, Medium, Low)
 * - Lifecycle Phase pills (Thinking, Research, Ready to Go, Future Build, In Progress, Completed)
 * - Author / Submitter selector with team members
 * - Interactive Tag Chips management
 *
 * WHY THIS FILE EXISTS:
 * Fulfills user request: Replace center pop-up modals across the platform with
 * unified right-side slide-over drawers matching the Task Slide-Over peek panel experience.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Calls addFeature or updateFeature in useTaskStore, keeping the Upcoming Features
 * roadmap cleanly synchronized across team members.
 * ============================================================================
 */

"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, Tag, Plus, Check, Calendar, User, Lightbulb, Compass, Rocket, Clock } from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { UpcomingFeature, FeaturePriority, FeatureStatus } from "@/lib/types";

interface FeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureToEdit?: UpcomingFeature | null;
}

const COMMON_TIMELINES = ["Q4 2026", "Nov 2026", "Dec 2026", "Q1 2027", "v2.5 Release"];

export const FeatureModal: React.FC<FeatureModalProps> = ({
  isOpen,
  onClose,
  featureToEdit,
}) => {
  const { addFeature, updateFeature, teamMembers } = useTaskStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetTimeline, setTargetTimeline] = useState("Q4 2026");
  const [priority, setPriority] = useState<FeaturePriority>("high");
  const [status, setStatus] = useState<FeatureStatus>("thinking");
  const [author, setAuthor] = useState(teamMembers[0]?.name || "Pushkar (Founder)");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["Telegram"]);

  useEffect(() => {
    if (featureToEdit) {
      setName(featureToEdit.name);
      setDescription(featureToEdit.description);
      setTargetTimeline(featureToEdit.targetTimeline);
      setPriority(featureToEdit.priority);
      setStatus(featureToEdit.status);
      setAuthor(featureToEdit.author);
      setTags(featureToEdit.tags || []);
    } else {
      setName("");
      setDescription("");
      setTargetTimeline("Q4 2026");
      setPriority("high");
      setStatus("thinking");
      setAuthor(teamMembers[0]?.name || "Pushkar (Founder)");
      setTags(["AI", "Telegram"]);
    }
  }, [featureToEdit, isOpen, teamMembers]);

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

  const handleAddTag = (tagToAdd?: string) => {
    const raw = tagToAdd || tagInput;
    const cleanTag = raw.trim().replace(/^#/, "");
    if (!cleanTag) return;
    if (!tags.includes(cleanTag)) {
      setTags((prev) => [...prev, cleanTag]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter a feature name.");
      return;
    }

    if (featureToEdit) {
      updateFeature(featureToEdit.id, {
        name: name.trim(),
        description: description.trim(),
        targetTimeline,
        priority,
        status,
        author,
        tags,
      });
    } else {
      addFeature({
        name: name.trim(),
        description: description.trim(),
        targetTimeline,
        priority,
        status,
        author,
        tags,
      });
    }

    onClose();
  };

  const phaseOptions: { id: FeatureStatus; label: string; icon: typeof Lightbulb; color: string }[] = [
    { id: "thinking", label: "💡 Thinking", icon: Lightbulb, color: "text-amber-500 bg-amber-500/10 border-amber-500/30" },
    { id: "research", label: "🔬 Research", icon: Compass, color: "text-blue-500 bg-blue-500/10 border-blue-500/30" },
    { id: "ready_to_go", label: "🚀 Ready to Go", icon: Rocket, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" },
    { id: "future_build", label: "⏳ Future Build", icon: Clock, color: "text-purple-500 bg-purple-500/10 border-purple-500/30" },
    { id: "in_progress", label: "⚡ In Progress", icon: Sparkles, color: "text-primary bg-primary/10 border-primary/30" },
    { id: "completed", label: "✅ Completed", icon: Check, color: "text-emerald-600 bg-emerald-500/15 border-emerald-500/40" },
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
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-primary to-purple-600 shrink-0" />

        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/95 backdrop-blur-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-xs">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-heading font-extrabold text-foreground tracking-tight">
                {featureToEdit ? "Edit Feature Proposal" : "Propose Upcoming Feature"}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Document product concepts, technical requirements, and target timeline.
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
          {/* Feature Name */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Feature Name / Title *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AI Deal Description Rewriter & Tag Harvester"
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 hover:bg-muted/70 focus:bg-card border border-border text-foreground placeholder:text-muted-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-xs"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Scope & Value Proposition
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="How will this feature work and how does it help creators and affiliate partners?"
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 hover:bg-muted/70 focus:bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-xs resize-y"
            />
          </div>

          {/* Lifecycle Phase Pills */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-2">
              Lifecycle Phase
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {phaseOptions.map((opt) => {
                const isSelected = status === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStatus(opt.id)}
                    className={`px-3 py-2 rounded-xl font-bold text-xs border text-center transition-all ${
                      isSelected
                        ? "bg-primary text-white border-transparent ring-2 ring-primary/40 shadow-sm"
                        : `${opt.color} hover:brightness-105 opacity-80 hover:opacity-100`
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timeline & Proposed By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1.5">
                <Calendar size={13} className="text-primary" />
                <span>Target Timeline</span>
              </label>
              <input
                type="text"
                list="feature-timelines"
                value={targetTimeline}
                onChange={(e) => setTargetTimeline(e.target.value)}
                placeholder="e.g. Q4 2026, Dec 2026"
                className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-2xs"
              />
              <datalist id="feature-timelines">
                {COMMON_TIMELINES.map((tl) => (
                  <option key={tl} value={tl} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1.5">
                <User size={13} className="text-primary" />
                <span>Proposed By</span>
              </label>
              <select
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
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

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Priority Ranking
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["critical", "high", "medium", "low"] as FeaturePriority[]).map((p) => {
                const isSelected = priority === p;
                const colorMap: Record<FeaturePriority, string> = {
                  critical: "text-red-500 bg-red-500/10 border-red-500/30",
                  high: "text-amber-500 bg-amber-500/10 border-amber-500/30",
                  medium: "text-blue-500 bg-blue-500/10 border-blue-500/30",
                  low: "text-slate-500 bg-slate-500/10 border-slate-500/30",
                };
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 px-3 rounded-xl font-bold capitalize text-xs border transition-all ${
                      isSelected
                        ? "bg-primary text-white border-transparent ring-2 ring-primary/40 shadow-sm"
                        : `${colorMap[p]} opacity-80 hover:opacity-100`
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Tag size={13} className="text-primary" />
              <span>Category Tags</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Type tag and press Enter..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground shadow-2xs"
              />
              <button
                type="button"
                onClick={() => handleAddTag()}
                className="px-4 py-2 rounded-xl bg-primary text-white font-bold flex items-center gap-1 shadow-sm"
              >
                <Plus size={13} />
                <span>Add</span>
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/25 text-primary text-[11px] font-bold shadow-2xs"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-red-500 transition-colors ml-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
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
                <span>{featureToEdit ? "Save Feature" : "Submit Feature"}</span>
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
 * FOOTER BLOCK: components/FeatureModal.tsx Implementation Notes & Caveats
 * ============================================================================
 * - Workflow: Validates feature input, dispatches addFeature or updateFeature.
 * - Presentation: Rendered as a full right-side slide-over drawer (no center modal).
 * - Key Exports: FeatureModal React functional component.
 * ============================================================================
 */
