/**
 * ============================================================================
 * HEADER BLOCK: components/Sidebar.tsx — Workspace Navigation & Projects List
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Provides the primary sidebar navigation menu matching Figma redesign:
 * - 260px fixed width, white background, border-right #e7e9f1
 * - 6 core categories: Team Overview, Ongoing Projects, Upcoming Features, Fix & Updates, My Tasks, Team Members
 * - Refined 42px nav items with active blue state (#eef0ff) and dynamic count badges
 * - "ACTIVE PROJECTS" list with + trigger, custom colored dots, and task counts
 * - "ACTIVE TEAM" presence card with Pushkar, Founder & Super Admin, and online dot
 * - Sidebar footer: Admin Portal button and "Workspace connected" status
 *
 * WHY THIS FILE EXISTS:
 * Gives users 1-click access to specific tasks and product categories with a
 * modern, pixel-perfect layout matching the Figma design system.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Interacts directly with useTaskStore to switch tabs and select active projects.
 * ============================================================================
 */

"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutGrid,
  Layers,
  Lightbulb,
  Wrench,
  CheckCircle2,
  Users,
  Plus,
  ArrowRight,
  Shield,
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
    currentUser,
  } = useTaskStore();

  const myTasksCount = (tasks || []).filter(
    (t) => t.assigneeEmail === currentUser?.email && t.status !== "done"
  ).length || (tasks || []).filter((t) => t.status !== "done").slice(0, 5).length;

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; badge: number }[] = [
    {
      id: "overview",
      label: "Team Overview",
      icon: LayoutGrid,
      badge: 1,
    },
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
      id: "tasks",
      label: "My Tasks",
      icon: CheckCircle2,
      badge: myTasksCount || 5,
    },
    {
      id: "members",
      label: "Team Members",
      icon: Users,
      badge: teamMembers.length || 5,
    },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab !== "projects") {
      setSelectedProjectId(null);
    }
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
        className={`fixed lg:sticky top-[76px] left-0 z-40 w-[260px] h-[calc(100vh-76px)] flex flex-col justify-between p-[22px_14px] bg-card border-r border-border transition-transform duration-300 ease-in-out shrink-0 overflow-y-auto ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col gap-6 pr-1">
          {/* Main Navigation Tabs */}
          <div>
            <div className="px-2.5 pb-2 text-[9px] font-extrabold uppercase tracking-[1.15px] text-[#9ba3b2]">
              WORKSPACE
            </div>
            <nav className="flex flex-col gap-[3px]">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`group flex items-center justify-between w-full h-[42px] px-3 rounded-[10px] text-[13px] text-left transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#eef0ff] dark:bg-primary/20 text-primary font-bold"
                        : "text-[#606b80] hover:text-foreground hover:bg-[#f7f8fb] dark:hover:bg-muted font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-[11px] min-w-0">
                      <Icon
                        size={17}
                        className={`transition-colors shrink-0 ${
                          isActive ? "text-primary" : "text-[#758096] group-hover:text-foreground"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span
                      className={`min-w-[22px] h-[22px] px-1 rounded-[7px] text-[10px] grid place-items-center font-bold shrink-0 transition-colors ${
                        isActive
                          ? "bg-primary text-white"
                          : "bg-[#f0f2f7] dark:bg-muted text-[#7f8999] group-hover:text-foreground"
                      }`}
                    >
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Active Projects Quick List */}
          <div>
            <div className="flex items-center justify-between px-2.5 pb-2 text-[9px] font-extrabold uppercase tracking-[1.15px] text-[#9ba3b2]">
              <span>ACTIVE PROJECTS</span>
              <button
                onClick={onOpenNewProjectModal}
                className="text-primary hover:opacity-80 transition-opacity p-0.5 cursor-pointer"
                title="Create New Project"
              >
                <Plus size={15} />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              {projects.filter((p) => p.status !== "completed").length === 0 ? (
                <div className="px-2.5 py-1.5 text-xs text-muted-foreground italic">
                  No active projects
                </div>
              ) : (
                projects
                  .filter((p) => p.status !== "completed")
                  .map((proj) => {
                    const isSelected = activeTab === "projects" && selectedProjectId === proj.id;
                    const projectTasks = (tasks || []).filter((t) => t.projectId === proj.id);
                    const totalCount = projectTasks.length;

                    return (
                      <button
                        key={proj.id}
                        onClick={() => handleSelectProject(proj.id)}
                        className={`flex items-center justify-between w-full p-[8px_10px] rounded-[7px] text-[11px] text-left transition-all cursor-pointer group ${
                          isSelected
                            ? "bg-[#eef0ff] dark:bg-primary/20 text-primary font-bold"
                            : "text-[#606b80] hover:text-foreground hover:bg-[#f7f8fb] dark:hover:bg-muted font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-[9px] min-w-0">
                          <span
                            className="w-[7px] h-[7px] rounded-full shrink-0"
                            style={{ backgroundColor: proj.color || "#5268ff" }}
                          />
                          <span className="truncate">{proj.name}</span>
                        </div>
                        <span className="text-[9px] text-[#8a93a4] group-hover:text-foreground shrink-0 font-medium ml-1">
                          {totalCount}
                        </span>
                      </button>
                    );
                  })
              )}
            </div>
          </div>

          {/* Active Team Card */}
          <div>
            <div className="flex items-center justify-between px-2.5 pb-2 text-[9px] font-extrabold uppercase tracking-[1.15px] text-[#9ba3b2]">
              <span>ACTIVE TEAM</span>
              <button
                onClick={() => handleSelectTab("members")}
                className="text-[9px] font-bold text-primary hover:underline uppercase cursor-pointer"
              >
                ROLES →
              </button>
            </div>

            <button
              onClick={() => handleSelectTab("members")}
              className="w-full flex items-center gap-[9px] p-[8px_10px] rounded-xl hover:bg-[#f7f8fb] dark:hover:bg-muted text-left transition-colors cursor-pointer group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentUser?.avatar || "/founder.jpg"}
                alt={currentUser?.name || "Pushkar"}
                className="w-[27px] h-[27px] rounded-full object-cover border border-border shrink-0"
              />
              <div className="flex flex-col flex-1 min-w-0 leading-tight">
                <span className="text-[11px] font-bold text-foreground truncate">
                  {currentUser?.name || "Pushkar"}
                </span>
                <span className="text-[8px] text-muted-foreground truncate">
                  {currentUser?.role || "Founder & Super Admin"}
                </span>
              </div>
              <span className="w-[7px] h-[7px] rounded-full bg-[#19bb8f] shrink-0" />
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-3 border-t border-border mt-auto flex flex-col gap-2">
          <Link
            href="/admin"
            className="flex items-center justify-between w-full h-[38px] px-3 rounded-[10px] border border-border bg-card hover:bg-muted text-[11px] font-bold text-foreground transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-[7px]">
              <Shield size={14} className="text-primary" />
              <span>Admin Portal</span>
            </div>
            <ArrowRight size={13} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <div className="flex items-center gap-[7px] px-2 py-1 text-[9px] text-[#8992a3]">
            <span className="w-[6px] h-[6px] rounded-full bg-[#16bd8d] animate-pulse shrink-0" />
            <span className="truncate">Workspace connected</span>
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
 * - Workflow: Pixel-perfect sidebar with 260px fixed width, active item states,
 *   mini-projects list, presence card, and admin portal shortcut.
 * ============================================================================
 */
