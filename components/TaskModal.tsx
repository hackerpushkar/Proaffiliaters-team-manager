/**
 * ============================================================================
 * HEADER BLOCK: components/TaskModal.tsx — Minor Task Creation & Editing Dialog
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Provides an enterprise-tier, high-aesthetic modal to create or edit a Minor Task:
 * - Parent Major Task assignment with project brand color indicator & category
 * - Minor Task Title & Description with high-focus typography
 * - Interactive Segmented Priority Selector (P0 Urgent, P1 High, P2 Normal, P3 Low)
 * - Interactive Status Lifecycle Selector (Backlog, To Do, In Progress, Review, Done)
 * - Rich Assignee Selector featuring teammate avatars and role badges
 * - Due date picker with 1-click quick interval presets (+3d, +1w, +2w)
 * - Interactive Tag Chips Manager with instant add/remove & common suggestions
 * - Interactive Subtasks / Checklist builder with live progress meter and toggleable states
 *
 * WHY THIS FILE EXISTS:
 * Eliminates plain, unstyled HTML form controls in favor of a modern Linear/Vercel-level
 * task authoring experience aligned with the Proaffiliaters visual design system.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Interacts with useTaskStore to call addTask or updateTask, ensuring complete
 * synchronization with project hierarchy, priority sequencing, and team views.
 * ============================================================================
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  Plus,
  Trash2,
  Calendar,
  User,
  Flag,
  Tag,
  CheckSquare,
  Square,
  FolderKanban,
  Sparkles,
  Flame,
  Clock,
  ListTodo,
} from "lucide-react";
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
  const { projects, teamMembers, addTask, updateTask, selectedProjectId, currentUser } =
    useTaskStore();

  const [projectId, setProjectId] = useState<string>(
    defaultProjectId || selectedProjectId || projects[0]?.id || ""
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("P1");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [assigneeEmail, setAssigneeEmail] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<SubtaskItem[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // Priority options with color themes and icons
  const priorityOptions: {
    id: TaskPriority;
    label: string;
    sublabel: string;
    color: string;
    activeClass: string;
    icon: typeof Flame;
  }[] = [
    {
      id: "P0",
      label: "P0 Urgent",
      sublabel: "Top Priority",
      color: "border-red-500/40 text-red-600 dark:text-red-400 bg-red-500/10",
      activeClass:
        "ring-2 ring-red-500 bg-red-500 text-white shadow-md shadow-red-500/30 border-transparent",
      icon: Flame,
    },
    {
      id: "P1",
      label: "P1 High",
      sublabel: "Important",
      color: "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10",
      activeClass:
        "ring-2 ring-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/30 border-transparent",
      icon: Flag,
    },
    {
      id: "P2",
      label: "P2 Normal",
      sublabel: "Standard",
      color: "border-indigo-500/40 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
      activeClass:
        "ring-2 ring-primary bg-primary text-white shadow-md shadow-primary/30 border-transparent",
      icon: Flag,
    },
    {
      id: "P3",
      label: "P3 Low",
      sublabel: "Backlog queue",
      color: "border-slate-500/40 text-slate-600 dark:text-slate-400 bg-slate-500/10",
      activeClass:
        "ring-2 ring-slate-500 bg-slate-600 text-white shadow-md shadow-slate-500/30 border-transparent",
      icon: Flag,
    },
  ];

  // Status lifecycle options
  const statusOptions: {
    id: TaskStatus;
    label: string;
    color: string;
    activeClass: string;
  }[] = [
    {
      id: "backlog",
      label: "Backlog",
      color: "text-slate-600 dark:text-slate-300 border-slate-500/30 bg-slate-500/10",
      activeClass:
        "bg-slate-700 text-white ring-2 ring-slate-500 shadow-sm border-transparent",
    },
    {
      id: "todo",
      label: "To Do",
      color: "text-purple-600 dark:text-purple-300 border-purple-500/30 bg-purple-500/10",
      activeClass:
        "bg-purple-600 text-white ring-2 ring-purple-400 shadow-sm border-transparent",
    },
    {
      id: "in_progress",
      label: "In Progress",
      color: "text-blue-600 dark:text-blue-300 border-blue-500/30 bg-blue-500/10",
      activeClass:
        "bg-blue-600 text-white ring-2 ring-blue-400 shadow-sm border-transparent",
    },
    {
      id: "review",
      label: "Review",
      color: "text-amber-600 dark:text-amber-300 border-amber-500/30 bg-amber-500/10",
      activeClass:
        "bg-amber-500 text-white ring-2 ring-amber-400 shadow-sm border-transparent",
    },
    {
      id: "done",
      label: "Done",
      color: "text-emerald-600 dark:text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
      activeClass:
        "bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-sm border-transparent",
    },
  ];

  // Quick tag recommendations
  const recommendedTags = ["Sprint", "Backend", "Frontend", "API", "Security", "BugFix"];

  // Sync state when modal opens or taskToEdit changes
  useEffect(() => {
    if (taskToEdit) {
      setProjectId(taskToEdit.projectId);
      setName(taskToEdit.name);
      setDescription(taskToEdit.description || "");
      setPriority(taskToEdit.priority || "P1");
      setStatus(taskToEdit.status || "todo");
      const matchedEmail =
        taskToEdit.assigneeEmail ||
        teamMembers.find((m) => m.name === taskToEdit.assignee?.name)?.email ||
        teamMembers[0]?.email ||
        "";
      setAssigneeEmail(matchedEmail);
      setDueDate(taskToEdit.dueDate || "");
      setTags(taskToEdit.tags || []);
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      setProjectId(defaultProjectId || selectedProjectId || projects[0]?.id || "");
      setName("");
      setDescription("");
      setPriority("P1");
      setStatus("todo");
      setAssigneeEmail(currentUser?.email || teamMembers[0]?.email || "");
      setDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]);
      setTags(["Sprint"]);
      setSubtasks([]);
    }
    setNewSubtaskTitle("");
    setTagInput("");
  }, [taskToEdit, isOpen, defaultProjectId, selectedProjectId, projects, teamMembers, currentUser]);

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

  // Subtask management
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, title: newSubtaskTitle.trim(), completed: false },
    ]);
    setNewSubtaskTitle("");
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks((prev) =>
      prev.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st))
    );
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((st) => st.id !== id));
  };

  // Tag management
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

  // Quick Due Date setter
  const setDaysFromNow = (days: number) => {
    const target = new Date(Date.now() + days * 86400000);
    setDueDate(target.toISOString().split("T")[0]);
  };

  // Subtask progress calculation
  const completedSubtasks = subtasks.filter((s) => s.completed).length;
  const totalSubtasks = subtasks.length;
  const subtaskPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please provide a task title.");
      return;
    }

    if (!projectId && projects.length > 0) {
      alert("Please select a parent project.");
      return;
    }

    const matchedMember =
      teamMembers.find((m) => m.email.toLowerCase() === assigneeEmail.toLowerCase()) ||
      teamMembers[0] || {
        name: "Pushkar (Founder)",
        email: "admin@proaffiliaters.com",
        role: "Founder & Super Admin",
        avatar: "/founder.jpg",
      };

    const assignee = {
      name: matchedMember.name,
      avatar: matchedMember.avatar || "/founder.jpg",
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

  const selectedProject = projects.find((p) => p.id === projectId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md transition-all animate-fadeIn">
      {/* Modal Card */}
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-card border border-border/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] overflow-hidden transition-all">
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-indigo-500 to-purple-600 shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-border bg-card/80 backdrop-blur-xs shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
              {taskToEdit ? <Sparkles size={20} /> : <CheckSquare size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-heading font-extrabold text-foreground tracking-tight">
                  {taskToEdit ? "Edit Task" : "Create New Task"}
                </h3>
                {selectedProject && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-muted text-muted-foreground border border-border">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: selectedProject.color || "#3b5bfa" }}
                    />
                    {selectedProject.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {taskToEdit
                  ? "Update deliverables, priority order, assignee, and checklist items."
                  : "Define deliverables, priority hierarchy, and team assignments under a project."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="Close dialog (Esc)"
          >
            <X size={19} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Parent Project Picker */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1.5">
              <FolderKanban size={14} className="text-primary" />
              <span>Parent Ongoing Project *</span>
            </label>
            {projects.length > 0 ? (
              <div className="relative">
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-muted/50 hover:bg-muted/70 focus:bg-card border border-border text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-xs appearance-none cursor-pointer"
                  required
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-card text-foreground py-1">
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-muted-foreground">
                  <span
                    className="w-2.5 h-2.5 rounded-full mr-2"
                    style={{ backgroundColor: selectedProject?.color || "#3b5bfa" }}
                  />
                  ▼
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
                No Ongoing Projects found. Please create a project first before adding tasks.
              </div>
            )}
          </div>

          {/* Task Name Title */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Implement MTProto Auto-Reconnect & Session Failover"
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 hover:bg-muted/70 focus:bg-card border border-border text-foreground placeholder:text-muted-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-xs"
              required
            />
          </div>

          {/* Description & Scope */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Description & Deliverable Scope
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe technical implementation requirements, test criteria, and edge cases..."
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 hover:bg-muted/70 focus:bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-xs resize-y"
            />
          </div>

          {/* Priority Selection Segmented Pills */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Flag size={14} className="text-primary" />
                <span>Priority Order</span>
              </label>
              <span className="text-[11px] text-muted-foreground">
                Higher priority tasks appear at the top of the sprint backlog
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {priorityOptions.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = priority === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPriority(opt.id)}
                    className={`flex flex-col items-start p-2.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? opt.activeClass
                        : `${opt.color} hover:brightness-105 opacity-80 hover:opacity-100`
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-extrabold text-xs flex items-center gap-1">
                        <IconComponent size={13} />
                        {opt.label}
                      </span>
                      {isSelected && <Check size={13} className="stroke-[3]" />}
                    </div>
                    <span
                      className={`text-[10px] mt-0.5 truncate ${
                        isSelected ? "text-white/80" : "text-muted-foreground"
                      }`}
                    >
                      {opt.sublabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Lifecycle Segmented Pills */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-2">
              <Clock size={14} className="text-primary" />
              <span>Status Lifecycle</span>
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
                        ? opt.activeClass
                        : `${opt.color} hover:brightness-105 opacity-75 hover:opacity-100`
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assignee & Due Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
            {/* Lead Assignee */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1.5">
                <User size={14} className="text-primary" />
                <span>Lead Assignee</span>
              </label>
              <div className="relative">
                <select
                  value={assigneeEmail}
                  onChange={(e) => setAssigneeEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-xs"
                >
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.email} className="bg-card text-foreground">
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
              {/* Assignee Preview Badge */}
              {(() => {
                const current = teamMembers.find(
                  (m) => m.email.toLowerCase() === assigneeEmail.toLowerCase()
                );
                if (!current) return null;
                return (
                  <div className="flex items-center gap-2 mt-2 px-2.5 py-1.5 rounded-lg bg-card border border-border/80">
                    <img
                      src={current.avatar || "/founder.jpg"}
                      alt={current.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/founder.jpg";
                      }}
                      className="w-6 h-6 rounded-full object-cover border border-border shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-bold text-foreground text-[11px] leading-tight truncate">
                        {current.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{current.role}</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Due Date & Presets */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1.5">
                <Calendar size={14} className="text-primary" />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-xs"
              />
              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] font-semibold text-muted-foreground">Quick:</span>
                <button
                  type="button"
                  onClick={() => setDaysFromNow(3)}
                  className="px-2 py-0.5 rounded-md bg-card hover:bg-muted border border-border text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  +3 Days
                </button>
                <button
                  type="button"
                  onClick={() => setDaysFromNow(7)}
                  className="px-2 py-0.5 rounded-md bg-card hover:bg-muted border border-border text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  +1 Week
                </button>
                <button
                  type="button"
                  onClick={() => setDaysFromNow(14)}
                  className="px-2 py-0.5 rounded-md bg-card hover:bg-muted border border-border text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  +2 Weeks
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Tag Chips Management */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1.5">
              <Tag size={14} className="text-primary" />
              <span>Tags & Labels</span>
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/25 text-primary text-[11px] font-bold shadow-2xs"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-red-500 rounded-sm ml-0.5 transition-colors"
                    title={`Remove #${t}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}

              {/* Tag Input */}
              <div className="inline-flex items-center gap-1">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="+ Add tag..."
                  className="w-24 px-2 py-1 rounded-lg bg-muted/60 border border-border text-foreground text-[11px] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] text-muted-foreground">Suggestions:</span>
              {recommendedTags.map((rt) => {
                const alreadyAdded = tags.includes(rt);
                return (
                  <button
                    key={rt}
                    type="button"
                    disabled={alreadyAdded}
                    onClick={() => handleAddTag(rt)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all ${
                      alreadyAdded
                        ? "opacity-40 cursor-not-allowed bg-muted border-transparent text-muted-foreground"
                        : "bg-card hover:bg-primary/10 border-border hover:border-primary/30 text-muted-foreground hover:text-primary cursor-pointer"
                    }`}
                  >
                    +{rt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Checklist / Subtasks Builder */}
          <div className="p-4 rounded-2xl bg-muted/20 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListTodo size={15} className="text-primary" />
                <span className="font-bold text-xs text-foreground">
                  Subtask Deliverables & Checklist
                </span>
              </div>
              {totalSubtasks > 0 && (
                <span className="text-[11px] font-extrabold text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                  {completedSubtasks} / {totalSubtasks} completed ({subtaskPercent}%)
                </span>
              )}
            </div>

            {/* Subtask Progress Bar */}
            {totalSubtasks > 0 && (
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${subtaskPercent}%` }}
                />
              </div>
            )}

            {/* Quick Add Subtask Input */}
            <div className="flex gap-2">
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
                placeholder="Type a subtask checkpoint and press Enter..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-2xs"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-4 py-2 rounded-xl bg-primary text-white font-bold flex items-center gap-1.5 hover:bg-primary/90 shadow-sm transition-all"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>

            {/* Subtasks List */}
            {subtasks.length > 0 ? (
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className={`group flex items-center justify-between px-3.5 py-2 rounded-xl border transition-all ${
                      st.completed
                        ? "bg-muted/40 border-border/60 opacity-80"
                        : "bg-card border-border hover:border-primary/40 shadow-2xs"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(st.id)}
                      className="flex items-center gap-2.5 flex-1 text-left cursor-pointer"
                    >
                      {st.completed ? (
                        <CheckSquare size={16} className="text-emerald-500 shrink-0" />
                      ) : (
                        <Square size={16} className="text-muted-foreground group-hover:text-primary shrink-0" />
                      )}
                      <span
                        className={`text-xs font-medium transition-all ${
                          st.completed
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {st.title}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="p-1 rounded-md text-muted-foreground/60 hover:text-red-500 hover:bg-red-500/10 transition-colors ml-2"
                      title="Delete subtask"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground italic text-center py-2">
                No checklist items yet. Add atomic steps to track deliverable completion.
              </p>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-border shrink-0 mt-4">
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
                <span>{taskToEdit ? "Save Changes" : "Create Task"}</span>
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
 * FOOTER BLOCK: components/TaskModal.tsx Implementation Notes & Caveats
 * ============================================================================
 * - Workflow & Execution: Form validation checks title & parent project; dispatches
 *   clean addTask or updateTask mutations to useTaskStore with auto-calculated ranks.
 * - Data Movement: Keeps subtasks, priority pills, and tag chips strictly synchronized.
 * - Key Exports: TaskModal React functional component.
 * - Caveats to Avoid Regressions: Never remove assignee email normalization;
 *   the system depends on lowercase assigneeEmail for "My Tasks" filtering.
 * ============================================================================
 */
