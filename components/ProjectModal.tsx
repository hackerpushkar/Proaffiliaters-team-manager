/**
 * ============================================================================
 * HEADER BLOCK: components/ProjectModal.tsx — Major Task Creation Dialog
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Modal to define or modify a Major Task (e.g. "Make Prowasp Telegram Bot").
 * Captures:
 * - Major Task Name
 * - Scope & Architectural Description
 * - Category Tag
 * - Major Task Lead
 * - Brand Theme Color Accent
 * - Major Task Status
 *
 * WHY THIS FILE EXISTS:
 * Enables the team to spin up new major initiatives and organize minor tasks underneath them.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Calls addProject or updateProject in useTaskStore.
 * ============================================================================
 */

"use client";

import React, { useState, useEffect } from "react";
import { X, FolderPlus, Palette } from "lucide-react";
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h3 className="text-lg font-heading font-extrabold text-foreground">
              {projectToEdit ? "Edit Project" : "Create New Project"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              e.g. &quot;Make Prowasp Telegram Bot&quot; to organize and prioritize tasks.
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
            <label className="block font-semibold text-foreground mb-1">Project Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Make Prowasp Telegram Bot"
              className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Description & Goal:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What does this project accomplish and what tasks will it contain?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Category:</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Telegram Automation, Web Platform"
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Project Lead:</label>
              <select
                value={lead}
                onChange={(e) => setLead(e.target.value)}
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

          <div>
            <label className="block font-semibold text-foreground mb-1.5">Color Accent:</label>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setColor(opt.value)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === opt.value ? "scale-110 border-foreground ring-2 ring-primary" : "border-transparent"
                  }`}
                  style={{ backgroundColor: opt.value }}
                  title={opt.label}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">
              Invite Teammates by Gmail (Optional):
            </label>
            <div className="relative flex items-center">
              <input
                type="email"
                value={inviteGmail}
                onChange={(e) => setInviteGmail(e.target.value)}
                placeholder="colleague@gmail.com or @proaffiliaters.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              An invitation request will be delivered to this teammate. Once approved, they join the project.
            </p>
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
              {projectToEdit ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * FOOTER BLOCK: components/ProjectModal.tsx Implementation Notes
 * ============================================================================
 * - Workflow: Validates Major Task parameters and updates state store.
 * ============================================================================
 */
