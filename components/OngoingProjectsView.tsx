/**
 * ============================================================================
 * HEADER BLOCK: components/OngoingProjectsView.tsx — Projects & Task Engine
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Implements the two-tier Ongoing Projects architecture:
 * Tier 1 (Overview Hub): Clean, aesthetic cards showing Project Name, Lead info,
 *   Teammates roster, progress bar, 9-dot drag handle (Grip) for vertical reordering,
 *   On Hold (Paused) toggle controls and status filtering, and a prominent "Continue Workspace →" button.
 * Tier 2 (Dedicated Project Workspace): Full-page workspace for a selected project
 *   with "← Back to All Projects" breadcrumbs, On Hold banner & resume triggers,
 *   Multi-View Switcher (Hierarchy Tree, Agile Kanban Board, Table Grid), Priority
 *   Reordering (▲/▼), Subtask Checklists, and Rapid Inline Task Creation.
 *
 * WHY THIS FILE EXISTS:
 * Fulfills user requirements:
 * - Two-tier workspace isolation with continue navigation
 * - 9-dot drag handle container repositioning
 * - Option to put projects On Hold (pause sprint deliverables) and resume them.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Interacts with useTaskStore (selectedProjectId, projects, tasks, reorderProjects, updateProject, etc.).
 * ============================================================================
 */

"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  Layers,
  Plus,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  User,
  ListOrdered,
  LayoutGrid,
  CheckSquare,
  ChevronRight,
  ChevronDown,
  Edit,
  Trash2,
  Send,
  MoreVertical,
  Flag,
  Search,
  Filter,
  Kanban,
  Table as TableIcon,
  ChevronsUpDown,
  ListFilter,
  Archive,
  ArchiveRestore,
  X,
  RotateCcw,
  UserPlus,
  Cpu,
  Globe,
  Pin,
  Zap,
  Grip,
  Pause,
  Play,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { OngoingProject, ProjectTask, TaskPriority, TaskStatus } from "@/lib/types";
import { InviteTeammateModal } from "@/components/InviteTeammateModal";
import { TaskSlideOverDrawer } from "@/components/TaskSlideOverDrawer";

interface OngoingProjectsViewProps {
  onOpenAddTaskModal: (projectId?: string) => void;
  onOpenEditTaskModal: (task: ProjectTask) => void;
  onOpenNewProjectModal: () => void;
  onOpenEditProjectModal: (project: OngoingProject) => void;
}

type ViewMode = "tree" | "board" | "table";

