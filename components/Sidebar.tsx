/**
 * ============================================================================
 * HEADER BLOCK: components/Sidebar.tsx — Workspace Navigation & Projects List
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Provides the primary sidebar navigation menu:
 * - Switches between categories: Major & Minor Tasks, New Upcoming Features, Fix & Updates, Overview.
 * - Displays active counters for each section.
 * - Houses the Major Tasks Quick-List with active status dots and "+ New Major Task" trigger.
 * - Displays active team members presence list.
 *
 * WHY THIS FILE EXISTS:
 * Gives users 1-click access to specific tasks and product categories.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Interacts directly with useTaskStore to switch tabs and select active projects.
 * ============================================================================
 */

"use client";

import React from "react";
import Link from "next/link";
import {
  FolderKanban,
  Lightbulb,
  Wrench,
  BarChart3,
  Plus,
  Send,
  Globe,
  Cpu,
  Pin,
  ChevronRight,
  Sparkles,
  Users,
  Shield,
  Layers,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { ActiveTab } from "@/lib/types";

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenNewProjectModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile,
  onCloseMobile,
  onOpenNewProjectModal,
}) => {
  const {
    currentUser,
    logout,
    activeTab,
    setActiveTab,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    stats,
    teamMembers,
    tasks,
  } = useTaskStore();

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; badge: number; color: string }[] = [
    {
      id: "projects",
      label: "Ongoing Projects",
      icon: Layers,
      badge: stats.totalTasks,
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      id: "features",
      label: "Upcoming Features",
      icon: Lightbulb,
      badge: stats.totalFeatures,
      color: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      id: "fixes",
      label: "Fix & Updates",
      icon: Wrench,
      badge: stats.criticalFixesCount > 0 ? stats.criticalFixesCount : stats.totalFeatures,
      color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      id: "overview",
      label: "Team Overview",
      icon: BarChart3,
      badge: stats.totalProjects,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveTab("projects");
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-[61px] left-0 z-40 w-64 h-full lg:h-[calc(100vh-61px)] flex flex-col justify-between p-4 bg-sidebar border-r border-sidebar-border shadow-xs transition-transform duration-300 ease-in-out ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col gap-6 overflow-y-auto pr-1">
          {/* Main Navigation Tabs */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Workspace Categories
            </div>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} className={isActive ? "text-white" : "text-muted-foreground"} />
                      <span>{item.label}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Projects Quick List */}
          <div>
            <div className="flex items-center justify-between px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>Projects</span>
              <button
                onClick={onOpenNewProjectModal}
                className="p-1 rounded-md text-primary hover:bg-primary/10 transition-colors"
                title="Create New Project"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              {projects.filter((p) => p.status !== "completed").length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted-foreground/70 italic">
                  No active projects
                </div>
              ) : (
                projects
                  .filter((p) => p.status !== "completed")
                  .map((proj) => {
                    const isSelected = activeTab === "projects" && selectedProjectId === proj.id;
                    const projectTasks = tasks.filter((t) => t.projectId === proj.id);
                    const projectTaskCount = projectTasks.length;
                    const urgentCount = projectTasks.filter(
                      (t) => t.priority === "P0" && t.status !== "done"
                    ).length;

                    return (
                      <button
                        key={proj.id}
                        onClick={() => handleSelectProject(proj.id)}
                        className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs text-left transition-all group ${
                          isSelected
                            ? "bg-sidebar-accent border border-primary/20 text-foreground font-semibold shadow-xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: proj.color || "#3b5bfa" }}
                          />
                          <span className="truncate">{proj.name}</span>
                          {proj.status === "paused" && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0 border border-amber-500/20">
                              Hold
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {urgentCount > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                          )}
                          <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground">
                            {projectTaskCount}
                          </span>
                        </div>
                      </button>
                    );
                  })
              )}
            </div>
          </div>

          {/* Proaffiliaters Team Members */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Active Team</span>
              <Link
                href="/admin"
                className="flex items-center gap-1 text-[10px] text-primary hover:underline font-bold"
                title="Open /admin route to manage roles & team accounts"
              >
                Manage Roles →
              </Link>
            </div>

            <div className="flex flex-col gap-1.5 px-1">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-6 h-6 rounded-full object-cover border border-border shadow-xs"
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-foreground truncate">{member.name}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{member.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Admin Link & Brand Tag */}
        <div className="pt-3 border-t border-sidebar-border mt-auto flex flex-col gap-2">
          <Link
            href="/admin"
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/15 border border-primary/20 text-xs text-primary font-bold transition-all group shadow-xs"
            title="Open dedicated /admin route"
          >
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-primary" />
              <span>Admin Portal</span>
            </div>
            <span className="text-[10px] font-mono opacity-70 group-hover:translate-x-0.5 transition-transform">
              /admin →
            </span>
          </Link>

          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-sidebar-accent border border-sidebar-border text-[11px] text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="truncate">Port 3050 • Proaffiliaters Corp</span>
          </div>
        </div>
      </aside>
    </>
  );
};

/**
 * ============================================================================
 * FOOTER BLOCK: components/Sidebar.tsx Implementation Notes & Caveats
 * ============================================================================
 * - Workflow: Operates as persistent column on desktop, sliding drawer on mobile.
 * - Caveat: Selecting a project automatically switches activeTab to 'projects'.
 * ============================================================================
 */
