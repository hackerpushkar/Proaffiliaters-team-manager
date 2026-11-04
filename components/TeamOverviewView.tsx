/**
 * ============================================================================
 * HEADER BLOCK: components/TeamOverviewView.tsx — Executive Dashboard
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Summarizes the entire Proaffiliaters engineering & product landscape matching Figma:
 * - 4 high-level KPI metric cards with custom colored stat icons (blue, red, purple, amber)
 * - Active projects status grid (2 columns) with progress bars and fractions
 * - Task priority backlog distribution panel (P0 Urgent down to P3 Low)
 * - 1-Click "Create task" button and navigation jumps
 *
 * WHY THIS FILE EXISTS:
 * Gives founders and team leads an instant 360-degree view of all active work.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Reads aggregated data from useTaskStore; offers 1-click jumps to other views.
 * ============================================================================
 */

"use client";

import React from "react";
import {
  Layers,
  Lightbulb,
  Wrench,
  Flag,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { ActiveTab } from "@/lib/types";

interface TeamOverviewViewProps {
  onNavigateToTab: (tab: ActiveTab) => void;
  onOpenAddTaskModal?: () => void;
}

export const TeamOverviewView: React.FC<TeamOverviewViewProps> = ({
  onNavigateToTab,
  onOpenAddTaskModal,
}) => {
  const { stats, projects, tasks, fixes, features, setSelectedProjectId } = useTaskStore();

  const p0Tasks = (tasks || []).filter((t) => t.priority === "P0" && t.status !== "done");
  const p1Tasks = (tasks || []).filter((t) => t.priority === "P1" && t.status !== "done");
  const p2Tasks = (tasks || []).filter((t) => t.priority === "P2" && t.status !== "done");
  const p3Tasks = (tasks || []).filter((t) => t.priority === "P3" && t.status !== "done");

  const openFixesCount = (fixes || []).filter(
    (f) => f.severity === "critical" && f.status !== "deployed"
  ).length;

  const handleOpenProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    onNavigateToTab("projects");
  };

  const statCards = [
    {
      label: "Ongoing Projects",
      value: projects.filter((p) => p.status !== "completed").length,
      help: "Active engineering pipelines",
      icon: Layers,
      tone: "blue",
      onClick: () => onNavigateToTab("projects"),
    },
    {
      label: "Urgent P0 Tasks",
      value: p0Tasks.length,
      help: "Requiring immediate sprint focus",
      icon: Flag,
      tone: "red",
      onClick: () => onNavigateToTab("projects"),
    },
    {
      label: "Upcoming Ideas",
      value: features.length,
      help: "In roadmap & community vote",
      icon: Lightbulb,
      tone: "purple",
      onClick: () => onNavigateToTab("features"),
    },
    {
      label: "Critical Fixes",
      value: openFixesCount,
      help: "Open bug triage tickets",
      icon: Wrench,
      tone: "amber",
      onClick: () => onNavigateToTab("fixes"),
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[1600px]">
      {/* Figma Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-extrabold text-[25px] tracking-[-0.8px] text-foreground leading-tight">
              Team Overview
            </h1>
            <span className="eyebrow-tag">COMMAND CENTER</span>
          </div>
          <p className="text-[12px] text-muted-foreground mt-1">
            A real-time pulse of projects, priorities, and team momentum.
          </p>
        </div>

        <div>
          <button
            onClick={onOpenAddTaskModal}
            className="h-[38px] px-4 rounded-[10px] bg-primary hover:bg-[#3d50df] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-[0_5px_13px_rgba(82,104,246,0.25)] transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Create task</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              onClick={card.onClick}
              className="h-[154px] bg-card border border-border rounded-[15px] p-[22px] flex flex-col justify-between relative cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all group"
            >
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-[#677389] dark:text-muted-foreground">
                  {card.label}
                </span>
                <strong className="font-heading font-extrabold text-[28px] text-foreground mt-4 leading-none">
                  {card.value}
                </strong>
                <small className="text-[10px] text-[#8a93a3] dark:text-muted-foreground/80 mt-1.5">
                  {card.help}
                </small>
              </div>

              <div className={`stat-icon ${card.tone} absolute right-[18px] top-[18px]`}>
                <Icon size={18} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Projects Status Section */}
      <div className="flex flex-col gap-3 mt-2">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-[17px] text-foreground">
            Active projects status
          </h2>
          <button
            onClick={() => onNavigateToTab("projects")}
            className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View all projects</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {projects
            .filter((p) => p.status !== "completed")
            .map((p) => {
              const projTasks = (tasks || []).filter((t) => t.projectId === p.id);
              const doneCount = projTasks.filter((t) => t.status === "done").length;
              const totalCount = projTasks.length;
              const pc = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

              return (
                <div
                  key={p.id}
                  onClick={() => handleOpenProject(p.id)}
                  className="bg-card border border-border rounded-[14px] p-5 text-left cursor-pointer hover:border-[#cdd3ff] dark:hover:border-primary/50 hover:shadow-[0_8px_25px_rgba(47,56,84,0.06)] transition-all group"
                >
                  <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.7px] text-[#68748a] dark:text-muted-foreground">
                    <span
                      className="w-[7px] h-[7px] rounded-full shrink-0"
                      style={{ backgroundColor: p.color || "#5268ff" }}
                    />
                    <span>{p.category}</span>
                  </div>

                  <h3 className="font-heading font-bold text-[15px] text-foreground mt-2 mb-1 group-hover:text-primary transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-[10px] text-muted-foreground truncate max-w-full">
                    {p.description}
                  </p>

                  <div className="border-t border-border mt-3.5 pt-2.5 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[10px] text-[#6e798d] dark:text-muted-foreground">
                      <span>
                        {doneCount} / {totalCount} tasks completed
                      </span>
                      <b className="text-primary font-bold">{pc}%</b>
                    </div>
                    <div className="h-[5px] rounded-full bg-[#edf0f6] dark:bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${pc}%`,
                          backgroundColor: p.color || "#5268ff",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Task Backlog Priority Distribution Panel */}
      <div className="bg-card border border-border rounded-[14px] p-[18px]">
        <h3 className="font-heading font-bold text-[13px] text-foreground mb-3">
          Task backlog priority distribution
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="priority-box p0">
            <span className="text-[9px] font-bold uppercase tracking-wider">P0 · URGENT</span>
            <b className="font-heading font-bold text-[19px] leading-none">{p0Tasks.length}</b>
          </div>
          <div className="priority-box p1">
            <span className="text-[9px] font-bold uppercase tracking-wider">P1 · HIGH</span>
            <b className="font-heading font-bold text-[19px] leading-none">{p1Tasks.length}</b>
          </div>
          <div className="priority-box p2">
            <span className="text-[9px] font-bold uppercase tracking-wider">P2 · NORMAL</span>
            <b className="font-heading font-bold text-[19px] leading-none">{p2Tasks.length}</b>
          </div>
          <div className="priority-box p3">
            <span className="text-[9px] font-bold uppercase tracking-wider">P3 · LOW</span>
            <b className="font-heading font-bold text-[19px] leading-none">{p3Tasks.length}</b>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * FOOTER BLOCK: components/TeamOverviewView.tsx Implementation Notes
 * ============================================================================
 * - Workflow: Pixel-perfect Figma executive dashboard with 4 KPI cards,
 *   2-column active projects grid, and priority distribution metrics.
 * ============================================================================
 */
