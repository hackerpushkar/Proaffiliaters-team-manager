/**
 * ============================================================================
 * HEADER BLOCK: components/IdeaModal.tsx — Idea Submission & Edit Drawer
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Provides a slide-over / centered modal dialog for team members to submit
 * fresh ideas or edit existing ideas in the Idea Playground:
 * - Idea Title, Category selector, and Description
 * - Initial Remark / Rationale ("Why should we build this?")
 * - Category Tagging (Product, Automation, Marketing, Growth, UI/UX, Internal)
 * - Auto-attribution to the logged-in team member
 *
 * WHY THIS FILE EXISTS:
 * Fulfills user request: "in these we can post our ideas and some remark with
 * these idea anybody on platform can send idea".
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Dispatches addIdea or updateIdea in useTaskStore, which synchronizes with MongoDB.
 * ============================================================================
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Lightbulb,
  Sparkles,
  Tag,
  MessageSquare,
  Layers,
  HelpCircle,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { Idea, IdeaCategory, IdeaStatus } from "@/lib/types";

interface IdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideaToEdit?: Idea | null;
}

const CATEGORIES: IdeaCategory[] = [
  "Product",
  "Automation",
  "Growth",
  "Marketing",
  "UI/UX",
  "Internal Tool",
  "Other",
];

const STATUSES: { id: IdeaStatus; label: string }[] = [
  { id: "brainstorming", label: "Brainstorming" },
  { id: "under_review", label: "Under Review" },
  { id: "planned", label: "Approved / Planned" },
  { id: "converted", label: "Converted to Feature" },
  { id: "archived", label: "Archived" },
];

export const IdeaModal: React.FC<IdeaModalProps> = ({
  isOpen,
  onClose,
  ideaToEdit,
}) => {
  const { currentUser, addIdea, updateIdea } = useTaskStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IdeaCategory>("Product");
  const [status, setStatus] = useState<IdeaStatus>("brainstorming");
  const [initialRemark, setInitialRemark] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    if (ideaToEdit) {
      setTitle(ideaToEdit.title);
      setDescription(ideaToEdit.description);
      setCategory(ideaToEdit.category);
      setStatus(ideaToEdit.status);
      setInitialRemark(ideaToEdit.initialRemark || "");
      setTagsInput(ideaToEdit.tags?.join(", ") || "");
    } else {
      setTitle("");
      setDescription("");
      setCategory("Product");
      setStatus("brainstorming");
      setInitialRemark("");
      setTagsInput("");
    }
  }, [ideaToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Please enter both a title and description for your idea.");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const authorData = {
      name: currentUser?.name || "Pushkar (Founder)",
      avatar: currentUser?.avatar || "/founder.jpg",
      email: currentUser?.email || "pushkar@proaffiliaters.com",
      role: currentUser?.role || "Team Member",
    };

    if (ideaToEdit) {
      updateIdea(ideaToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        status,
        tags,
      });
    } else {
      addIdea({
        title: title.trim(),
        description: description.trim(),
        category,
        status,
        initialRemark: initialRemark.trim() || undefined,
        author: authorData,
        tags,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Lightbulb size={20} />
            </div>
            <div>
              <h2 className="text-base font-heading font-extrabold text-foreground">
                {ideaToEdit ? "Edit Idea" : "Post to Idea Playground"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Pitch a new concept, workflow improvement, or feature idea to the team
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Idea Title */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Idea Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Real-Time Price Drop Alert Bot for Telegram"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
              <Layers size={13} className="text-primary" />
              <span>Category</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    category === cat
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Description & Vision <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what the idea is, who benefits from it, and how it improves our platform or affiliate conversions..."
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Initial Remark (Only shown on new idea creation) */}
          {!ideaToEdit && (
            <div>
              <label className="block text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
                <MessageSquare size={13} className="text-purple-500" />
                <span>Initial Remark / Author Note (Why do this now?)</span>
              </label>
              <textarea
                rows={2}
                value={initialRemark}
                onChange={(e) => setInitialRemark(e.target.value)}
                placeholder="e.g. Ajio and Myntra price drops are trending. If we add this, our channel engagement can increase by 35%."
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          )}

          {/* Status selector (when editing) */}
          {ideaToEdit && (
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Lifecycle Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IdeaStatus)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                {STATUSES.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
              <Tag size={13} className="text-muted-foreground" />
              <span>Tags (comma-separated)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="telegram, deals, bot, api, automation"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Submitter Attribution Notice */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center gap-2.5 text-xs text-muted-foreground">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUser?.avatar || "/founder.jpg"}
              alt={currentUser?.name || "Pushkar"}
              className="w-6 h-6 rounded-full object-cover border border-border"
            />
            <span>
              Posting as <strong className="text-foreground">{currentUser?.name || "Pushkar"}</strong> ({currentUser?.role || "Founder"})
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-1.5"
            >
              <Sparkles size={13} />
              <span>{ideaToEdit ? "Save Changes" : "Post Idea"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * FOOTER BLOCK: components/IdeaModal.tsx Implementation Notes
 * ============================================================================
 * - Workflow: Creates or modifies ideas with category tagging and remarks.
 * - Author Sync: Ties the idea to currentUser session state.
 * ============================================================================
 */
