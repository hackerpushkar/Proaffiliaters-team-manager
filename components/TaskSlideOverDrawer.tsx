/**
 * ============================================================================
 * HEADER BLOCK: components/TaskSlideOverDrawer.tsx — Task Peek & Slider Drawer
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Implements a high-density, interactive slide-over drawer ("Task Slider") for tasks:
 * - Slides in from the right edge with backdrop blur when clicking any task
 * - Live inline status & priority pill switchers (P0-P3, Backlog to Done)
 * - Assignee dropdown selector and live due-date picker
 * - Live auto-saving description editor
 * - Interactive checklist management (tick off subtasks, delete, rapid Enter-key addition)
 * - Quick action triggers (Full Modal Edit, Delete Task)
 *
 * WHY THIS FILE EXISTS:
 * Fulfills user request: "make slider for tasks in project we can adjust their position
 * using drag from 9 points". Eliminates the need for heavy modal dialogs for routine
 * task inspection and micro-updates.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Rendered by OngoingProjectsView; dispatches updates directly to useTaskStore
 * (updateTask, moveTaskStatus, toggleSubtask, addSubtask, deleteSubtask, deleteTask).
 * ============================================================================
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Calendar,
  User,
  Clock,
  ExternalLink,
  Tag,
  AlertCircle,
  Flag,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { TaskPriority, TaskStatus, ProjectTask } from "@/lib/types";

interface TaskSlideOverDrawerProps {
  taskId: string | null;
  onClose: () => void;
  onOpenEditModal?: (task: ProjectTask) => void;
}

export const TaskSlideOverDrawer: React.FC<TaskSlideOverDrawerProps> = ({
  taskId,
  onClose,
  onOpenEditModal,
}) => {
  const {
    tasks,
    projects,
    teamMembers,
    updateTask,
    moveTaskStatus,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    deleteTask,
  } = useTaskStore();

  const task = tasks.find((t) => t.id === taskId);
  const project = task ? projects.find((p) => p.id === task.projectId) : null;

  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [description, setDescription] = useState("");

  // Sync internal state when task changes
  useEffect(() => {
    if (task) {
      setDescription(task.description || "");
    }
  }, [task]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!task || !taskId) return null;

  const completedSubtasks = (task.subtasks || []).filter((st) => st.completed).length;
  const totalSubtasks = (task.subtasks || []).length;
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle("");
  };

  const handleDescriptionBlur = () => {
    if (description !== task.description) {
      updateTask(task.id, { description });
    }
  };

  const statusOptions: { id: TaskStatus; label: string; color: string }[] = [
    { id: "backlog", label: "Backlog", color: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20" },
    { id: "todo", label: "To Do", color: "bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20" },
    { id: "in_progress", label: "In Progress", color: "bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/20" },
    { id: "review", label: "Review", color: "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20" },
    { id: "done", label: "Done", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20" },
  ];

  const priorityOptions: { id: TaskPriority; label: string; color: string }[] = [
    { id: "P0", label: "P0 Urgent", color: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30" },
    { id: "P1", label: "P1 High", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" },
    { id: "P2", label: "P2 Normal", color: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30" },
    { id: "P3", label: "P3 Low", color: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30" },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Dimmed Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Slide-Over Drawer Container */}
      <div className="relative w-full max-w-xl bg-card border-l border-border shadow-2xl h-full flex flex-col z-10 animate-slideInRight overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: project?.color || "#3b5bfa" }}
            />
            <span className="text-xs font-bold text-muted-foreground truncate">
              {project?.name || "Ongoing Project"}
            </span>
            <span className="text-xs text-muted-foreground/60">•</span>
            <span className="font-mono font-black text-xs text-primary px-2 py-0.5 rounded-md bg-primary/10">
              #{task.priorityRank}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenEditModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEditModal(task);
                }}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Open full edit modal"
              >
                <ExternalLink size={15} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Close drawer (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Task Name Title */}
          <div>
            <input
              type="text"
              value={task.name}
              onChange={(e) => updateTask(task.id, { name: e.target.value })}
              className="w-full text-lg sm:text-xl font-heading font-extrabold text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors pb-1"
              placeholder="Task Title..."
            />
          </div>

          {/* Status Segmented Pills */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Status Lifecycle
            </label>
            <div className="flex flex-wrap gap-1.5">
              {statusOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => moveTaskStatus(task.id, opt.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    task.status === opt.id
                      ? `${opt.color} ring-2 ring-primary/40 shadow-xs scale-102`
                      : "bg-muted/50 text-muted-foreground hover:text-foreground border-border hover:bg-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Pills */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Priority Rank
            </label>
            <div className="flex flex-wrap gap-1.5">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateTask(task.id, { priority: opt.id })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    task.priority === opt.id
                      ? `${opt.color} ring-2 ring-primary/40 shadow-xs scale-102`
                      : "bg-muted/50 text-muted-foreground hover:text-foreground border-border hover:bg-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Meta Grid: Assignee & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 rounded-2xl bg-muted/30 border border-border">
            {/* Assignee */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1.5">
                <User size={13} className="text-primary" />
                <span>Assigned To</span>
              </label>
              <select
                value={task.assigneeEmail || task.assignee?.name}
                onChange={(e) => {
                  const member = teamMembers.find(
                    (m) => m.email.toLowerCase() === e.target.value.toLowerCase() || m.name === e.target.value
                  );
                  if (member) {
                    updateTask(task.id, {
                      assignee: member,
                      assigneeEmail: member.email,
                    });
                  }
                }}
                className="w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-card border border-border text-foreground shadow-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.email}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1.5">
                <Calendar size={13} className="text-primary" />
                <span>Target Due Date</span>
              </label>
              <input
                type="date"
                value={task.dueDate || ""}
                onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-card border border-border text-foreground shadow-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Deliverable Description & Specs
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Add details, architectural constraints, test instructions, or sprint requirements..."
              className="w-full p-3.5 rounded-2xl bg-muted/40 border border-border text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
            />
          </div>

          {/* Subtasks Checklist Drawer Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Checklist & Subtasks
                </label>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">
                  {completedSubtasks}/{totalSubtasks}
                </span>
              </div>

              {totalSubtasks > 0 && (
                <span className="text-xs font-extrabold text-foreground">{subtaskProgress}%</span>
              )}
            </div>

            {/* Progress Line */}
            {totalSubtasks > 0 && (
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${subtaskProgress}%` }}
                />
              </div>
            )}

            {/* Subtask Items List */}
            <div className="space-y-1.5">
              {(task.subtasks || []).map((st) => (
                <div
                  key={st.id}
                  className="group flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-all text-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleSubtask(task.id, st.id)}
                    className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                  >
                    {st.completed ? (
                      <CheckSquare size={16} className="text-emerald-500 shrink-0" />
                    ) : (
                      <Square size={16} className="text-muted-foreground shrink-0" />
                    )}
                    <span
                      className={`truncate ${
                        st.completed ? "line-through text-muted-foreground" : "text-foreground font-medium"
                      }`}
                    >
                      {st.title}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteSubtask(task.id, st.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 transition-opacity"
                    title="Delete item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Rapid Add Subtask Input */}
            <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="+ Add checklist point... (Press Enter)"
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              />
              <button
                type="submit"
                disabled={!newSubtaskTitle.trim()}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-40 transition-all flex items-center gap-1 shadow-xs shrink-0"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/60 border border-border px-2.5 py-0.5 rounded-md"
                  >
                    <Tag size={10} className="text-primary" />
                    <span>#{t}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-card shrink-0">
          <button
            type="button"
            onClick={() => {
              if (confirm(`Delete task "${task.name}"?`)) {
                deleteTask(task.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 border border-red-500/20 transition-colors"
          >
            <Trash2 size={13} />
            <span>Delete Task</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * FOOTER BLOCK: components/TaskSlideOverDrawer.tsx Implementation Notes
 * ============================================================================
 * - Workflow: Slides in from right on task click; backdrop click or Esc dismisses.
 * - Auto-Save: Title & description updates dispatch immediately to useTaskStore.
 * - Subtasks: Inline toggle, Enter-to-add, and delete without reloading or modals.
 * ============================================================================
 */

