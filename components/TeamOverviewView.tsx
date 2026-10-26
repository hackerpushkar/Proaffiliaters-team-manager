/**
 * ============================================================================
 * HEADER BLOCK: components/TeamOverviewView.tsx — Executive Dashboard
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Summarizes the entire Proaffiliaters engineering & product landscape:
 * - High-level KPI metric cards.
 * - Project workload distribution.
 * - Task priority breakdown (P0 Urgent down to P3 Low).
 * - Upcoming feature roadmap pulse.
 * - Active team assignees and responsibilities.
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
  FolderKanban,
  Lightbulb,
  Wrench,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  ChevronRight,
  Shield,
  Zap,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";

interface TeamOverviewViewProps {
  onNavigateToTab: (tab: "features" | "projects" | "fixes") => void;
}

export const TeamOverviewView: React.FC<TeamOverviewViewProps> = ({ onNavigateToTab }) => {
  const { stats, projects, tasks, setSelectedProjectId } = useTaskStore();

  const p0Tasks = tasks.filter((t) => t.priority === "P0" && t.status !== "done");
  const p1Tasks = tasks.filter((t) => t.priority === "P1" && t.status !== "done");
  const p2Tasks = tasks.filter((t) => t.priority === "P2" && t.status !== "done");
  const p3Tasks = tasks.filter((t) => t.priority === "P3" && t.status !== "done");

  const handleOpenProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    onNavigateToTab("projects");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Projects */}
        <div
          onClick={() => onNavigateToTab("projects")}
          className="p-5 rounded-2xl bg-card border border-border shadow-xs hover:shadow-md cursor-pointer hover:border-primary/50 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Ongoing Projects</span>
            <span className="p-2.5 rounded-xl bg-indigo-500/10 text-primary border border-indigo-500/20">
              <FolderKanban size={18} />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-heading font-extrabold text-foreground">
              {stats.totalProjects}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Active engineering pipelines
            </p>
          </div>
        </div>

        {/* Card 2: Urgent P0 Tasks */}
        <div
          onClick={() => onNavigateToTab("projects")}
          className="p-5 rounded-2xl bg-card border border-border shadow-xs hover:shadow-md cursor-pointer hover:border-red-500/50 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Urgent P0 Tasks</span>
            <span className="p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
              <AlertCircle size={18} />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-heading font-extrabold text-red-600 dark:text-red-400">
              {stats.urgentTasksCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Requiring immediate sprint focus
            </p>
          </div>
        </div>

        {/* Card 3: Upcoming Features */}
        <div
          onClick={() => onNavigateToTab("features")}
          className="p-5 rounded-2xl bg-card border border-border shadow-xs hover:shadow-md cursor-pointer hover:border-purple-500/50 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Upcoming Ideas</span>
            <span className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Lightbulb size={18} />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-heading font-extrabold text-purple-600 dark:text-purple-400">
              {stats.totalFeatures}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              In roadmap & community vote
            </p>
          </div>
        </div>

        {/* Card 4: Critical Fixes */}
        <div
          onClick={() => onNavigateToTab("fixes")}
          className="p-5 rounded-2xl bg-card border border-border shadow-xs hover:shadow-md cursor-pointer hover:border-amber-500/50 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Critical Fixes</span>
            <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Zap size={18} />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-heading font-extrabold text-amber-600 dark:text-amber-400">
              {stats.criticalFixesCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Open bug triage tickets
            </p>
          </div>
        </div>
      </div>

      {/* Projects Grid Overview */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-heading font-bold text-foreground">
            Active Projects Status
          </h3>
          <button
            onClick={() => onNavigateToTab("projects")}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>View All Projects</span>
            <ChevronRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => {
            const projTasks = tasks.filter((t) => t.projectId === proj.id);
            const doneCount = projTasks.filter((t) => t.status === "done").length;
            const urgentP0 = projTasks.filter((t) => t.priority === "P0" && t.status !== "done").length;
            const percent = projTasks.length > 0 ? Math.round((doneCount / projTasks.length) * 100) : 0;

            return (
              <div
                key={proj.id}
                onClick={() => handleOpenProject(proj.id)}
                className="p-5 rounded-2xl bg-card border border-border shadow-xs hover:shadow-md cursor-pointer hover:border-primary/50 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: proj.color || "#3b5bfa" }}
                    />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {proj.category}
                    </span>
                  </div>
                  {urgentP0 > 0 && (
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                      {urgentP0} P0 Urgent
                    </span>
                  )}
                </div>

                <h4 className="text-base font-heading font-bold text-foreground">{proj.name}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{proj.description}</p>

                <div className="mt-4 pt-3 border-t border-border flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {doneCount} / {projTasks.length} tasks completed
                    </span>
                    <span className="font-bold text-primary">{percent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Priority Distribution Bar */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-xs">
        <h3 className="text-sm font-heading font-bold text-foreground mb-3">
          Task Backlog Priority Distribution
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20">
            <span className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase">P0 • Urgent</span>
            <div className="text-xl font-bold text-foreground mt-1">{p0Tasks.length}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase">P1 • High</span>
            <div className="text-xl font-bold text-foreground mt-1">{p1Tasks.length}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">P2 • Normal</span>
            <div className="text-xl font-bold text-foreground mt-1">{p2Tasks.length}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-500/10 border border-slate-500/20">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">P3 • Low</span>
            <div className="text-xl font-bold text-foreground mt-1">{p3Tasks.length}</div>
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
 * - Workflow: Computes overall metrics and provides quick navigation to tabs.
 * ============================================================================
 */
