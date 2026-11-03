/**
 * ============================================================================
 * HEADER BLOCK: components/ProjectModal.tsx — Project Slide-Over Drawer
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Provides a right-side slide-over drawer to define or modify an Ongoing Project:
 * - Glides in smoothly from the right edge with a dimmed backdrop (no center popup)
 * - Major Project Name & Scope Description
 * - Category Tag selector & quick presets
 * - Project Lead assignment with team member avatars
 * - Brand Theme Color Accent picker
 * - Project Status (Active, On Hold/Paused, Planning, Completed)
 * - Teammate Gmail invite input
 *
 * WHY THIS FILE EXISTS:
 * Fulfills user request: Replace center pop-up modals across the platform with
 * unified right-side slide-over drawers matching the Task Slide-Over peek panel experience.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Calls addProject or updateProject in useTaskStore, updating project state and
 * triggering invitations seamlessly.
 * ============================================================================
 */

"use client";

import React, { useState, useEffect } from "react";
import { X, FolderKanban, Check, Palette, Sparkles, User, Tag, Mail, ShieldAlert } from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { OngoingProject, ProjectStatus } from "@/lib/types";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: OngoingProject | null;
}

const COLOR_OPTIONS = [
  { label: "Indigo", value: "#3b5bfa" },
  { label: "Purple", value: "#7c3aed" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "Emerald", value: "#10b981" },
  { label: "Rose", value: "#ef4444" },
  { label: "Amber", value: "#f59e0b" },
];

const COMMON_CATEGORIES = [
  "Telegram Automation",
  "Bot Engine",
  "Web Platform",
  "Affiliate Scraping",
  "API & Infrastructure",
  "Marketing & Growth",
];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  projectToEdit,
}) => {
  const { addProject, updateProject, teamMembers, sendProjectInvite, currentUser } = useTaskStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Telegram Automation");
  const [lead, setLead] = useState(teamMembers[0]?.name || "Pushkar (Founder)");
  const [color, setColor] = useState("#3b5bfa");
  const [status, setStatus] = useState<ProjectStatus>("active");
  const [inviteGmail, setInviteGmail] = useState("");

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description);
      setCategory(projectToEdit.category);
      setLead(projectToEdit.lead);
      setColor(projectToEdit.color);
      setStatus(projectToEdit.status);
      setInviteGmail("");
    } else {
      setName("");
      setDescription("");
      setCategory("Telegram Automation");
      setLead(currentUser?.name || teamMembers[0]?.name || "Pushkar (Founder)");
      setColor("#3b5bfa");
      setStatus("active");
      setInviteGmail("");
    }
  }, [projectToEdit, isOpen, teamMembers, currentUser]);

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
      alert("Please enter a Project name.");
      return;
    }

    if (projectToEdit) {
      updateProject(projectToEdit.id, {
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        lead,
        color,
        status,
      });

      if (inviteGmail.trim()) {
        sendProjectInvite(projectToEdit.id, inviteGmail.trim());
      }
    } else {
      const newProj = addProject({
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        lead,
        color,
        status,
      });

      if (inviteGmail.trim()) {
        sendProjectInvite(newProj.id, inviteGmail.trim());
      }
    }

    onClose();
  };

  const projectStatusOptions: { id: ProjectStatus; label: string; desc: string }[] = [
    { id: "active", label: "⚡ Active Sprint", desc: "Currently ongoing (Single active focus)" },
    { id: "paused", label: "⏸ On Hold", desc: "Paused while another project takes priority" },
    { id: "planning", label: "📋 Planning", desc: "Scoping requirements & tasks" },
    { id: "completed", label: "📦 Completed", desc: "All deliverables shipped" },
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
          className="h-1.5 w-full shrink-0 transition-colors"
          style={{
            background: `linear-gradient(90deg, ${color}, #7c3aed)`,
          }}
        />

        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/95 backdrop-blur-xs shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs transition-colors"
              style={{ backgroundColor: color }}
            >
              <FolderKanban size={18} />
            </div>
            <div>
              <h3 className="text-base font-heading font-extrabold text-foreground tracking-tight">
                {projectToEdit ? "Edit Ongoing Project" : "Create Ongoing Project"}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Organize deliverables, team collaborators, and priority-sequenced tasks.
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
          {/* Project Name */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Make Prowasp Telegram Bot"
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 hover:bg-muted/70 focus:bg-card border border-border text-foreground placeholder:text-muted-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-xs"
              required
            />
          </div>

          {/* Description & Goal */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Description & Milestone Scope
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What does this project accomplish, who will use it, and what are the main goals?"
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 hover:bg-muted/70 focus:bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-xs resize-y"
            />
          </div>

          {/* Category & Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1.5">
                <Tag size={13} className="text-primary" />
                <span>Category Tag</span>
              </label>
              <input
                type="text"
                list="project-categories"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Telegram Automation"
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/50 hover:bg-muted/70 focus:bg-card border border-border text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-xs"
              />
              <datalist id="project-categories">
                {COMMON_CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            {/* Project Lead */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1.5">
                <User size={13} className="text-primary" />
                <span>Project Lead</span>
              </label>
              <select
                value={lead}
                onChange={(e) => setLead(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/50 hover:bg-muted/70 focus:bg-card border border-border text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-xs"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Project Lifecycle Status Pills */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-2">
              Project Status
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {projectStatusOptions.map((opt) => {
                const isSelected = status === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStatus(opt.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "bg-primary text-white border-transparent ring-2 ring-primary/40 shadow-md shadow-primary/25"
                        : "bg-muted/30 hover:bg-muted/60 border-border text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs">{opt.label}</span>
                      {isSelected && <Check size={14} className="stroke-[3]" />}
                    </div>
                    <p
                      className={`text-[10px] mt-0.5 ${
                        isSelected ? "text-white/80" : "text-muted-foreground"
                      }`}
                    >
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Brand Color Accent */}
          <div className="p-4 rounded-2xl bg-muted/20 border border-border">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Palette size={14} className="text-primary" />
                <span>Brand Theme Color Accent</span>
              </label>
              <span className="text-[11px] font-mono text-muted-foreground uppercase">
                {color}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setColor(opt.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                    color === opt.value
                      ? "scale-115 border-foreground ring-2 ring-primary shadow-sm"
                      : "border-transparent opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: opt.value }}
                  title={opt.label}
                />
              ))}
            </div>
          </div>

          {/* Invite Teammates by Gmail */}
          <div className="p-4 rounded-2xl bg-muted/20 border border-border space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Mail size={14} className="text-primary" />
              <span>Invite Teammate via Gmail (Optional)</span>
            </label>
            <input
              type="email"
              value={inviteGmail}
              onChange={(e) => setInviteGmail(e.target.value)}
              placeholder="colleague@gmail.com or @proaffiliaters.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-2xs"
            />
            <p className="text-[11px] text-muted-foreground">
              An invitation request will be delivered to this teammate. Once approved, they join this project workspace.
            </p>
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
                <span>{projectToEdit ? "Save Changes" : "Create Project"}</span>
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
 * FOOTER BLOCK: components/ProjectModal.tsx Implementation Notes & Caveats
 * ============================================================================
 * - Workflow: Validates project parameters, invokes addProject or updateProject,
 *   and forwards invites to sendProjectInvite.
 * - Presentation: Rendered as a full right-side slide-over drawer (no center modal).
 * - Key Exports: ProjectModal React functional component.
 * ============================================================================
 */
