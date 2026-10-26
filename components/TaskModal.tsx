/**
 * ============================================================================
 * HEADER BLOCK: components/TaskModal.tsx — Minor Task Creation & Editing Dialog
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Provides an interactive modal to create or edit a Minor Task:
 * - Parent Major Task assignment (e.g. "Make Prowasp Telegram Bot")
 * - Minor Task Title & Description
 * - Priority selection (P0 Urgent, P1 High, P2 Normal, P3 Low)
 * - Assignee selection with Proaffiliaters team members
 * - Due date picker
 * - Status lifecycle
 * - Dynamic subtask checklist manager
 *
 * WHY THIS FILE EXISTS:
 * Ensures all minor task data is validated and cleanly typed before dispatch.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Interacts with useTaskStore to call addTask or updateTask.
 * ============================================================================
 */

"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Calendar, User, Flag, Tag, CheckSquare } from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { ProjectTask, TaskPriority, TaskStatus, SubtaskItem } from "@/lib/types";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: ProjectTask | null;
  defaultProjectId?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  defaultProjectId,
}) => {
  const { projects, teamMembers, addTask, updateTask, selectedProjectId } = useTaskStore();

  const [projectId, setProjectId] = useState<string>(
    defaultProjectId || selectedProjectId || projects[0]?.id || ""
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("P1");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [assigneeName, setAssigneeName] = useState(teamMembers[0]?.name || "Pushkar (Founder)");
  const [dueDate, setDueDate] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<SubtaskItem[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  useEffect(() => {
    if (taskToEdit) {
      setProjectId(taskToEdit.projectId);
      setName(taskToEdit.name);
      setDescription(taskToEdit.description);
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setAssigneeName(taskToEdit.assignee.name);
      setDueDate(taskToEdit.dueDate || "");
      setTags(taskToEdit.tags || []);
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      setProjectId(defaultProjectId || selectedProjectId || projects[0]?.id || "");
      setName("");
      setDescription("");
      setPriority("P1");
      setStatus("todo");
      setAssigneeName(teamMembers[0]?.name || "Pushkar (Founder)");
      setDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]);
      setTags(["Sprint"]);
      setSubtasks([]);
    }
  }, [taskToEdit, isOpen, defaultProjectId, selectedProjectId, projects, teamMembers]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: `st-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false },
    ]);
    setNewSubtaskTitle("");
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((st) => st.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter a minor task title.");
      return;
    }

    const matchedMember =
      teamMembers.find((m) => m.name === assigneeName) || teamMembers[0];

    const assignee = {
      name: matchedMember.name,
      avatar: matchedMember.avatar,
      role: matchedMember.role,
    };

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        projectId,
        name: name.trim(),
        description: description.trim(),
        priority,
        status,
        assignee,
        assigneeEmail: matchedMember.email.toLowerCase(),
        dueDate,
        tags,
        subtasks,
      });
    } else {
      addTask({
        projectId,
        name: name.trim(),
        description: description.trim(),
        priority,
        status,
        assignee,
        assigneeEmail: matchedMember.email.toLowerCase(),
        dueDate,
        tags,
        subtasks,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h3 className="text-lg font-heading font-extrabold text-foreground">
              {taskToEdit ? "Edit Minor Task" : "Add Minor Task"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Minor tasks are arranged strictly priority-wise under their parent Major Task.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4 text-xs">
          {/* Parent Major Task Selection */}
          <div>
            <label className="block font-semibold text-foreground mb-1">Parent Major Task:</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category})
                </option>
              ))}
            </select>
          </div>

          {/* Minor Task Name */}
          <div>
            <label className="block font-semibold text-foreground mb-1">Minor Task Title:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Implement MTProto Auto-Reconnect & Session Failover"
              className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              required
            />
          </div>

          {/* Minor Task Description */}
          <div>
            <label className="block font-semibold text-foreground mb-1">Description & Scope:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe what needs to be done, test requirements, and checklist..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
            />
          </div>

          {/* Priority & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Priority Order:</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              >
                <option value="P0">P0 • Urgent (Top Priority)</option>
                <option value="P1">P1 • High</option>
                <option value="P2">P2 • Normal</option>
                <option value="P3">P3 • Low</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Initial Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Assignee & Due Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Lead Assignee:</label>
              <select
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Due Date:</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              />
            </div>
          </div>

          {/* Subtasks Checklist Builder */}
          <div>
            <label className="block font-semibold text-foreground mb-1">
              Checklist / Subtasks:
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add subtask checklist item..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground shadow-xs"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-4 py-2 rounded-xl bg-primary text-white font-bold flex items-center gap-1 shadow-sm"
              >
                <Plus size={13} />
                <span>Add</span>
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-muted/40 border border-border">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-card border border-border shadow-2xs"
                  >
                    <span className="text-foreground">{st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
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
              {taskToEdit ? "Save Changes" : "Create Minor Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * FOOTER BLOCK: components/TaskModal.tsx Implementation Notes
 * ============================================================================
 * - Workflow: Validates fields, synchronizes subtasks, dispatches store actions.
 * ============================================================================
 */
