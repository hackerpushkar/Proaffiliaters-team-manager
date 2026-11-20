/**
 * ============================================================================
 * HEADER BLOCK: components/PersonalTaskModal.tsx — Personal Task Creation & Edit Drawer
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Provides a specialized slide-over drawer to create and edit personal tasks
 * in the "My Tasks" personal workspace:
 * - Task Title, Description, and Priority levels (P0 Urgent, P1 High, P2 Normal, P3 Low)
 * - Due Date picker with quick presets (Today, Tomorrow, +1 Week)
 * - Subtask checklist management
 * - Zero dependency on Ongoing Projects (strictly personal tasks)
 *
 * WHY THIS FILE EXISTS:
 * Fulfills user request: "and in my tasks dont include projects task - in my task
 * i can add my task manually".
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Dispatches addTask or updateTask in useTaskStore with isPersonal: true and
 * projectId: "personal", persisting to MongoDB and LocalStorage.
 * ============================================================================
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ListTodo,
  Sparkles,
  Trash2,
  Plus,
  Clock,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { ProjectTask, TaskPriority, TaskStatus, SubtaskItem } from "@/lib/types";

interface PersonalTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: ProjectTask | null;
}

export const PersonalTaskModal: React.FC<PersonalTaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
}) => {
  const { currentUser, addTask, updateTask } = useTaskStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("P1");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [subtasks, setSubtasks] = useState<SubtaskItem[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  useEffect(() => {
    if (taskToEdit) {
      setName(taskToEdit.name);
      setDescription(taskToEdit.description || "");
      setPriority(taskToEdit.priority || "P1");
      setStatus(taskToEdit.status || "todo");
      setDueDate(taskToEdit.dueDate || new Date().toISOString().split("T")[0]);
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      setName("");
      setDescription("");
      setPriority("P1");
      setStatus("todo");
      setDueDate(new Date().toISOString().split("T")[0]);
      setSubtasks([]);
    }
    setNewSubtaskTitle("");
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  // Preset Date Handlers
  const handleSetPresetDate = (daysToAdd: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    setDueDate(d.toISOString().split("T")[0]);
  };

  // Subtask handlers
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const item: SubtaskItem = {
      id: `sub-${Date.now().toString(36)}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks((prev) => [...prev, item]);
    setNewSubtaskTitle("");
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter a task name.");
      return;
    }

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        name: name.trim(),
        description: description.trim(),
        priority,
        status,
        dueDate,
        subtasks,
        isPersonal: true,
      });
    } else {
      addTask({
        name: name.trim(),
        description: description.trim(),
        priority,
        status: "todo",
        dueDate,
        subtasks,
        tags: ["personal"],
        isPersonal: true,
        projectId: "personal",
        assignee: {
          name: currentUser?.name || "Pushkar (Founder)",
          avatar: currentUser?.avatar || "/founder.jpg",
          role: currentUser?.role || "Founder",
        },
        assigneeEmail: currentUser?.email || "pushkar@proaffiliaters.com",
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg h-full bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-heading font-extrabold text-foreground">
                {taskToEdit ? "Edit Personal Task" : "Add Personal Task"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Add to-dos and action items to your private personal workspace
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

        {/* Drawer Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Task Name */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Task Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Review affiliate payout report & approve pending accounts"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Priority Urgency
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { id: "P0", label: "P0 Urgent", pill: "border-red-500/30 text-red-600 bg-red-500/10" },
                  { id: "P1", label: "P1 High", pill: "border-amber-500/30 text-amber-600 bg-amber-500/10" },
                  { id: "P2", label: "P2 Normal", pill: "border-blue-500/30 text-blue-600 bg-blue-500/10" },
                  { id: "P3", label: "P3 Low", pill: "border-border text-muted-foreground bg-muted/40" },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center ${
                    priority === p.id
                      ? "border-primary bg-primary text-white shadow-xs"
                      : `${p.pill} hover:border-foreground/30`
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date & Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar size={13} className="text-primary" />
                <span>Due Date</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleSetPresetDate(0)}
                  className="px-2 py-0.5 rounded text-[11px] font-bold bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPresetDate(1)}
                  className="px-2 py-0.5 rounded text-[11px] font-bold bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPresetDate(7)}
                  className="px-2 py-0.5 rounded text-[11px] font-bold bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                >
                  +1 Week
                </button>
              </div>
            </div>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Description & Notes */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Description & Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add extra context, links, or instructions..."
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Subtasks / Checklist */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
              <ListTodo size={13} className="text-purple-500" />
              <span>Subtasks & Checklist</span>
            </label>

            <div className="space-y-1.5 mb-2">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border"
                >
                  <label className="flex items-center gap-2 text-xs cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => handleToggleSubtask(st.id)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span
                      className={`truncate ${
                        st.completed ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {st.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(st.id)}
                    className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
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
                placeholder="Add subtask and press enter..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                disabled={!newSubtaskTitle.trim()}
                className="px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 disabled:opacity-50 text-foreground text-xs font-bold border border-border transition-all flex items-center gap-1"
              >
                <Plus size={12} />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Sparkles size={13} />
              <span>{taskToEdit ? "Save Changes" : "Create Personal Task"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * FOOTER BLOCK: components/PersonalTaskModal.tsx Implementation Notes
 * ============================================================================
 * - Workflow: Creates or edits personal to-dos without requiring project association.
 * - Persistence: Tags tasks as isPersonal: true and projectId: "personal".
 * ============================================================================
 */