export const OngoingProjectsView: React.FC<OngoingProjectsViewProps> = ({
  onOpenAddTaskModal,
  onOpenEditTaskModal,
  onOpenNewProjectModal,
  onOpenEditProjectModal,
}) => {
  const {
    currentUser,
    projects,
    tasks,
    teamMembers,
    selectedProjectId,
    setSelectedProjectId,
    reorderProjects,
    reorderTaskPriority,
    reorderTaskPosition,
    moveTaskStatus,
    toggleSubtask,
    deleteTask,
    deleteProject,
    updateProject,
    addTask,
    searchQuery,
  } = useTaskStore();

  // Multi-view mode inside dedicated workspace: 'tree' | 'board' | 'table'
  const [viewMode, setViewMode] = useState<ViewMode>("tree");

  // Invite Teammate modal state
  const [inviteModalProject, setInviteModalProject] = useState<OngoingProject | null>(null);

  // Active task for Slide-Over Drawer ("Task Slider")
  const [activeDrawerTaskId, setActiveDrawerTaskId] = useState<string | null>(null);

  // Drag and drop task reordering states
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [taskDropPosition, setTaskDropPosition] = useState<"before" | "after" | null>(null);
  const taskDragFromHandle = useRef<boolean>(false);

  // Drag and drop project reordering states
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [dragOverProjectId, setDragOverProjectId] = useState<string | null>(null);
  const [projectDropPosition, setProjectDropPosition] = useState<"before" | "after" | null>(null);
  const projectDragFromHandle = useRef<boolean>(false);

  // Filters State
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(false);
  const [showClosedProjects, setShowClosedProjects] = useState<boolean>(false);
  const [projectStatusFilter, setProjectStatusFilter] = useState<"all" | "active" | "paused" | "completed">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Track open checklist drawer per task
  const [expandedChecklists, setExpandedChecklists] = useState<Record<string, boolean>>({});

  // Inline Quick Add state per Project
  const [inlineTaskNames, setInlineTaskNames] = useState<Record<string, string>>({});
  const [inlinePriorities, setInlinePriorities] = useState<Record<string, TaskPriority>>({});

  const toggleChecklistDrawer = (taskId: string) => {
    setExpandedChecklists((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  // Helper for priority badges
  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "P0":
        return {
          label: "P0 • Urgent",
          class: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 font-bold",
          dot: "bg-red-500",
        };
      case "P1":
        return {
          label: "P1 • High",
          class: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-bold",
          dot: "bg-amber-500",
        };
      case "P2":
        return {
          label: "P2 • Normal",
          class: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 font-bold",
          dot: "bg-indigo-500",
        };
      case "P3":
        return {
          label: "P3 • Low",
          class: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 font-bold",
          dot: "bg-slate-400",
        };
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "backlog":
        return "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20";
      case "todo":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20";
      case "in_progress":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/20";
      case "review":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20";
      case "done":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20";
    }
  };

  // Quick Inline Add handler inside dedicated workspace
  const handleQuickAddTask = (projectId: string) => {
    const taskName = (inlineTaskNames[projectId] || "").trim();
    if (!taskName) return;

    const chosenPriority = inlinePriorities[projectId] || "P1";
    const defaultAssignee = teamMembers[0] || {
      name: "Team Lead",
      avatar: "/avatars/anime1.png",
      role: "Architect",
    };

    addTask({
      projectId: projectId,
      name: taskName,
      description: "Quick task added directly from workspace.",
      priority: chosenPriority,
      status: "todo",
      assignee: defaultAssignee,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      subtasks: [],
      tags: ["Sprint"],
    });

    setInlineTaskNames((prev) => ({ ...prev, [projectId]: "" }));
  };

  // Filter tasks per project
  const getFilteredTasksForProject = (projectId: string) => {
    return tasks
      .filter((t) => t.projectId === projectId)
      .filter((t) => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchesName = t.name.toLowerCase().includes(q);
          const matchesDesc = t.description.toLowerCase().includes(q);
          const matchesAssignee = t.assignee.name.toLowerCase().includes(q);
          const matchesTag = (t.tags || []).some((tag) => tag.toLowerCase().includes(q));
          if (!matchesName && !matchesDesc && !matchesAssignee && !matchesTag) return false;
        }

        if (statusFilter === "unfinished") {
          if (t.status === "done") return false;
        } else if (statusFilter !== "all" && t.status !== statusFilter) {
          return false;
        }

        if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;

        return true;
      })
      .sort((a, b) => a.priorityRank - b.priorityRank);
  };

  // Check if a specific project is selected for full-page workspace view
  const focusedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  // Categories list for Overview filtering
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    projects.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [projects]);

  // Counts of held projects
  const holdProjectsCount = useMemo(() => {
    return projects.filter((p) => p.status === "paused").length;
  }, [projects]);

  // Overview filtered projects list
  const overviewProjects = useMemo(() => {
    return projects.filter((p) => {
      // Status filter
      if (projectStatusFilter === "active" && (p.status === "paused" || p.status === "completed")) return false;
      if (projectStatusFilter === "paused" && p.status !== "paused") return false;
      if (projectStatusFilter === "completed" && p.status !== "completed") return false;
      if (projectStatusFilter === "all" && !showClosedProjects && p.status === "completed") return false;

      // Category filter
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;

      // Search query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesLead = p.lead.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesLead) return false;
      }
      return true;
    });
  }, [projects, projectStatusFilter, showClosedProjects, categoryFilter, searchQuery]);

  // Global KPIs across active projects
  const activeProjectsCount = projects.filter((p) => p.status !== "completed").length;
  const activeTasks = tasks.filter((t) => {
    const p = projects.find((proj) => proj.id === t.projectId);
    return p && p.status !== "completed";
  });
  const totalTasksCount = activeTasks.length;
  const completedTasksCount = activeTasks.filter((t) => t.status === "done").length;
  const pendingTasksCount = activeTasks.filter((t) => t.status !== "done").length;
  const globalProgress = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // =========================================================================
  // VIEW TIER 2: DEDICATED FULL-PAGE PROJECT WORKSPACE (WHEN PROJECT SELECTED)
  // =========================================================================
  if (focusedProject) {
    const projectTasks = getFilteredTasksForProject(focusedProject.id);
    const totalProjTasks = tasks.filter((t) => t.projectId === focusedProject.id).length;
    const completedProjTasks = tasks.filter((t) => t.projectId === focusedProject.id && t.status === "done").length;
    const projProgress = totalProjTasks > 0 ? Math.round((completedProjTasks / totalProjTasks) * 100) : 0;
    const isClosed = focusedProject.status === "completed";

    // Teammates lookup
    const joinedMembers = (focusedProject.teamMemberEmails || [])
      .map((email) => teamMembers.find((m) => m.email.toLowerCase() === email.toLowerCase()))
      .filter(Boolean);

    return (
      <div className="flex flex-col gap-6 animate-fadeIn pb-16">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <button
            onClick={() => setSelectedProjectId(null)}
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground p-2 rounded-xl hover:bg-muted/60 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to All Projects</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Hold / Resume Project */}
            {focusedProject.status === "paused" ? (
              <button
                onClick={() => updateProject(focusedProject.id, { status: "active" })}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
                title="Resume project sprint"
              >
                <Play size={14} className="fill-current" />
                <span>Resume Project</span>
              </button>
            ) : !isClosed ? (
              <button
                onClick={() => updateProject(focusedProject.id, { status: "paused" })}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
                title="Put this project on hold"
              >
                <Pause size={14} className="fill-current" />
                <span>Put On Hold</span>
              </button>
            ) : null}

            {/* Close / Reopen Project */}
            {isClosed ? (
              <button
                onClick={() => updateProject(focusedProject.id, { status: "active" })}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
              >
                <ArchiveRestore size={14} />
                <span>Reopen Project</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (confirm(`Archive project "${focusedProject.name}"?`)) {
                    updateProject(focusedProject.id, { status: "completed" });
                  }
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border transition-all flex items-center gap-1.5"
              >
                <Archive size={14} />
                <span>Close Project</span>
              </button>
            )}

            {/* Full Task Modal Button */}
            <button
              onClick={() => onOpenAddTaskModal(focusedProject.id)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* On Hold Notification Ribbon if paused */}
        {focusedProject.status === "paused" && (
          <div className="flex items-center justify-between p-3.5 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 shadow-xs">
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <Pause size={15} className="fill-current shrink-0 text-amber-600 dark:text-amber-400" />
              <span>This project is currently <strong>On Hold</strong>. Sprint tasks and deliverables are paused.</span>
            </div>
            <button
              onClick={() => updateProject(focusedProject.id, { status: "active" })}
              className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 shadow-xs transition-colors shrink-0 flex items-center gap-1"
            >
              <Play size={12} className="fill-current" />
              <span>Resume Sprint</span>
            </button>
          </div>
        )}

        {/* Focused Project Header Banner */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{ backgroundColor: focusedProject.color || "#4f6ef7" }}
          />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white"
                  style={{ backgroundColor: focusedProject.color || "#4f6ef7" }}
                >
                  {focusedProject.category}
                </span>

                {focusedProject.status === "paused" ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 shadow-xs">
                    <Pause size={10} className="fill-current" />
                    <span>On Hold</span>
                  </span>
                ) : (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isClosed
                        ? "bg-muted text-muted-foreground border-border"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    }`}
                  >
                    {isClosed ? "Archived" : "Active Sprint"}
                  </span>
                )}

                <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <User size={12} />
                  <span>Lead: <strong>{focusedProject.lead}</strong></span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground tracking-tight">
                {focusedProject.name}
              </h1>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-4xl">
                {focusedProject.description}
              </p>

              {/* Teammates Roster */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-muted-foreground">Team Roster:</span>
                <div className="flex items-center -space-x-1.5">
                  {joinedMembers.map((member) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={member?.id}
                      src={member?.avatar}
                      alt={member?.name}
                      title={`${member?.name} (${member?.role})`}
                      className="w-7 h-7 rounded-full object-cover border-2 border-card ring-1 ring-border"
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setInviteModalProject(focusedProject)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border ml-1"
                >
                  <UserPlus size={12} className="text-primary" />
                  <span>+ Invite Teammates</span>
                </button>
              </div>
            </div>

            {/* Right: Progress KPIs */}
            <div className="flex sm:flex-col items-center justify-center p-4 rounded-2xl bg-muted/40 border border-border shrink-0 min-w-[140px] text-center gap-2">
              <div className="text-2xl font-heading font-extrabold text-foreground">
                {projProgress}%
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${projProgress}%`,
                    backgroundColor: focusedProject.color || "#4f6ef7",
                  }}
                />
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">
                {completedProjTasks} of {totalProjTasks} tasks done
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher & Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border shadow-xs">
          {/* View Modes Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border">
            <button
              onClick={() => setViewMode("tree")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "tree"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListOrdered size={14} />
              <span>Hierarchy Tree</span>
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "board"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Kanban size={14} />
              <span>Kanban Board</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "table"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TableIcon size={14} />
              <span>Table Grid</span>
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter(statusFilter === "unfinished" ? "all" : "unfinished")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                statusFilter === "unfinished"
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground border-border"
              }`}
            >
              ⚡ All Unfinished
            </button>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-muted/60 border border-border text-foreground font-semibold"
            >
              <option value="all">All Priorities</option>
              <option value="P0">P0 • Urgent</option>
              <option value="P1">P1 • High</option>
              <option value="P2">P2 • Normal</option>
              <option value="P3">P3 • Low</option>
            </select>
          </div>
        </div>

        {/* VIEW 1: HIERARCHY TREE VIEW */}
        {viewMode === "tree" && (
          <div className="flex flex-col gap-3">
            {/* Inline Rapid Task Creator */}
            {!isClosed && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border shadow-xs">
                <input
                  type="text"
                  value={inlineTaskNames[focusedProject.id] || ""}
                  onChange={(e) =>
                    setInlineTaskNames((prev) => ({
                      ...prev,
                      [focusedProject.id]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleQuickAddTask(focusedProject.id);
                  }}
                  placeholder={`+ Add task to ${focusedProject.name}... Press Enter`}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <select
                  value={inlinePriorities[focusedProject.id] || "P1"}
                  onChange={(e) =>
                    setInlinePriorities((prev) => ({
                      ...prev,
                      [focusedProject.id]: e.target.value as TaskPriority,
                    }))
                  }
                  className="px-2 py-1.5 text-xs rounded-lg bg-muted/60 border border-border text-foreground font-bold"
                >
                  <option value="P0">P0 • Urgent</option>
                  <option value="P1">P1 • High</option>
                  <option value="P2">P2 • Normal</option>
                  <option value="P3">P3 • Low</option>
                </select>
                <button
                  onClick={() => handleQuickAddTask(focusedProject.id)}
                  disabled={!(inlineTaskNames[focusedProject.id] || "").trim()}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            )}

            {/* Task Rows or Empty State */}
            {projectTasks.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-muted/20 border border-dashed border-border">
                <p className="text-sm font-bold text-foreground">No tasks in this project yet.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use the quick input above or click &quot;Add Task&quot; to begin building your roadmap.
                </p>
                <button
                  onClick={() => onOpenAddTaskModal(focusedProject.id)}
                  className="mt-3 px-4 py-1.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-sm"
                >
                  + Create First Task
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {projectTasks.map((task, index) => {
                  const priorityInfo = getPriorityBadge(task.priority);
                  const completedSubtasks = (task.subtasks || []).filter((st) => st.completed).length;
                  const isChecklistOpen = expandedChecklists[task.id] || false;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => {
                        if (!taskDragFromHandle.current) {
                          e.preventDefault();
                          return;
                        }
                        setDraggedTaskId(task.id);
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", task.id);
                      }}
                      onDragEnd={() => {
                        taskDragFromHandle.current = false;
                        setDraggedTaskId(null);
                        setDragOverTaskId(null);
                        setTaskDropPosition(null);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (!draggedTaskId || draggedTaskId === task.id) return;
                        e.dataTransfer.dropEffect = "move";
                        const rect = e.currentTarget.getBoundingClientRect();
                        const midY = rect.top + rect.height / 2;
                        const isAbove = e.clientY < midY;
                        const pos = isAbove ? "before" : "after";
                        if (dragOverTaskId !== task.id || taskDropPosition !== pos) {
                          setDragOverTaskId(task.id);
                          setTaskDropPosition(pos);
                        }
                      }}
                      onDragLeave={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                          if (dragOverTaskId === task.id) {
                            setDragOverTaskId(null);
                            setTaskDropPosition(null);
                          }
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!draggedTaskId || draggedTaskId === task.id) return;
                        reorderTaskPosition(draggedTaskId, task.id, taskDropPosition || "before");
                        taskDragFromHandle.current = false;
                        setDraggedTaskId(null);
                        setDragOverTaskId(null);
                        setTaskDropPosition(null);
                      }}
                      className={`relative flex flex-col rounded-xl bg-card border transition-all overflow-hidden ${
                        draggedTaskId === task.id
                          ? "opacity-30 scale-[0.99] border-dashed border-primary shadow-inner"
                          : dragOverTaskId === task.id
                          ? taskDropPosition === "before"
                            ? "border-primary shadow-md ring-2 ring-primary/40 -translate-y-0.5"
                            : "border-primary shadow-md ring-2 ring-primary/40 translate-y-0.5"
                          : "border-border hover:border-primary/40 shadow-xs"
                      }`}
                    >
                      {/* Drop indicator bar on top */}
                      {dragOverTaskId === task.id && taskDropPosition === "before" && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-600 rounded-t-xl z-20 animate-pulse" />
                      )}
                      {/* Drop indicator bar on bottom */}
                      {dragOverTaskId === task.id && taskDropPosition === "after" && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-600 rounded-b-xl z-20 animate-pulse" />
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-3">
                        {/* Task Title & 9-Dot Drag Handle & Priority Rank */}
                        <div
                          onClick={() => {
                            if (!draggedTaskId) setActiveDrawerTaskId(task.id);
                          }}
                          className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer group/title"
                        >
                          {/* 9-Dot Drag Handle Area */}
                          <div
                            data-drag-handle="true"
                            draggable={false}
                            onMouseDown={() => {
                              taskDragFromHandle.current = true;
                            }}
                            onMouseUp={() => {
                              taskDragFromHandle.current = false;
                            }}
                            onTouchStart={() => {
                              taskDragFromHandle.current = true;
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="flex items-center justify-center w-7 h-7 -ml-1 rounded-lg text-muted-foreground/40 hover:text-primary hover:bg-primary/10 active:bg-primary/20 cursor-grab active:cursor-grabbing transition-all shrink-0 self-center group/handle border border-transparent hover:border-primary/20 select-none"
                            title="Hold and drag up or down to reposition priority rank"
                            aria-label="Reorder task"
                          >
                            <Grip size={15} className="group-hover/handle:scale-110 group-active/handle:scale-95 transition-transform" />
                          </div>

                          {/* Reorder Buttons */}
                          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <span className="font-mono font-bold text-xs text-primary w-6 text-center">
                              #{task.priorityRank}
                            </span>
                            <div className="flex flex-col">
                              <button
                                disabled={index === 0}
                                onClick={() => reorderTaskPriority(task.id, "up")}
                                className="text-muted-foreground hover:text-foreground disabled:opacity-20 p-0.5"
                                title="Move up"
                              >
                                <ArrowUp size={11} />
                              </button>
                              <button
                                disabled={index === projectTasks.length - 1}
                                onClick={() => reorderTaskPriority(task.id, "down")}
                                className="text-muted-foreground hover:text-foreground disabled:opacity-20 p-0.5"
                                title="Move down"
                              >
                                <ArrowDown size={11} />
                              </button>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${priorityInfo.class}`}>
                            {task.priority}
                          </span>

                          <span
                            className={`text-xs sm:text-sm font-semibold truncate group-hover/title:text-primary transition-colors ${
                              task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"
                            }`}
                          >
                            {task.name}
                          </span>
                        </div>

                        {/* Controls & Assignee */}
                        <div className="flex items-center gap-2 shrink-0">
                          {task.subtasks && task.subtasks.length > 0 && (
                            <button
                              onClick={() => toggleChecklistDrawer(task.id)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                                isChecklistOpen
                                  ? "bg-primary text-white"
                                  : "bg-muted text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <CheckSquare size={13} />
                              <span>{completedSubtasks}/{task.subtasks.length}</span>
                            </button>
                          )}

                          {task.dueDate && (
                            <span className="hidden md:flex items-center gap-1 text-xs text-muted-foreground font-medium">
                              <Clock size={12} />
                              <span>{task.dueDate}</span>
                            </span>
                          )}

                          {/* Assignee */}
                          <div className="flex items-center gap-1.5" title={task.assignee.name}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={task.assignee.avatar}
                              alt={task.assignee.name}
                              className="w-6 h-6 rounded-full object-cover border border-border"
                            />
                            <span className="hidden lg:inline text-xs text-foreground font-medium max-w-[80px] truncate">
                              {task.assignee.name.split(" ")[0]}
                            </span>
                          </div>

                          {/* Status Dropdown */}
                          <select
                            value={task.status}
                            onChange={(e) => moveTaskStatus(task.id, e.target.value as TaskStatus)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg border cursor-pointer ${getStatusBadge(task.status)}`}
                          >
                            <option value="backlog">Backlog</option>
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                          </select>

                          <button
                            onClick={() => onOpenEditTaskModal(task)}
                            className="p-1 rounded text-muted-foreground hover:text-foreground"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete task "${task.name}"?`)) deleteTask(task.id);
                            }}
                            className="p-1 rounded text-muted-foreground hover:text-red-500"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Subtasks Drawer */}
                      {isChecklistOpen && task.subtasks && task.subtasks.length > 0 && (
                        <div className="px-4 py-3 bg-muted/20 border-t border-border/60 flex flex-col gap-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground font-bold">
                            <span>Checklist Progress</span>
                            <span className="text-primary font-bold">
                              {Math.round((completedSubtasks / task.subtasks.length) * 100)}%
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {task.subtasks.map((st) => (
                              <label
                                key={st.id}
                                className="flex items-center gap-2 text-xs text-foreground cursor-pointer hover:text-primary py-0.5"
                              >
                                <input
                                  type="checkbox"
                                  checked={st.completed}
                                  onChange={() => toggleSubtask(task.id, st.id)}
                                  className="w-4 h-4 rounded text-primary border-border focus:ring-0 cursor-pointer"
                                />
                                <span className={st.completed ? "line-through text-muted-foreground" : "font-medium"}>
                                  {st.title}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: KANBAN BOARD VIEW */}
        {viewMode === "board" && (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
            {(["backlog", "todo", "in_progress", "review", "done"] as TaskStatus[]).map((colStatus) => {
              const colTasks = projectTasks.filter((t) => t.status === colStatus);
              const statusTitles: Record<TaskStatus, { title: string; color: string }> = {
                backlog: { title: "Backlog", color: "text-slate-500" },
                todo: { title: "To Do", color: "text-purple-500" },
                in_progress: { title: "In Progress", color: "text-blue-500" },
                review: { title: "Review", color: "text-amber-500" },
                done: { title: "Done", color: "text-emerald-500" },
              };

              return (
                <div
                  key={colStatus}
                  className="flex flex-col rounded-xl bg-card border border-border shadow-xs overflow-hidden"
                >
                  <div className="p-3 bg-muted/40 border-b border-border/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${getStatusBadge(colStatus).split(" ")[0]}`} />
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                        {statusTitles[colStatus].title}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-muted text-muted-foreground border border-border">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="p-2.5 flex flex-col gap-2.5 min-h-[350px] max-h-[700px] overflow-y-auto">
                    {colTasks.length === 0 ? (
                      <div className="flex items-center justify-center p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                        No tasks
                      </div>
                    ) : (
                      colTasks.map((task) => {
                        const priorityInfo = getPriorityBadge(task.priority);
                        return (
                          <div
                            key={task.id}
                            onClick={() => setActiveDrawerTaskId(task.id)}
                            className="p-3 rounded-lg bg-card border border-border hover:border-primary/40 shadow-xs flex flex-col gap-2 transition-all cursor-pointer group hover:shadow-sm"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono font-bold text-primary">#{task.priorityRank}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${priorityInfo.class}`}>
                                {task.priority}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-foreground leading-snug group-hover:text-primary transition-colors">{task.name}</h4>
                            <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs text-muted-foreground">
                              <span>{task.assignee.name.split(" ")[0]}</span>
                              <select
                                value={task.status}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => moveTaskStatus(task.id, e.target.value as TaskStatus)}
                                className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-bold cursor-pointer"
                              >
                                <option value="backlog">Backlog</option>
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="review">Review</option>
                                <option value="done">Done</option>
                              </select>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 3: TABLE GRID VIEW */}
        {viewMode === "table" && (
          <div className="rounded-xl bg-card border border-border shadow-xs overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-muted-foreground uppercase text-[11px] font-bold">
                  <th className="py-3 px-3.5">Rank</th>
                  <th className="py-3 px-3.5">Priority</th>
                  <th className="py-3 px-3.5">Task Name</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5">Assignee</th>
                  <th className="py-3 px-3.5">Due Date</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {projectTasks.map((task) => {
                  const priorityInfo = getPriorityBadge(task.priority);
                  return (
                    <tr
                      key={task.id}
                      onClick={() => setActiveDrawerTaskId(task.id)}
                      className="hover:bg-muted/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-2.5 px-3.5 font-mono font-bold text-primary">#{task.priorityRank}</td>
                      <td className="py-2.5 px-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${priorityInfo.class}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 font-semibold text-foreground group-hover:text-primary transition-colors">{task.name}</td>
                      <td className="py-2.5 px-3.5" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={task.status}
                          onChange={(e) => moveTaskStatus(task.id, e.target.value as TaskStatus)}
                          className={`px-2 py-0.5 text-xs font-bold rounded-lg border ${getStatusBadge(task.status)} cursor-pointer`}
                        >
                          <option value="backlog">Backlog</option>
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="done">Done</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3.5">{task.assignee.name}</td>
                      <td className="py-2.5 px-3.5 text-muted-foreground">{task.dueDate || "-"}</td>
                      <td className="py-2.5 px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onOpenEditTaskModal(task)}
                          className="p-1 rounded text-muted-foreground hover:text-foreground mr-1"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete task "${task.name}"?`)) deleteTask(task.id);
                          }}
                          className="p-1 rounded text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Invite Teammate Modal */}
        <InviteTeammateModal
          isOpen={!!inviteModalProject}
          onClose={() => setInviteModalProject(null)}
          project={inviteModalProject}
        />

        {/* Task Slide-Over Drawer ("Task Slider") */}
        <TaskSlideOverDrawer
          taskId={activeDrawerTaskId}
          onClose={() => setActiveDrawerTaskId(null)}
          onOpenEditModal={(task) => onOpenEditTaskModal(task)}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW TIER 1: ALL PROJECTS OVERVIEW CARDS (LANDING HUB)
  // =========================================================================
  return (
    <div className="flex flex-col gap-5 animate-fadeIn pb-16">
      {/* Top Header & High-Density Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-heading font-extrabold text-foreground tracking-tight">
              Ongoing Projects
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/20">
              INITIATIVES HUB
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dedicated multi-view workspaces with drag-and-drop priority sequencing.
          </p>
        </div>

        {/* Live Metrics Tiles & New Project Action */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-card border border-border shadow-2xs text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Active:</span>
              <strong className="text-foreground">{activeProjectsCount}</strong>
            </div>
            <div className="h-3.5 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Pending:</span>
              <strong className="text-primary">{pendingTasksCount}</strong>
            </div>
            <div className="h-3.5 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Progress:</span>
              <strong className="text-emerald-500">{globalProgress}%</strong>
            </div>
          </div>

          <button
            onClick={onOpenNewProjectModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold text-xs text-white bg-primary hover:bg-primary/90 shadow-2xs transition-all active:scale-98"
          >
            <Plus size={14} />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Filter and Category Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-card border border-border shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/40">
            <button
              onClick={() => setProjectStatusFilter("all")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                projectStatusFilter === "all"
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setProjectStatusFilter("active")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                projectStatusFilter === "active"
                  ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>⚡ Active</span>
            </button>
            <button
              onClick={() => setProjectStatusFilter("paused")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                projectStatusFilter === "paused"
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>⏸ On Hold</span>
              {holdProjectsCount > 0 && (
                <span className="px-1 py-0.2 rounded font-mono text-[9px] bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  {holdProjectsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setProjectStatusFilter("completed");
                setShowClosedProjects(true);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                projectStatusFilter === "completed"
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>📦 Archived</span>
            </button>
          </div>

          <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

          {/* Category Chips */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                categoryFilter === "all"
                  ? "bg-primary/10 text-primary border border-primary/25 font-semibold"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              All Categories
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  categoryFilter === cat
                    ? "bg-primary/10 text-primary border border-primary/25 font-semibold"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Cards Grid */}
      {overviewProjects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border">
          <Layers size={36} className="text-muted-foreground mb-3 opacity-60 mx-auto" />
          <h3 className="text-base font-bold text-foreground">No projects found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Create your first initiative to start organizing roadmap deliverables.
          </p>
          <button
            onClick={onOpenNewProjectModal}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white"
          >
            + Create Project
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {overviewProjects.map((proj) => {
            const projectTasks = tasks.filter((t) => t.projectId === proj.id);
            const totalCount = projectTasks.length;
            const completedCount = projectTasks.filter((t) => t.status === "done").length;
            const pendingCount = projectTasks.filter((t) => t.status !== "done").length;
            const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const isCompleted = proj.status === "completed";

            // Team roster lookup
            const joinedMembers = (proj.teamMemberEmails || [])
              .map((email) => teamMembers.find((m) => m.email.toLowerCase() === email.toLowerCase()))
              .filter(Boolean);

            return (
              <div
                key={proj.id}
                draggable
                onDragStart={(e) => {
                  if (!projectDragFromHandle.current) {
                    e.preventDefault();
                    return;
                  }
                  setDraggedProjectId(proj.id);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", proj.id);
                }}
                onDragEnd={() => {
                  projectDragFromHandle.current = false;
                  setDraggedProjectId(null);
                  setDragOverProjectId(null);
                  setProjectDropPosition(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!draggedProjectId || draggedProjectId === proj.id) return;
                  e.dataTransfer.dropEffect = "move";
                  const rect = e.currentTarget.getBoundingClientRect();
                  const midY = rect.top + rect.height / 2;
                  const isAbove = e.clientY < midY;
                  const pos = isAbove ? "before" : "after";
                  if (dragOverProjectId !== proj.id || projectDropPosition !== pos) {
                    setDragOverProjectId(proj.id);
                    setProjectDropPosition(pos);
                  }
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    if (dragOverProjectId === proj.id) {
                      setDragOverProjectId(null);
                      setProjectDropPosition(null);
                    }
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!draggedProjectId || draggedProjectId === proj.id) return;
                  reorderProjects(draggedProjectId, proj.id, projectDropPosition || "before");
                  projectDragFromHandle.current = false;
                  setDraggedProjectId(null);
                  setDragOverProjectId(null);
                  setProjectDropPosition(null);
                }}
                onClick={() => {
                  if (draggedProjectId) return;
                  setSelectedProjectId(proj.id);
                }}
                className={`group relative flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 sm:p-4.5 rounded-2xl bg-card border shadow-2xs transition-all duration-200 cursor-pointer overflow-hidden ${
                  draggedProjectId === proj.id
                    ? "opacity-30 scale-[0.99] border-dashed border-primary"
                    : dragOverProjectId === proj.id
                    ? projectDropPosition === "before"
                      ? "border-primary shadow-sm ring-2 ring-primary/30 -translate-y-0.5"
                      : "border-primary shadow-sm ring-2 ring-primary/30 translate-y-0.5"
                    : "border-border/80 hover:border-primary/40 hover:shadow-xs"
                }`}
              >
                {/* Drop indicator bar on top */}
                {dragOverProjectId === proj.id && projectDropPosition === "before" && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-600 rounded-t-2xl z-20 animate-pulse" />
                )}
                {/* Drop indicator bar on bottom */}
                {dragOverProjectId === proj.id && projectDropPosition === "after" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-600 rounded-b-2xl z-20 animate-pulse" />
                )}

                {/* Left region: 9-Dot Drag Handle + Main info */}
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  {/* 9-Dot Drag Handle */}
                  <div
                    data-drag-handle="true"
                    draggable={false}
                    onMouseDown={() => {
                      projectDragFromHandle.current = true;
                    }}
                    onMouseUp={() => {
                      projectDragFromHandle.current = false;
                    }}
                    onTouchStart={() => {
                      projectDragFromHandle.current = true;
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground/30 hover:text-foreground hover:bg-muted/80 cursor-grab active:cursor-grabbing transition-all shrink-0 self-start sm:self-center select-none"
                    title="Hold and drag to reorder"
                    aria-label="Reorder project"
                  >
                    <Grip size={15} />
                  </div>

                  {/* Main Content Block */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Category, Status & Lead badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: proj.color || "#4f6ef7" }}
                      />

                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-muted text-muted-foreground border border-border/60">
                        {proj.category}
                      </span>

                      {proj.status === "paused" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Pause size={10} className="fill-current" />
                          <span>On Hold</span>
                        </span>
                      ) : isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
                          <span>Closed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Active</span>
                        </span>
                      )}

                      {/* Lead Info */}
                      <div className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <User size={11} className="text-muted-foreground/70" />
                        <span>Lead: <strong className="text-foreground font-semibold">{proj.lead}</strong></span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-sm sm:text-base font-heading font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                        <span>{proj.name}</span>
                        <ChevronRight size={15} className="text-muted-foreground/40 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </h3>
                      {proj.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 font-normal leading-normal">
                          {proj.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right info: Team Collaborators & Task Progress Bar & Action Buttons */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 xl:gap-6 shrink-0 pt-2 xl:pt-0">
                  {/* Collaborators Stack */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center -space-x-1.5">
                      {joinedMembers.length === 0 ? (
                        <span className="text-[10px] text-muted-foreground italic">No extra members</span>
                      ) : (
                        joinedMembers.slice(0, 3).map((m) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={m?.id}
                            src={m?.avatar || "/founder.jpg"}
                            alt={m?.name}
                            title={`${m?.name} (${m?.role})`}
                            className="w-6 h-6 rounded-full object-cover border-2 border-card ring-1 ring-border shadow-2xs"
                          />
                        ))
                      )}
                      {joinedMembers.length > 3 && (
                        <span className="w-6 h-6 rounded-full bg-muted text-[10px] font-mono font-semibold text-muted-foreground flex items-center justify-center border-2 border-card">
                          +{joinedMembers.length - 3}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInviteModalProject(proj);
                      }}
                      className="text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors"
                      title="Invite collaborators"
                    >
                      + Invite
                    </button>
                  </div>

                  {/* Compact Progress Bar */}
                  <div className="min-w-[130px] space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-muted-foreground">
                        {completedCount}/{totalCount} tasks
                      </span>
                      <span className="font-semibold text-foreground">{progress}%</span>
                    </div>
                    <div className="w-full bg-muted/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: proj.color || "#4f6ef7",
                        }}
                      />
                    </div>
                  </div>

                  {/* Right Action Block */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProjectId(proj.id);
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-primary bg-primary/10 hover:bg-primary hover:text-white border border-primary/20 transition-all flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>Workspace</span>
                      <ArrowRight size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEditProjectModal(proj);
                      }}
                      className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-all"
                      title="Edit Project"
                    >
                      <Edit size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete project "${proj.name}"?`)) deleteProject(proj.id);
                      }}
                      className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-red-500 hover:bg-red-500/10 transition-all"
                      title="Delete Project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invite Teammate Modal */}
      <InviteTeammateModal
        isOpen={!!inviteModalProject}
        onClose={() => setInviteModalProject(null)}
        project={inviteModalProject}
      />

      {/* Task Slide-Over Drawer ("Task Slider") */}
      <TaskSlideOverDrawer
        taskId={activeDrawerTaskId}
        onClose={() => setActiveDrawerTaskId(null)}
        onOpenEditModal={(task) => onOpenEditTaskModal(task)}
      />
    </div>
  );
};

/**
 * ============================================================================
 * FOOTER BLOCK: components/OngoingProjectsView.tsx Implementation Notes
 * ============================================================================
 * - Workflow: Two-tier architecture with clean Landing Hub cards & full workspace.
 * - Task Slider: Interactive right slide-over drawer for viewing/editing tasks & subtasks.
 * - 9-Dot Task Reorder: Vertical drag-and-drop on tasks with priority rank re-sequencing.
 * - Project Hold: Auto-hold rule enforces single active project with dedicated filter tabs.
 * - Navigation: setSelectedProjectId(null) returns to Hub; continue button opens workspace.
 * - Views: Tree, Kanban, and Table modes isolated per project workspace.
 * ============================================================================
 */
