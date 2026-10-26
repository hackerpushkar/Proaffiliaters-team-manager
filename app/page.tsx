/**
 * ============================================================================
 * HEADER BLOCK: app/page.tsx — Main Application Dashboard
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Acts as the master orchestrator for Proaffiliaters Team & Task Manager.
 * Houses the responsive layout (Header, Sidebar, Main Content area) and
 * dynamically switches between:
 * - Category 1: New Upcoming Features (`UpcomingFeaturesView`)
 * - Category 2: Ongoing Projects & Priority Tasks (`OngoingProjectsView`)
 * - Category 3: Fix & Updates (`FixUpdatesView`)
 * - Overview & Metrics (`TeamOverviewView`)
 * Manages modal dialog states for creating and editing tasks, projects,
 * features, and fixes.
 *
 * WHY THIS FILE EXISTS:
 * Serves as the index page route in Next.js App Router.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Interacts with useTaskStore to determine the active tab and handle modal triggers.
 * ============================================================================
 */

"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { UpcomingFeaturesView } from "@/components/UpcomingFeaturesView";
import { OngoingProjectsView } from "@/components/OngoingProjectsView";
import { FixUpdatesView } from "@/components/FixUpdatesView";
import { TeamOverviewView } from "@/components/TeamOverviewView";
import { TaskModal } from "@/components/TaskModal";
import { ProjectModal } from "@/components/ProjectModal";
import { FeatureModal } from "@/components/FeatureModal";
import { FixModal } from "@/components/FixModal";
import { useTaskStore } from "@/lib/store";
import { ProjectTask, OngoingProject, UpcomingFeature, FixUpdate } from "@/lib/types";
import LoginPage from "./login/page";

export default function HomePage() {
  const { currentUser, isLoaded, activeTab, setActiveTab } = useTaskStore();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal States (declared at top level per React Rules of Hooks)
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<ProjectTask | null>(null);
  const [taskDefaultProjectId, setTaskDefaultProjectId] = useState<string | undefined>();

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<OngoingProject | null>(null);

  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [featureToEdit, setFeatureToEdit] = useState<UpcomingFeature | null>(null);

  const [fixModalOpen, setFixModalOpen] = useState(false);
  const [fixToEdit, setFixToEdit] = useState<FixUpdate | null>(null);
  const [fixModalInitialMode, setFixModalInitialMode] = useState<"fix" | "update">("fix");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent default dummy flash during SSR & initial client hydration
  if (!mounted || !isLoaded) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center selection:bg-primary/20">
        <div className="flex flex-col items-center gap-4 animate-fadeIn">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 via-accent/15 to-transparent border border-primary/25 shadow-lg shadow-primary/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Proaffiliaters" className="w-8 h-8 object-contain animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            <span className="text-xs font-semibold text-muted-foreground">Loading workspace...</span>
          </div>
        </div>
      </div>
    );
  }

  // If unauthenticated, display the Employee Login Portal
  if (!currentUser) {
    return <LoginPage />;
  }

  // Task Modal Handlers
  const handleOpenAddTask = (projectId?: string) => {
    setTaskToEdit(null);
    setTaskDefaultProjectId(projectId);
    setTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: ProjectTask) => {
    setTaskToEdit(task);
    setTaskModalOpen(true);
  };

  // Project Modal Handlers
  const handleOpenAddProject = () => {
    setProjectToEdit(null);
    setProjectModalOpen(true);
  };

  const handleOpenEditProject = (proj: OngoingProject) => {
    setProjectToEdit(proj);
    setProjectModalOpen(true);
  };

  // Feature Modal Handlers
  const handleOpenAddFeature = () => {
    setFeatureToEdit(null);
    setFeatureModalOpen(true);
  };

  const handleOpenEditFeature = (feat: UpcomingFeature) => {
    setFeatureToEdit(feat);
    setFeatureModalOpen(true);
  };

  // Fix & Update Modal Handlers
  const handleOpenAddFix = () => {
    setFixToEdit(null);
    setFixModalInitialMode("fix");
    setFixModalOpen(true);
  };

  const handleOpenAddUpdate = () => {
    setFixToEdit(null);
    setFixModalInitialMode("update");
    setFixModalOpen(true);
  };

  const handleOpenEditFix = (fix: FixUpdate) => {
    setFixToEdit(fix);
    setFixModalInitialMode(fix.severity === "patch" ? "update" : "fix");
    setFixModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Header */}
      <Header onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)} />

      {/* Main Workspace: Sidebar + Dynamic View */}
      <div className="flex-1 flex w-full max-w-[1700px] mx-auto">
        <Sidebar
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onOpenNewProjectModal={handleOpenAddProject}
        />

        <main className="flex-1 min-w-0 p-3 sm:p-5 lg:p-6 overflow-y-auto">
          {activeTab === "projects" && (
            <OngoingProjectsView
              onOpenAddTaskModal={handleOpenAddTask}
              onOpenEditTaskModal={handleOpenEditTask}
              onOpenNewProjectModal={handleOpenAddProject}
              onOpenEditProjectModal={handleOpenEditProject}
            />
          )}

          {activeTab === "features" && (
            <UpcomingFeaturesView
              onOpenAddModal={handleOpenAddFeature}
              onOpenEditModal={handleOpenEditFeature}
            />
          )}

          {activeTab === "fixes" && (
            <FixUpdatesView
              onOpenAddFixModal={handleOpenAddFix}
              onOpenAddUpdateModal={handleOpenAddUpdate}
              onOpenAddModal={handleOpenAddFix}
              onOpenEditModal={handleOpenEditFix}
            />
          )}

          {activeTab === "overview" && (
            <TeamOverviewView onNavigateToTab={(tab) => setActiveTab(tab)} />
          )}
        </main>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        taskToEdit={taskToEdit}
        defaultProjectId={taskDefaultProjectId}
      />

      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        projectToEdit={projectToEdit}
      />

      <FeatureModal
        isOpen={featureModalOpen}
        onClose={() => setFeatureModalOpen(false)}
        featureToEdit={featureToEdit}
      />

      <FixModal
        isOpen={fixModalOpen}
        onClose={() => setFixModalOpen(false)}
        fixToEdit={fixToEdit}
        initialMode={fixModalInitialMode}
      />
    </div>
  );
}

/**
 * ============================================================================
 * FOOTER BLOCK: app/page.tsx Implementation Notes & Caveats
 * ============================================================================
 * - Workflow: Master container wiring Header, Sidebar, and View panels.
 * - Caveat: Keeps modal states unified at root for simple props drilling.
 * ============================================================================
 */
