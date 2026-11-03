/**
 * ============================================================================
 * HEADER BLOCK: components/Sidebar.tsx — Workspace Navigation & Projects List
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Provides the primary sidebar navigation menu:
 * - Switches between categories: Ongoing Projects, Upcoming Features, Fix & Updates, Team Overview.
 * - Displays refined monospace counters for each section.
 * - Houses the Ongoing Projects Quick-List with active status dots and "+ New Project" trigger.
 * - Displays active team members presence list.
 *
 * WHY THIS FILE EXISTS:
 * Gives users 1-click access to specific tasks and product categories with a
 * modern, lightweight, developer-first layout (Linear/Vercel standard).
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Interacts directly with useTaskStore to switch tabs and select active projects.
 * ============================================================================
 */

"use client";

import React from "react";
import Link from "next/link";
import {
  Lightbulb,
  Wrench,
  BarChart3,
  Plus,
  Layers,
  Shield,
  ChevronRight,
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
    activeTab,
    setActiveTab,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    stats,
    teamMembers,
    tasks,
    fixes,
  } = useTaskStore();

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; badge: number }[] = [
    {
      id: "projects",
      label: "Ongoing Projects",
      icon: Layers,
      badge: projects.filter((p) => p.status !== "completed").length,
    },
    {
      id: "features",
      label: "Upcoming Features",
      icon: Lightbulb,
      badge: stats.totalFeatures,
    },
    {
      id: "fixes",
      label: "Fix & Updates",
      icon: Wrench,
      badge: (fixes || []).filter((f) => f.status !== "deployed").length,
    },
    {
      id: "overview",
      label: "Team Overview",
      icon: BarChart3,
      badge: teamMembers.length,
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
        className={`fixed lg:sticky top-0 lg:top-[61px] left-0 z-40 w-64 h-full lg:h-[calc(100vh-61px)] flex flex-col justify-between p-3.5 bg-sidebar border-r border-sidebar-border shadow-2xs transition-transform duration-300 ease-in-out ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col gap-5 overflow-y-auto pr-1">
          {/* Main Navigation Tabs */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
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
                    className={`group flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/25 font-bold shadow-2xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/70 border border-transparent font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        size={16}
                        className={`transition-colors ${
                          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono rounded-md font-bold transition-colors ${
                        isActive
                          ? "bg-primary text-white shadow-2xs"
                          : "bg-muted text-muted-foreground group-hover:text-foreground"
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
            <div className="flex items-center justify-between px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
              <span>Active Projects</span>
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
                            ? "bg-primary/10 border border-primary/25 text-primary font-bold shadow-2xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60 border border-transparent font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: proj.color || "#3b5bfa" }}
                          />
                          <span className="truncate">{proj.name}</span>
                          {proj.status === "paused" && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0 border border-amber-500/25">
                              Hold
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {urgentCount > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                          )}
                          <span className="text-[10px] font-mono text-muted-foreground group-hover:text-foreground">
                            {projectTaskCount}
                          </span>
                        </div>
                      </button>
                    );
                  })
              )}
            </div>
          </div>

          {/* Active Team Members */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center justify-between">
              <span>Active Team</span>
              <Link
                href="/admin"
                className="flex items-center gap-1 text-[10px] text-primary hover:underline font-semibold"
                title="Open /admin route to manage roles & team accounts"
              >
                Roles →
              </Link>
            </div>

            <div className="flex flex-col gap-1 px-1">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-sidebar-accent/60 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={member.avatar || "/founder.jpg"}
                      alt={member.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/founder.jpg";
                      }}
                      className="w-5.5 h-5.5 rounded-full object-cover border border-border shadow-2xs shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-foreground truncate">{member.name}</p>
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
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-card hover:bg-muted/70 border border-border text-xs text-foreground font-semibold transition-all group shadow-2xs"
            title="Open dedicated /admin route"
          >
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-primary" />
              <span>Admin Portal</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all">
              /admin →
            </span>
          </Link>

          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-sidebar-accent/50 border border-sidebar-border text-[10px] text-muted-foreground">
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
 * - Presentation: Styled with refined Linear/Vercel quiet active states.
 * ============================================================================
 */
