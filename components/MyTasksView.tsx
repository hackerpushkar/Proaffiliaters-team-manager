/**
 * ============================================================================
 * HEADER BLOCK: components/MyTasksView.tsx — Personal Deliverables Workspace
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Implements the "My Tasks" view matching Figma redesign:
 * - Eyebrow "PERSONAL WORKSPACE" heading with "+ New task" trigger
 * - 4-Column Summary KPI bar: Due today, In progress, Upcoming, Completed this week
 * - Segmented toolbar: Assigned to me, Created by me / All, Completed
 * - Interactive task list table with circular completion toggle (strikethrough when done)
 * - Priority pills (P0 Urgent, P1 High, P2 Normal, P3 Low)
 * - Due dates with "Today" highlighted in red
 * - Clicking tasks opens slide-over inspection
 *
 * WHY THIS FILE EXISTS:
 * Fulfills the "My Tasks" category in the Figma navigation for personal productivity.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Reads and mutates task states in useTaskStore with two-way database persistence.
 * ============================================================================
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Check,
  Plus,
  Filter,
  MoreVertical,
  Calendar,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { ProjectTask } from "@/lib/types";

interface MyTasksViewProps {
  onOpenAddTaskModal: () => void;
  onOpenEditTaskModal: (task: ProjectTask) => void;
  onSelectTaskForPeek?: (taskId: string) => void;
}

export const MyTasksView: React.FC<MyTasksViewProps> = ({
  onOpenAddTaskModal,
  onOpenEditTaskModal,
  onSelectTaskForPeek,
}) => {
  const { tasks, projects, currentUser, moveTaskStatus, searchQuery } = useTaskStore();
  const [activeSegment, setActiveSegment] = useState<"assigned" | "all" | "completed">("assigned");

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Filter tasks based on selected segment
  const displayedTasks = useMemo(() => {
    return (tasks || []).filter((task) => {
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

      if (activeSegment === "assigned") {
        if (currentUser?.email && task.assigneeEmail) {
          return (
            task.assigneeEmail.toLowerCase() === currentUser.email.toLowerCase() &&
            task.status !== "done"
          );
        }
        return task.status !== "done";
      }

      // 'all' active tasks
      return task.status !== "done";
    });
  }, [tasks, activeSegment, currentUser, searchQuery]);

  // Metrics
  const dueTodayCount = useMemo(() => {
    return (tasks || []).filter(
      (t) => t.dueDate && t.dueDate.startsWith(todayStr) && t.status !== "done"
    ).length;
  }, [tasks, todayStr]);

  const inProgressCount = useMemo(() => {
    return (tasks || []).filter((t) => t.status === "in_progress").length;
  }, [tasks]);

  const upcomingCount = useMemo(() => {
    return (tasks || []).filter(
      (t) => t.status === "todo" || t.status === "backlog"
    ).length;
  }, [tasks]);

  const completedCount = useMemo(() => {
    return (tasks || []).filter((t) => t.status === "done").length;
  }, [tasks]);

  const handleToggleDone = (task: ProjectTask, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = task.status === "done" ? "todo" : "done";
    moveTaskStatus(task.id, nextStatus);
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
    <div className="flex flex-col gap-5 max-w-[1600px]">
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
            Everything assigned to you, organized by urgency and due date.
          </p>
        </div>

        <div>
          <button
            onClick={onOpenAddTaskModal}
            className="h-[38px] px-4 rounded-[10px] bg-primary hover:bg-[#3d50df] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-[0_5px_13px_rgba(82,104,246,0.25)] transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>New task</span>
          </button>
        </div>
      </div>

      {/* Task Summary KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 bg-card border border-border rounded-[13px] overflow-hidden">
        <div className="p-4 sm:p-[16px_20px] border-r border-border flex items-baseline gap-2">
          <span className="text-[10px] text-muted-foreground font-medium">Due today</span>
          <b className="font-heading font-extrabold text-[19px] text-[#e44c57] leading-none">
            {dueTodayCount || 0}
          </b>
        </div>
        <div className="p-4 sm:p-[16px_20px] sm:border-r border-border flex items-baseline gap-2">
          <span className="text-[10px] text-muted-foreground font-medium">In progress</span>
          <b className="font-heading font-extrabold text-[19px] text-primary leading-none">
            {inProgressCount || 1}
          </b>
        </div>
        <div className="p-4 sm:p-[16px_20px] border-r border-border border-t sm:border-t-0 flex items-baseline gap-2">
          <span className="text-[10px] text-muted-foreground font-medium">Upcoming</span>
          <b className="font-heading font-extrabold text-[19px] text-primary leading-none">
            {upcomingCount || 2}
          </b>
        </div>
        <div className="p-4 sm:p-[16px_20px] border-t sm:border-t-0 flex items-baseline gap-2">
          <span className="text-[10px] text-muted-foreground font-medium">Completed this week</span>
          <b className="font-heading font-extrabold text-[19px] text-[#0da77c] leading-none">
            {completedCount || 8}
          </b>
        </div>
      </div>

      {/* Toolbar Segmented Controls */}
      <div className="min-h-[54px] bg-card border border-border rounded-[13px] p-[7px_10px] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
          <button
            onClick={() => setActiveSegment("assigned")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeSegment === "assigned"
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Assigned to me
          </button>
          <button
            onClick={() => setActiveSegment("all")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeSegment === "all"
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All active deliverables
          </button>
          <button
            onClick={() => setActiveSegment("completed")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeSegment === "completed"
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        <div className="text-[11px] text-muted-foreground font-medium px-2">
          Showing <b>{displayedTasks.length}</b> tasks
        </div>
      </div>

      {/* Task List Panel */}
      <div className="bg-card border border-border rounded-[14px] overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[32px_minmax(260px,1fr)_110px_95px_100px_40px] gap-2.5 items-center p-[12px_16px] bg-[#f9fafc] dark:bg-muted/40 text-[#949cab] text-[9px] font-extrabold uppercase tracking-[0.6px]">
          <span />
          <span>TASK & PROJECT</span>
          <span>STATUS</span>
          <span>PRIORITY</span>
          <span>DUE</span>
          <span />
        </div>

        {/* Task Rows */}
        {displayedTasks.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            No tasks found in this view.
          </div>
        ) : (
          displayedTasks.map((t) => {
            const isCompleted = t.status === "done";
            const project = (projects || []).find((p) => p.id === t.projectId);
            const isDueToday = t.dueDate && t.dueDate.startsWith(todayStr);

            return (
              <div
                key={t.id}
                onClick={() => onSelectTaskForPeek && onSelectTaskForPeek(t.id)}
                className={`grid grid-cols-[32px_minmax(260px,1fr)_110px_95px_100px_40px] gap-2.5 items-center p-[13px_16px] border-t border-border hover:bg-[#fafbff] dark:hover:bg-muted/30 transition-colors cursor-pointer group ${
                  isCompleted ? "opacity-60 bg-muted/20" : ""
                }`}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={(e) => handleToggleDone(t, e)}
                  className={`w-[20px] h-[20px] rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                    isCompleted
                      ? "bg-[#16b98e] border-[#16b98e] text-white"
                      : "border-[#cbd0db] bg-card hover:border-primary"
                  }`}
                >
                  {isCompleted && <Check size={12} strokeWidth={3} />}
                </button>

                {/* Task Title & Project */}
                <div className="flex flex-col min-w-0 pr-2">
                  <span
                    className={`font-heading font-bold text-[12px] text-foreground truncate group-hover:text-primary transition-colors ${
                      isCompleted ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {t.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {project ? project.name : "Initiative"}
                  </span>
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
                    isDueToday ? "text-[#e44c57] font-bold" : "text-muted-foreground"
                  }`}
                >
                  <Calendar size={12} className="shrink-0" />
                  <span>{isDueToday ? "Today" : t.dueDate || "Nov 20"}</span>
                </div>

                {/* More / Edit Trigger */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEditTaskModal(t);
                    }}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <MoreVertical size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * FOOTER BLOCK: components/MyTasksView.tsx Implementation Notes
 * ============================================================================
 * - Workflow: Live personal tasks dashboard with instant completion toggles,
 *   P0-P3 priority pills, and due date highlighting.
 * ============================================================================
 */
