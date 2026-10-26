/**
 * ============================================================================
 * HEADER BLOCK: components/FeatureModal.tsx — Feature Proposal Dialog
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Modal to submit or update a "New Upcoming Feature" proposal.
 * Captures:
 * - Feature Name / Title
 * - Technical & Business Description
 * - Target Timeline (Quarter / Month)
 * - Priority & Feasibility Status
 * - Author / Submitter
 * - Category Tags
 *
 * WHY THIS FILE EXISTS:
 * Empowers any team member to write down and document ideas Proaffiliaters wants to build.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Calls addFeature or updateFeature in useTaskStore.
 * ============================================================================
 */

"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, Tag, Plus } from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { UpcomingFeature, FeaturePriority, FeatureStatus } from "@/lib/types";

interface FeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureToEdit?: UpcomingFeature | null;
}

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

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (!tagInput.trim() || tags.includes(tagInput.trim())) return;
    setTags((prev) => [...prev, tagInput.trim()]);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h3 className="text-lg font-heading font-extrabold text-foreground">
              {featureToEdit ? "Edit Feature Proposal" : "Propose Upcoming Feature"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Document what feature Proaffiliaters should build next.
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
            <label className="block font-semibold text-foreground mb-1">Feature Name / Title:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AI Deal Description Rewriter"
              className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Detailed Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="How will this feature work and how does it help creators and affiliate partners?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Target Timeline:</label>
              <input
                type="text"
                value={targetTimeline}
                onChange={(e) => setTargetTimeline(e.target.value)}
                placeholder="e.g. Q4 2026, Dec 2026, v2.5"
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Proposed By:</label>
              <select
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Priority:</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as FeaturePriority)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Lifecycle Phase:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as FeatureStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              >
                <option value="thinking">💡 Thinking (Initial Concept)</option>
                <option value="research">🔬 Research (Gathering Specs)</option>
                <option value="ready_to_go">🚀 Ready to Go (Build Ready)</option>
                <option value="future_build">⏳ Future Build (Backlog)</option>
                <option value="in_progress">⚡ In Progress (Active Sprint)</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Tags:</label>
            <div className="flex gap-2 mb-2">
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
                placeholder="Type tag and press Add..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground shadow-xs"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 rounded-xl bg-primary text-white font-bold shadow-sm"
              >
                Add Tag
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[11px] font-semibold"
                >
                  #{t}
                  <button type="button" onClick={() => handleRemoveTag(t)}>
                    ✕
                  </button>
                </span>
              ))}
            </div>
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
              {featureToEdit ? "Save Feature" : "Submit Feature"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * FOOTER BLOCK: components/FeatureModal.tsx Implementation Notes
 * ============================================================================
 * - Workflow: Saves feature to store, defaults votes to 1 for the creator.
 * ============================================================================
 */
