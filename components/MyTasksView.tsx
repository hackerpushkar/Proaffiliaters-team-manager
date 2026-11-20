/**
 * ============================================================================
 * HEADER BLOCK: components/MyTasksView.tsx — Personal Tasks & To-Do Workspace
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Implements the dedicated "My Tasks" personal productivity workspace:
 * - Strictly isolates personal tasks manually added by the user
 * - Excludes Ongoing Projects deliverables per user specification
 * - Eyebrow "PERSONAL WORKSPACE" heading with instant "+ New task" trigger
 * - 4-Column Summary KPI bar: Due today, In progress, Upcoming, Completed
 * - Segmented toolbar: Active, Due Today, Completed, and All personal tasks
 * - Interactive task list with circular completion checkbox (strikethrough when done)
 * - Priority pills (P0 Urgent, P1 High, P2 Normal, P3 Low)
 * - Due dates with "Today" / overdue highlighting
 * - Edit & Delete action controls for full personal control
 *
 * WHY THIS FILE EXISTS:
 * Fulfills user request: "and in my tasks dont include projects task - in my task
 * i can add my task manually".
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Reads and mutates personal tasks in useTaskStore with persistent MongoDB and
 * LocalStorage syncing.
 * ============================================================================
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Check,
  Plus,
  Calendar,
  AlertCircle,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { ProjectTask } from "@/lib/types";
import { PersonalTaskModal } from "@/components/PersonalTaskModal";

interface MyTasksViewProps {
  onOpenAddTaskModal?: () => void;
  onOpenEditTaskModal?: (task: ProjectTask) => void;
  onSelectTaskForPeek?: (taskId: string) => void;
}

export const MyTasksView: React.FC<MyTasksViewProps> = ({
  onSelectTaskForPeek,
}) => {
  const { tasks, moveTaskStatus, deleteTask, searchQuery } = useTaskStore();

  const [activeSegment, setActiveSegment] = useState<
    "active" | "today" | "completed" | "all"
  >("active");

  const [personalModalOpen, setPersonalModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<ProjectTask | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Filter ONLY personal tasks (strictly exclude project tasks)
  const personalTasks = useMemo(() => {
    return (tasks || []).filter(
      (task) => task.isPersonal === true || task.projectId === "personal"
    );
  }, [tasks]);

  // Filter tasks based on selected segment & search query
  const displayedTasks = useMemo(() => {
    return personalTasks.filter((task) => {
      // Search query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = task.name.toLowerCase().includes(q);
        const matchesDesc = (task.description || "").toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      if (activeSegment === "completed") {
        return task.status === "done";
      }

      if (activeSegment === "today") {
        return (
          task.status !== "done" &&
          task.dueDate &&
          task.dueDate.startsWith(todayStr)
        );
      }

      if (activeSegment === "active") {
        return task.status !== "done";
      }

      // 'all' personal tasks
      return true;
    });
  }, [personalTasks, activeSegment, searchQuery, todayStr]);

  // KPI Metrics calculated strictly from personal tasks
  const dueTodayCount = useMemo(() => {
    return personalTasks.filter(
      (t) => t.dueDate && t.dueDate.startsWith(todayStr) && t.status !== "done"
    ).length;
  }, [personalTasks, todayStr]);

  const inProgressCount = useMemo(() => {
    return personalTasks.filter((t) => t.status === "in_progress").length;
  }, [personalTasks]);

  const upcomingCount = useMemo(() => {
    return personalTasks.filter(
      (t) => (t.status === "todo" || t.status === "backlog") && (!t.dueDate || t.dueDate > todayStr)
    ).length;
  }, [personalTasks, todayStr]);

  const completedCount = useMemo(() => {
    return personalTasks.filter((t) => t.status === "done").length;
  }, [personalTasks]);

  const handleToggleDone = (task: ProjectTask, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = task.status === "done" ? "todo" : "done";
    moveTaskStatus(task.id, nextStatus);
  };

  const handleDeleteTask = (task: ProjectTask, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete personal task "${task.name}"?`)) {
      deleteTask(task.id);
    }
  };

  const handleOpenAdd = () => {
    setTaskToEdit(null);
    setPersonalModalOpen(true);
  };

  const handleOpenEdit = (task: ProjectTask, e: React.MouseEvent) => {
    e.stopPropagation();
    setTaskToEdit(task);
    setPersonalModalOpen(true);
  };

  const getPriorityPill = (priority: string) => {
    switch (priority) {
      case "P0":
        return <span className="pill pill-red">Urgent</span>;
      case "P1":
        return <span className="pill pill-amber">High</span>;
      case "P2":
        return <span className="pill pill-blue">Normal</span>;
      default:
        return <span className="pill">Low</span>;
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-[1600px] pb-12">
      {/* Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-extrabold text-[25px] tracking-[-0.8px] text-foreground leading-tight">
              My Tasks
            </h1>
            <span className="eyebrow-tag">PERSONAL WORKSPACE</span>
          </div>
          <p className="text-[12px] text-muted-foreground mt-1">
            Your private personal task list. Add your own to-dos and action items manually.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="h-[38px] px-4 rounded-[10px] bg-primary hover:bg-[#3d50df] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-[0_5px_13px_rgba(82,104,246,0.25)] transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>New task</span>
          </button>
        </div>
      </div>

      {/* Task Summary KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 bg-card border border-border rounded-[13px] overflow-hidden shadow-xs">
        <div className="p-4 sm:p-[16px_20px] border-r border-border flex items-baseline gap-2">
          <span className="text-[10px] text-muted-foreground font-medium">Due today</span>
          <b className="font-heading font-extrabold text-[19px] text-[#e44c57] leading-none">
            {dueTodayCount}
          </b>
        </div>
        <div className="p-4 sm:p-[16px_20px] sm:border-r border-border flex items-baseline gap-2">
          <span className="text-[10px] text-muted-foreground font-medium">In progress</span>
          <b className="font-heading font-extrabold text-[19px] text-primary leading-none">
            {inProgressCount}
          </b>
        </div>
        <div className="p-4 sm:p-[16px_20px] border-r border-border border-t sm:border-t-0 flex items-baseline gap-2">
          <span className="text-[10px] text-muted-foreground font-medium">Upcoming</span>
          <b className="font-heading font-extrabold text-[19px] text-primary leading-none">
            {upcomingCount}
          </b>
        </div>
        <div className="p-4 sm:p-[16px_20px] border-t sm:border-t-0 flex items-baseline gap-2">
          <span className="text-[10px] text-muted-foreground font-medium">Completed</span>
          <b className="font-heading font-extrabold text-[19px] text-[#0da77c] leading-none">
            {completedCount}
          </b>
        </div>
      </div>

      {/* Toolbar Segmented Controls */}
      <div className="min-h-[54px] bg-card border border-border rounded-[13px] p-[7px_10px] flex items-center justify-between gap-3 flex-wrap shadow-xs">
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveSegment("active")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeSegment === "active"
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Active Tasks ({personalTasks.filter((t) => t.status !== "done").length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSegment("today")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeSegment === "today"
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Due Today ({dueTodayCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveSegment("completed")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeSegment === "completed"
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveSegment("all")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeSegment === "all"
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Personal ({personalTasks.length})
          </button>
        </div>

        <div className="text-[11px] text-muted-foreground font-medium px-2">
          Showing <b>{displayedTasks.length}</b> personal {displayedTasks.length === 1 ? "task" : "tasks"}
        </div>
      </div>

      {/* Task List Panel */}
      <div className="bg-card border border-border rounded-[14px] overflow-hidden shadow-xs">
        {/* Table Header */}
        <div className="grid grid-cols-[36px_minmax(260px,1fr)_120px_100px_110px_70px] gap-2.5 items-center p-[12px_16px] bg-[#f9fafc] dark:bg-muted/40 text-[#949cab] text-[9px] font-extrabold uppercase tracking-[0.6px]">
          <span />
          <span>PERSONAL TASK</span>
          <span>STATUS</span>
          <span>PRIORITY</span>
          <span>DUE DATE</span>
          <span className="text-right">ACTIONS</span>
        </div>

        {/* Task Rows */}
        {displayedTasks.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            <CheckCircle2 size={32} className="mx-auto text-muted-foreground/40 mb-2" />
            <p className="font-bold text-foreground">No personal tasks in this view</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Click &quot;+ New task&quot; to add your own to-do items.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-3 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all inline-flex items-center gap-1"
            >
              <Plus size={13} />
              <span>Add Personal Task</span>
            </button>
          </div>
        ) : (
          displayedTasks.map((t) => {
            const isCompleted = t.status === "done";
            const isDueToday = t.dueDate && t.dueDate.startsWith(todayStr);
            const isOverdue = t.dueDate && t.dueDate < todayStr && !isCompleted;
            const subtaskCount = t.subtasks?.length || 0;
            const completedSubtasks = t.subtasks?.filter((s) => s.completed).length || 0;

            return (
              <div
                key={t.id}
                onClick={() => onSelectTaskForPeek && onSelectTaskForPeek(t.id)}
                className={`grid grid-cols-[36px_minmax(260px,1fr)_120px_100px_110px_70px] gap-2.5 items-center p-[13px_16px] border-t border-border hover:bg-[#fafbff] dark:hover:bg-muted/30 transition-colors cursor-pointer group ${
                  isCompleted ? "opacity-60 bg-muted/20" : ""
                }`}
              >
                {/* Circular Checkbox */}
                <button
                  type="button"
                  onClick={(e) => handleToggleDone(t, e)}
                  className={`w-[20px] h-[20px] rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                    isCompleted
                      ? "bg-[#16b98e] border-[#16b98e] text-white"
                      : "border-[#cbd0db] bg-card hover:border-primary"
                  }`}
                  title={isCompleted ? "Mark as to-do" : "Mark as done"}
                >
                  {isCompleted && <Check size={12} strokeWidth={3} />}
                </button>

                {/* Task Title & Notes */}
                <div className="flex flex-col min-w-0 pr-2">
                  <span
                    className={`font-heading font-bold text-[12px] text-foreground truncate group-hover:text-primary transition-colors ${
                      isCompleted ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {t.name}
                  </span>
                  {t.description ? (
                    <span className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {t.description}
                    </span>
                  ) : subtaskCount > 0 ? (
                    <span className="text-[10px] text-muted-foreground truncate mt-0.5">
                      Checklist: {completedSubtasks}/{subtaskCount} completed
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/60 italic mt-0.5">
                      Personal to-do
                    </span>
                  )}
                </div>

                {/* Status */}
                <div>
                  <span
                    className={`pill ${
                      t.status === "in_progress"
                        ? "pill-blue"
                        : t.status === "review"
                        ? "pill-purple"
                        : t.status === "done"
                        ? "pill-green"
                        : ""
                    }`}
                  >
                    {t.status.replace("_", " ")}
                  </span>
                </div>

                {/* Priority */}
                <div>{getPriorityPill(t.priority)}</div>

                {/* Due Date */}
                <div
                  className={`text-[11px] font-medium flex items-center gap-1 ${
                    isDueToday
                      ? "text-[#e44c57] font-bold"
                      : isOverdue
                      ? "text-red-500 font-bold"
                      : "text-muted-foreground"
                  }`}
                >
                  <Calendar size={12} className="shrink-0" />
                  <span>
                    {isDueToday
                      ? "Today"
                      : isOverdue
                      ? `Overdue (${t.dueDate})`
                      : t.dueDate || "No deadline"}
                  </span>
                </div>

                {/* Actions: Edit & Delete */}
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={(e) => handleOpenEdit(t, e)}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    title="Edit task"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteTask(t, e)}
                    className="p-1 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dedicated Personal Task Modal */}
      <PersonalTaskModal
        isOpen={personalModalOpen}
        onClose={() => setPersonalModalOpen(false)}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};

/**
 * ============================================================================
 * FOOTER BLOCK: components/MyTasksView.tsx Implementation Notes
 * ============================================================================
 * - Workflow: Dedicated to personal tasks; project tasks strictly excluded.
 * - Personal Tasks: Tagged with isPersonal: true and projectId: "personal".
 * - Resiliency: Supports completion toggles, quick due date filters, and deletion.
 * ============================================================================
 */
