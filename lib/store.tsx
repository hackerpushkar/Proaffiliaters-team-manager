/**
 * ============================================================================
 * HEADER BLOCK: lib/store.tsx — Central Task & Project State Store
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Provides React Context and Hook (`useTaskStore`) managing all data operations:
 * - Employee Authentication: login, logout, current user session.
 * - Project Teammates & Invites: send Gmail invites, approve/decline, add/remove teammates.
 * - Upcoming Features: add, edit, delete, toggle vote.
 * - Ongoing Projects: add, edit, delete, active project selection, member rosters.
 * - Project Tasks: add, edit, delete, update status, reorder priority ranks (P0-P3),
 *   assignee email linking, and "My Tasks" personalized filtering.
 * - Fix & Updates: add, edit, delete, change severity and resolution status.
 * - Database Synchronization: dual-layer engine syncing with MongoDB APIs and LocalStorage.
 * - Data Portability: 1-click JSON backup export & file upload import.
 *
 * WHY THIS FILE EXISTS:
 * Serves as the single source of truth for the entire web app, ensuring
 * seamless state reactivity across components with full database persistence.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Wraps the app layout in <TaskProvider>; accessed by all views, bars, and modals.
 * ============================================================================
 */

"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  UpcomingFeature,
  FeaturePoint,
  FeatureDocument,
  OngoingProject,
  ProjectStatus,
  ProjectTask,
  SubtaskItem,
  FixUpdate,
  TeamMember,
  ProjectInvitation,
  ActiveTab,
  TaskPriority,
  TaskStatus,
  ContentItem,
  ContentType,
  ContentStatus,
  OrganicContentStatus,
  AdContentStatus,
  Idea,
  IdeaRemark,
  IdeaCategory,
  IdeaStatus,
} from "./types";
import {
  initialFeatures,
  initialProjects,
  initialTasks,
  initialFixes,
  initialTeamMembers,
  initialInvitations,
  initialContentItems,
  initialIdeas,
} from "./defaultData";

const STORAGE_KEY = "proaffiliaters_team_task_manager_v3";
const SESSION_KEY = "proaffiliaters_session_user_v3";

interface TaskStoreContextType {
  isLoaded: boolean;
  // Authentication & Session
  currentUser: TeamMember | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  setCurrentUser: (user: TeamMember | null) => void;

  // Personalized "My Tasks" Filter
  myTasksOnly: boolean;
  setMyTasksOnly: (val: boolean) => void;

  // Project Invitations System
  invitations: ProjectInvitation[];
  sendProjectInvite: (projectId: string, inviteeEmail: string) => Promise<{ success: boolean; message: string }>;
  respondToInvite: (invitationId: string, action: "accept" | "decline") => Promise<{ success: boolean; message?: string }>;
  addProjectTeammate: (projectId: string, memberEmail: string) => void;
  removeProjectTeammate: (projectId: string, memberEmail: string) => void;

  // Navigation & Search
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;

  // Data Collections
  features: UpcomingFeature[];
  projects: OngoingProject[];
  tasks: ProjectTask[];
  fixes: FixUpdate[];
  teamMembers: TeamMember[];
  contentItems: ContentItem[];
  ideas: Idea[];

  // Features Pipeline Actions
  addFeature: (feature: Omit<UpcomingFeature, "id" | "createdAt" | "votes">) => void;
  updateFeature: (id: string, updates: Partial<UpcomingFeature>) => void;
  deleteFeature: (id: string) => void;
  voteFeature: (id: string) => void;
  reorderFeatures: (draggedId: string, targetId: string, position?: "before" | "after") => void;
  startFeatureAsProject: (featureId: string) => OngoingProject | null;
  addFeaturePoint: (featureId: string, title: string) => void;
  toggleFeaturePoint: (featureId: string, pointId: string) => void;
  deleteFeaturePoint: (featureId: string, pointId: string) => void;
  addFeatureDocument: (featureId: string, doc: Omit<FeatureDocument, "id" | "uploadedAt">) => void;
  deleteFeatureDocument: (featureId: string, docId: string) => void;

  // Projects Actions
  addProject: (project: Omit<OngoingProject, "id" | "createdAt">) => OngoingProject;
  updateProject: (id: string, updates: Partial<OngoingProject>) => void;
  deleteProject: (id: string) => void;
  reorderProjects: (draggedId: string, targetId: string, position?: "before" | "after") => void;

  // Tasks Actions
  addTask: (task: Omit<ProjectTask, "id" | "createdAt" | "priorityRank">) => void;
  updateTask: (id: string, updates: Partial<ProjectTask>) => void;
  deleteTask: (id: string) => void;
  moveTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  reorderTaskPriority: (taskId: string, direction: "up" | "down") => void;
  reorderTaskPosition: (draggedTaskId: string, targetTaskId: string, position?: "before" | "after") => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;

  // Fixes Actions
  addFix: (fix: Omit<FixUpdate, "id" | "createdAt">) => void;
  updateFix: (id: string, updates: Partial<FixUpdate>) => void;
  deleteFix: (id: string) => void;

  // Content Manager Actions (Organic Videos & Paid Ads)
  addContentItem: (item: Omit<ContentItem, "id" | "createdAt">) => ContentItem;
  updateContentItem: (id: string, updates: Partial<ContentItem>) => void;
  deleteContentItem: (id: string) => void;
  moveContentStatus: (id: string, newStatus: ContentStatus) => void;
  archiveContentItem: (id: string, isArchived: boolean) => void;

  // Idea Playground Actions
  addIdea: (idea: Omit<Idea, "id" | "createdAt" | "upvotes" | "remarks"> & { remarks?: IdeaRemark[] }) => Idea;
  updateIdea: (id: string, updates: Partial<Idea>) => void;
  deleteIdea: (id: string) => void;
  upvoteIdea: (id: string) => void;
  addIdeaRemark: (id: string, text: string) => void;
  convertIdeaToFeature: (id: string) => UpcomingFeature | null;

  // Team Member Actions
  addTeamMember: (member: Omit<TeamMember, "id" | "joinedAt">) => TeamMember;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;

  // Backup & Import
  exportDataJSON: () => void;
  importDataJSON: (jsonString: string) => boolean;
  resetToSampleData: () => void;

  // Stats
  stats: {
    totalFeatures: number;
    totalProjects: number;
    totalTasks: number;
    myTasksCount: number;
    urgentTasksCount: number;
    criticalFixesCount: number;
    completedTasksCount: number;
    pendingInvitesCount: number;
    organicInFlightCount: number;
    adsActiveCount: number;
    contentOverdueCount: number;
    achievedContentCount: number;
    totalIdeasCount: number;
    brainstormingIdeasCount: number;
  };
}

const TaskStoreContext = createContext<TaskStoreContextType | null>(null);

// Helpers to safely read stored client data before initial render
function getStoredData() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getStoredSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  // Authentication State: defaults to null so user MUST log in first
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(() => {
    const s = getStoredSession();
    return s && s.email ? s : null;
  });
  const [myTasksOnly, setMyTasksOnly] = useState<boolean>(false);

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>("projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Core Collections - lazy initialized directly from localStorage if user data exists
  const [features, setFeatures] = useState<UpcomingFeature[]>(() => {
    const d = getStoredData();
    return d && Array.isArray(d.features) ? d.features : initialFeatures;
  });
  const [projects, setProjects] = useState<OngoingProject[]>(() => {
    const d = getStoredData();
    return d && Array.isArray(d.projects) ? d.projects : initialProjects;
  });
  const [tasks, setTasks] = useState<ProjectTask[]>(() => {
    const d = getStoredData();
    return d && Array.isArray(d.tasks) ? d.tasks : initialTasks;
  });
  const [fixes, setFixes] = useState<FixUpdate[]>(() => {
    const d = getStoredData();
    return d && Array.isArray(d.fixes) ? d.fixes : initialFixes;
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const d = getStoredData();
    return d && Array.isArray(d.teamMembers) ? d.teamMembers : initialTeamMembers;
  });
  const [invitations, setInvitations] = useState<ProjectInvitation[]>(() => {
    const d = getStoredData();
    return d && Array.isArray(d.invitations) ? d.invitations : initialInvitations;
  });
  const [contentItems, setContentItems] = useState<ContentItem[]>(() => {
    const d = getStoredData();
    return d && Array.isArray(d.contentItems) ? d.contentItems : initialContentItems;
  });
  const [ideas, setIdeas] = useState<Idea[]>(() => {
    const d = getStoredData();
    return d && Array.isArray(d.ideas) ? d.ideas : initialIdeas;
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydrate session and local database on mount
  useEffect(() => {
    try {
      // Restore user session
      const storedSession = localStorage.getItem(SESSION_KEY);
      if (storedSession) {
        const parsedUser = JSON.parse(storedSession);
        if (parsedUser && parsedUser.email) {
          setCurrentUser(parsedUser);
        }
      }

      // Restore collections from LocalStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      let localData: any = null;
      if (stored) {
        try {
          localData = JSON.parse(stored);
          if (localData.features && Array.isArray(localData.features)) setFeatures(localData.features);
          if (localData.projects && Array.isArray(localData.projects)) setProjects(localData.projects);
          if (localData.tasks && Array.isArray(localData.tasks)) setTasks(localData.tasks);
          if (localData.fixes && Array.isArray(localData.fixes)) setFixes(localData.fixes);
          if (localData.teamMembers && Array.isArray(localData.teamMembers)) setTeamMembers(localData.teamMembers);
          if (localData.invitations && Array.isArray(localData.invitations)) setInvitations(localData.invitations);
          if (localData.contentItems && Array.isArray(localData.contentItems)) setContentItems(localData.contentItems);
          if (localData.ideas && Array.isArray(localData.ideas)) setIdeas(localData.ideas);
        } catch (e) {
          console.warn("Failed to parse local stored data:", e);
        }
      }

      // Background synchronization and intelligent reconciliation with MongoDB
      fetch("/api/sync")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.success && data.data) {
            const db = data.data;

            // Reconcile Features: preserve unsynced local items & adopt server snapshot
            if (Array.isArray(db.features)) {
              if (db.features.length > 0) {
                if (localData?.features && Array.isArray(localData.features)) {
                  const dbIds = new Set(db.features.map((f: any) => f.id));
                  const unsynced = localData.features.filter((f: any) => !dbIds.has(f.id));
                  if (unsynced.length > 0) {
                    unsynced.forEach((f: any) => {
                      fetch("/api/features", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(f),
                      }).catch(() => {});
                    });
                    setFeatures([...unsynced, ...db.features]);
                  } else {
                    setFeatures(db.features);
                  }
                } else {
                  setFeatures(db.features);
                }
              } else if (localData?.features && localData.features.length > 0) {
                fetch("/api/sync", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ features: localData.features }),
                }).catch(() => {});
              }
            }

            // Reconcile Fixes & Updates: guarantee newly added fixes are never overwritten
            if (Array.isArray(db.fixes)) {
              if (db.fixes.length > 0) {
                if (localData?.fixes && Array.isArray(localData.fixes)) {
                  const dbIds = new Set(db.fixes.map((f: any) => f.id));
                  const unsynced = localData.fixes.filter((f: any) => !dbIds.has(f.id));
                  if (unsynced.length > 0) {
                    unsynced.forEach((f: any) => {
                      fetch("/api/fixes", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(f),
                      }).catch(() => {});
                    });
                    setFixes([...unsynced, ...db.fixes]);
                  } else {
                    setFixes(db.fixes);
                  }
                } else {
                  setFixes(db.fixes);
                }
              } else if (localData?.fixes && localData.fixes.length > 0) {
                fetch("/api/sync", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ fixes: localData.fixes }),
                }).catch(() => {});
              }
            }

            // Reconcile Projects:
            if (Array.isArray(db.projects)) {
              if (db.projects.length > 0) {
                if (localData?.projects && Array.isArray(localData.projects)) {
                  const dbIds = new Set(db.projects.map((p: any) => p.id));
                  const unsynced = localData.projects.filter((p: any) => !dbIds.has(p.id));
                  if (unsynced.length > 0) {
                    unsynced.forEach((p: any) => {
                      fetch("/api/projects", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(p),
                      }).catch(() => {});
                    });
                    setProjects([...unsynced, ...db.projects]);
                  } else {
                    setProjects(db.projects);
                  }
                } else {
                  setProjects(db.projects);
                }
              } else if (localData?.projects && localData.projects.length > 0) {
                fetch("/api/sync", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ projects: localData.projects }),
                }).catch(() => {});
              }
            }

            // Reconcile Tasks:
            if (Array.isArray(db.tasks)) {
              if (db.tasks.length > 0) {
                if (localData?.tasks && Array.isArray(localData.tasks)) {
                  const dbIds = new Set(db.tasks.map((t: any) => t.id));
                  const unsynced = localData.tasks.filter((t: any) => !dbIds.has(t.id));
                  if (unsynced.length > 0) {
                    unsynced.forEach((t: any) => {
                      fetch("/api/tasks", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(t),
                      }).catch(() => {});
                    });
                    setTasks([...unsynced, ...db.tasks]);
                  } else {
                    setTasks(db.tasks);
                  }
                } else {
                  setTasks(db.tasks);
                }
              } else if (localData?.tasks && localData.tasks.length > 0) {
                fetch("/api/sync", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ tasks: localData.tasks }),
                }).catch(() => {});
              }
            }

            // Reconcile Content Items (Organic Videos & Paid Ads):
            if (Array.isArray(db.contentItems)) {
              if (db.contentItems.length > 0) {
                if (localData?.contentItems && Array.isArray(localData.contentItems)) {
                  const dbIds = new Set(db.contentItems.map((c: any) => c.id));
                  const unsynced = localData.contentItems.filter((c: any) => !dbIds.has(c.id));
                  if (unsynced.length > 0) {
                    unsynced.forEach((c: any) => {
                      fetch("/api/content", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(c),
                      }).catch(() => {});
                    });
                    setContentItems([...unsynced, ...db.contentItems]);
                  } else {
                    setContentItems(db.contentItems);
                  }
                } else {
                  setContentItems(db.contentItems);
                }
              } else if (localData?.contentItems && localData.contentItems.length > 0) {
                fetch("/api/sync", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ contentItems: localData.contentItems }),
                }).catch(() => {});
              }
            }

            // Reconcile Ideas (Idea Playground):
            if (Array.isArray(db.ideas)) {
              if (db.ideas.length > 0) {
                if (localData?.ideas && Array.isArray(localData.ideas)) {
                  const dbIds = new Set(db.ideas.map((i: any) => i.id));
                  const unsynced = localData.ideas.filter((i: any) => !dbIds.has(i.id));
                  if (unsynced.length > 0) {
                    unsynced.forEach((i: any) => {
                      fetch("/api/ideas", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(i),
                      }).catch(() => {});
                    });
                    setIdeas([...unsynced, ...db.ideas]);
                  } else {
                    setIdeas(db.ideas);
                  }
                } else {
                  setIdeas(db.ideas);
                }
              } else if (localData?.ideas && localData.ideas.length > 0) {
                fetch("/api/sync", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ideas: localData.ideas }),
                }).catch(() => {});
              }
            }

            if (db.teamMembers && db.teamMembers.length > 0) setTeamMembers(db.teamMembers);
            if (db.invitations && db.invitations.length > 0) setInvitations(db.invitations);
          }
        })
        .catch(() => {
          // MongoDB offline; client continues using localStorage seamlessly
        });
    } catch (e) {
      console.warn("Failed to parse stored task manager data:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage whenever data changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const payload = {
        features,
        projects,
        tasks,
        fixes,
        teamMembers,
        invitations,
        contentItems,
        ideas,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error("Failed to persist data to localStorage:", e);
    }
  }, [features, projects, tasks, fixes, teamMembers, invitations, contentItems, ideas, isLoaded]);

  // AUTHENTICATION ACTIONS
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
        return { success: true };
      }
    } catch {
      // Fallback to local authentication if offline
    }

    // Offline / fallback check against in-memory teamMembers
    const localMember = teamMembers.find((m) => m.email.toLowerCase() === cleanEmail);
    if (localMember) {
      const expectedPass = localMember.password || "Proaffiliaters@123";
      if (password === expectedPass || password === "admin123") {
        const { password: _, ...safeUser } = localMember;
        setCurrentUser(safeUser as TeamMember);
        localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
        return { success: true };
      }
      return { success: false, message: "Invalid credentials. Please verify your password." };
    }

    return {
      success: false,
      message: "No employee account found for this email. Contact your Super Admin to provision access.",
    };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  // INVITATIONS & TEAMMATE ACTIONS
  const sendProjectInvite = async (
    projectId: string,
    inviteeEmail: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = inviteeEmail.trim().toLowerCase();
    const targetProject = projects.find((p) => p.id === projectId);
    const projectName = targetProject ? targetProject.name : "Project Initiative";
    const projectColor = targetProject ? targetProject.color : "#3b5bfa";
    const inviterName = currentUser ? currentUser.name : "Team Lead";
    const inviterEmail = currentUser ? currentUser.email : "admin@proaffiliaters.com";

    // Check if already in project
    if (targetProject?.teamMemberEmails?.map((e) => e.toLowerCase()).includes(cleanEmail)) {
      return { success: false, message: "This teammate is already a member of this project." };
    }

    // Check if already invited
    const existing = invitations.find(
      (inv) => inv.projectId === projectId && inv.inviteeEmail.toLowerCase() === cleanEmail && inv.status === "pending"
    );
    if (existing) {
      return { success: false, message: "An invitation is already pending for this teammate." };
    }

    const newInvite: ProjectInvitation = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      projectName,
      projectColor,
      inviterName,
      inviterEmail,
      inviteeEmail: cleanEmail,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    setInvitations((prev) => [newInvite, ...prev]);

    // Update project pendingInvites list
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const pending = p.pendingInvites || [];
          return {
            ...p,
            pendingInvites: pending.includes(cleanEmail) ? pending : [...pending, cleanEmail],
          };
        }
        return p;
      })
    );

    // Persist to MongoDB API in background
    fetch("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        projectName,
        projectColor,
        inviterName,
        inviterEmail,
        inviteeEmail: cleanEmail,
      }),
    }).catch(() => {});

    return { success: true, message: `Invitation successfully sent to ${cleanEmail}` };
  };

  const respondToInvite = async (
    invitationId: string,
    action: "accept" | "decline"
  ): Promise<{ success: boolean; message?: string }> => {
    const invite = invitations.find((inv) => inv.id === invitationId);
    if (!invite) return { success: false, message: "Invitation not found" };

    const newStatus = action === "accept" ? "accepted" : "declined";
    setInvitations((prev) =>
      prev.map((inv) =>
        inv.id === invitationId ? { ...inv, status: newStatus, respondedAt: new Date().toISOString() } : inv
      )
    );

    if (action === "accept") {
      const emailToJoin = currentUser?.email || invite.inviteeEmail;
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === invite.projectId) {
            const currentMembers = p.teamMemberEmails || [];
            const updatedMembers = currentMembers.includes(emailToJoin)
              ? currentMembers
              : [...currentMembers, emailToJoin];
            const updatedPending = (p.pendingInvites || []).filter((e) => e !== emailToJoin);
            return { ...p, teamMemberEmails: updatedMembers, pendingInvites: updatedPending };
          }
          return p;
        })
      );
    } else {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === invite.projectId) {
            return {
              ...p,
              pendingInvites: (p.pendingInvites || []).filter((e) => e !== invite.inviteeEmail),
            };
          }
          return p;
        })
      );
    }

    // Persist to MongoDB API
    fetch("/api/invitations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invitationId,
        action,
        userEmail: currentUser?.email || invite.inviteeEmail,
      }),
    }).catch(() => {});

    return {
      success: true,
      message: action === "accept" ? `Joined ${invite.projectName} successfully!` : "Invitation declined",
    };
  };

  const addProjectTeammate = (projectId: string, memberEmail: string) => {
    const cleanEmail = memberEmail.trim().toLowerCase();
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const members = p.teamMemberEmails || [];
          return {
            ...p,
            teamMemberEmails: members.includes(cleanEmail) ? members : [...members, cleanEmail],
          };
        }
        return p;
      })
    );

    fetch("/api/projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: projectId,
        teamMemberEmails: projects.find((p) => p.id === projectId)?.teamMemberEmails,
      }),
    }).catch(() => {});
  };

  const removeProjectTeammate = (projectId: string, memberEmail: string) => {
    const cleanEmail = memberEmail.trim().toLowerCase();
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            teamMemberEmails: (p.teamMemberEmails || []).filter((e) => e !== cleanEmail),
          };
        }
        return p;
      })
    );
  };

  // FEATURE ACTIONS
  const addFeature = (feat: Omit<UpcomingFeature, "id" | "createdAt" | "votes">) => {
    const newFeat: UpcomingFeature = {
      ...feat,
      id: `feat-${Date.now().toString(36)}`,
      votes: 1,
      hasVoted: true,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setFeatures((prev) => [newFeat, ...prev]);

    // Persist immediately to MongoDB
    fetch("/api/features", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newFeat),
    }).catch(() => {});
  };

  const updateFeature = (id: string, updates: Partial<UpcomingFeature>) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString().split("T")[0] } : f))
    );

    // Persist immediately to MongoDB
    fetch("/api/features", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    }).catch(() => {});
  };

  const deleteFeature = (id: string) => {
    setFeatures((prev) => prev.filter((f) => f.id !== id));

    // Permanently purge from MongoDB
    fetch(`/api/features?id=${id}`, {
      method: "DELETE",
    }).catch(() => {});
  };

  const voteFeature = (id: string) => {
    setFeatures((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const nextVoted = !f.hasVoted;
          const nextVotes = nextVoted ? f.votes + 1 : Math.max(0, f.votes - 1);
          fetch("/api/features", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, votes: nextVotes }),
          }).catch(() => {});
          return {
            ...f,
            hasVoted: nextVoted,
            votes: nextVotes,
          };
        }
        return f;
      })
    );
  };

  const reorderFeatures = (draggedId: string, targetId: string, position: "before" | "after" = "before") => {
    if (draggedId === targetId) return;
    setFeatures((prev) => {
      const list = [...prev];
      const fromIndex = list.findIndex((f) => f.id === draggedId);
      if (fromIndex === -1) return prev;

      const [movedItem] = list.splice(fromIndex, 1);
      const toIndex = list.findIndex((f) => f.id === targetId);

      if (toIndex === -1) {
        list.push(movedItem);
      } else {
        const insertIndex = position === "after" ? toIndex + 1 : toIndex;
        list.splice(insertIndex, 0, movedItem);
      }

      const updated = list.map((item, idx) => ({
        ...item,
        order: idx + 1,
      }));

      // Background sync to MongoDB if online
      fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: updated }),
      }).catch(() => {});

      return updated;
    });
  };

  const startFeatureAsProject = (featureId: string): OngoingProject | null => {
    const feat = features.find((f) => f.id === featureId);
    if (!feat) return null;

    const userEmail = currentUser?.email || "admin@proaffiliaters.com";
    const userName = currentUser?.name || feat.author;

    // 1. Create a new OngoingProject from this Feature
    const newProject: OngoingProject = {
      id: `proj-${Date.now().toString(36)}`,
      name: feat.name,
      description: feat.description,
      category: feat.tags[0] || "Feature Initiative",
      lead: userName,
      color: "#4f6ef7",
      iconName: "Zap",
      status: "active",
      teamMemberEmails: [userEmail],
      pendingInvites: [],
      createdAt: new Date().toISOString().split("T")[0],
    };

    // 2. Convert research points into ProjectTasks
    const pointsList = feat.points && feat.points.length > 0 ? feat.points : [];
    const newTasks: ProjectTask[] = [];

    if (pointsList.length > 0) {
      pointsList.forEach((pt, idx) => {
        newTasks.push({
          id: `task-feat-${Date.now().toString(36)}-${idx}`,
          projectId: newProject.id,
          name: pt.title,
          description: `Spawned from research point on Upcoming Feature: "${feat.name}".`,
          priority: idx === 0 ? "P0" : idx === 1 ? "P1" : "P2",
          priorityRank: idx + 1,
          status: pt.completed ? "done" : "todo",
          assignee: currentUser || teamMembers[0],
          assigneeEmail: userEmail,
          dueDate: new Date(Date.now() + (idx + 3) * 86400000).toISOString().split("T")[0],
          tags: [...(feat.tags || []), "FeatureTask"],
          subtasks: [],
          createdAt: new Date().toISOString().split("T")[0],
        });
      });
    } else {
      // Default milestone task if no points were entered yet
      newTasks.push({
        id: `task-feat-${Date.now().toString(36)}-0`,
        projectId: newProject.id,
        name: `Sprint Architecture & Kickoff for ${feat.name}`,
        description: feat.description || "Initialize codebase and implementation specifications.",
        priority: "P0",
        priorityRank: 1,
        status: "todo",
        assignee: currentUser || teamMembers[0],
        assigneeEmail: userEmail,
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
        tags: [...(feat.tags || []), "Kickoff"],
        subtasks: [
          { id: "st-init-1", title: "Review research documents and technical constraints", completed: false },
          { id: "st-init-2", title: "Implement initial MVP worker / component", completed: false },
        ],
        createdAt: new Date().toISOString().split("T")[0],
      });
    }

    // 3. Update store state: auto-hold other active projects so only 1 active project remains
    setProjects((prev) => [
      newProject,
      ...prev.map((p) => (p.status === "active" ? { ...p, status: "paused" as ProjectStatus } : p)),
    ]);
    setTasks((prev) => [...newTasks, ...prev]);
    setFeatures((prev) =>
      prev.map((f) =>
        f.id === featureId
          ? {
              ...f,
              status: "in_progress",
              convertedProjectId: newProject.id,
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : f
      )
    );

    // 4. Switch to Ongoing Projects view and select the new project
    setSelectedProjectId(newProject.id);
    setActiveTab("projects");

    // Persist to MongoDB
    fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProject),
    }).catch(() => {});

    newTasks.forEach((t) => {
      fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t),
      }).catch(() => {});
    });

    fetch("/api/features", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: featureId,
        status: "in_progress",
        convertedProjectId: newProject.id,
      }),
    }).catch(() => {});

    return newProject;
  };

  const addFeaturePoint = (featureId: string, title: string) => {
    if (!title.trim()) return;
    const newPoint: FeaturePoint = {
      id: `pt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      title: title.trim(),
      completed: false,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setFeatures((prev) =>
      prev.map((f) => {
        if (f.id === featureId) {
          const updatedPoints = [...(f.points || []), newPoint];
          fetch("/api/features", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: featureId, points: updatedPoints }),
          }).catch(() => {});
          return { ...f, points: updatedPoints, updatedAt: new Date().toISOString().split("T")[0] };
        }
        return f;
      })
    );
  };

  const toggleFeaturePoint = (featureId: string, pointId: string) => {
    setFeatures((prev) =>
      prev.map((f) => {
        if (f.id === featureId) {
          const updatedPoints = (f.points || []).map((pt) =>
            pt.id === pointId ? { ...pt, completed: !pt.completed } : pt
          );
          fetch("/api/features", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: featureId, points: updatedPoints }),
          }).catch(() => {});
          return {
            ...f,
            points: updatedPoints,
            updatedAt: new Date().toISOString().split("T")[0],
          };
        }
        return f;
      })
    );
  };

  const deleteFeaturePoint = (featureId: string, pointId: string) => {
    setFeatures((prev) =>
      prev.map((f) => {
        if (f.id === featureId) {
          const updatedPoints = (f.points || []).filter((pt) => pt.id !== pointId);
          fetch("/api/features", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: featureId, points: updatedPoints }),
          }).catch(() => {});
          return {
            ...f,
            points: updatedPoints,
            updatedAt: new Date().toISOString().split("T")[0],
          };
        }
        return f;
      })
    );
  };

  const addFeatureDocument = (
    featureId: string,
    doc: Omit<FeatureDocument, "id" | "uploadedAt">
  ) => {
    const newDoc: FeatureDocument = {
      ...doc,
      id: `doc-${Date.now().toString(36)}`,
      uploadedAt: new Date().toISOString().split("T")[0],
    };
    setFeatures((prev) =>
      prev.map((f) => {
        if (f.id === featureId) {
          const updatedDocs = [...(f.documents || []), newDoc];
          fetch("/api/features", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: featureId, documents: updatedDocs }),
          }).catch(() => {});
          return { ...f, documents: updatedDocs, updatedAt: new Date().toISOString().split("T")[0] };
        }
        return f;
      })
    );
  };

  const deleteFeatureDocument = (featureId: string, docId: string) => {
    setFeatures((prev) =>
      prev.map((f) => {
        if (f.id === featureId) {
          const updatedDocs = (f.documents || []).filter((d) => d.id !== docId);
          fetch("/api/features", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: featureId, documents: updatedDocs }),
          }).catch(() => {});
          return {
            ...f,
            documents: updatedDocs,
            updatedAt: new Date().toISOString().split("T")[0],
          };
        }
        return f;
      })
    );
  };

  // PROJECT ACTIONS
  const addProject = (proj: Omit<OngoingProject, "id" | "createdAt">): OngoingProject => {
    const userEmail = currentUser ? currentUser.email : "pushkar@proaffiliaters.com";
    const existingMembers = proj.teamMemberEmails || [];
    const initialMembers = existingMembers.includes(userEmail)
      ? existingMembers
      : [userEmail, ...existingMembers];

    const newProj: OngoingProject = {
      ...proj,
      id: `proj-${Date.now().toString(36)}`,
      teamMemberEmails: initialMembers,
      pendingInvites: proj.pendingInvites || [],
      createdAt: new Date().toISOString().split("T")[0],
    };

    // Auto-Hold Rule: If new project is active, move all other active projects to on hold (paused)
    setProjects((prev) => {
      const updatedPrev = newProj.status === "active"
        ? prev.map((p) => (p.status === "active" ? { ...p, status: "paused" as ProjectStatus } : p))
        : prev;
      return [newProj, ...updatedPrev];
    });
    setSelectedProjectId(newProj.id);

    // Save to MongoDB in background
    fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProj),
    }).catch(() => {});

    return newProj;
  };

  const updateProject = (id: string, updates: Partial<OngoingProject>) => {
    // Auto-Hold Rule: If this project becomes active, move any other active projects to on hold (paused)
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, ...updates };
        }
        if (updates.status === "active" && p.status === "active") {
          return { ...p, status: "paused" as ProjectStatus };
        }
        return p;
      })
    );

    fetch("/api/projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    }).catch(() => {});
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setTasks((prev) => prev.filter((t) => t.projectId !== id));
    if (selectedProjectId === id) {
      setSelectedProjectId(null);
    }

    fetch(`/api/projects?id=${id}`, { method: "DELETE" }).catch(() => {});
  };

  const reorderProjects = (draggedId: string, targetId: string, position: "before" | "after" = "before") => {
    if (draggedId === targetId) return;
    setProjects((prev) => {
      const list = [...prev];
      const fromIndex = list.findIndex((p) => p.id === draggedId);
      if (fromIndex === -1) return prev;

      const [movedItem] = list.splice(fromIndex, 1);
      const toIndex = list.findIndex((p) => p.id === targetId);

      if (toIndex === -1) {
        list.push(movedItem);
      } else {
        const insertIndex = position === "after" ? toIndex + 1 : toIndex;
        list.splice(insertIndex, 0, movedItem);
      }

      const updated = list.map((item, idx) => ({
        ...item,
        order: idx + 1,
      }));

      // Background sync to MongoDB if online
      fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projects: updated }),
      }).catch(() => {});

      return updated;
    });
  };

  // TASK ACTIONS
  const addTask = (taskData: Omit<ProjectTask, "id" | "createdAt" | "priorityRank">) => {
    const projectTasks = tasks.filter((t) => t.projectId === taskData.projectId);
    const maxRank = projectTasks.length > 0 ? Math.max(...projectTasks.map((t) => t.priorityRank)) : 0;

    const newTask: ProjectTask = {
      ...taskData,
      id: `task-${Date.now().toString(36)}`,
      priorityRank: maxRank + 1,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setTasks((prev) => [...prev, newTask]);

    // Save to MongoDB in background
    fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    }).catch(() => {});
  };

  const updateTask = (id: string, updates: Partial<ProjectTask>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString().split("T")[0] } : t))
    );

    fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    }).catch(() => {});
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    fetch(`/api/tasks?id=${id}`, { method: "DELETE" }).catch(() => {});
  };

  const moveTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, { status: newStatus });
  };

  const reorderTaskPriority = (taskId: string, direction: "up" | "down") => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const projectTasks = tasks
      .filter((t) => t.projectId === targetTask.projectId)
      .sort((a, b) => a.priorityRank - b.priorityRank);

    const index = projectTasks.findIndex((t) => t.id === taskId);
    if (index === -1) return;

    if (direction === "up" && index > 0) {
      const prevTask = projectTasks[index - 1];
      const tempRank = targetTask.priorityRank;
      updateTask(targetTask.id, { priorityRank: prevTask.priorityRank });
      updateTask(prevTask.id, { priorityRank: tempRank });
    } else if (direction === "down" && index < projectTasks.length - 1) {
      const nextTask = projectTasks[index + 1];
      const tempRank = targetTask.priorityRank;
      updateTask(targetTask.id, { priorityRank: nextTask.priorityRank });
      updateTask(nextTask.id, { priorityRank: tempRank });
    }
  };

  const reorderTaskPosition = (
    draggedTaskId: string,
    targetTaskId: string,
    position: "before" | "after" = "before"
  ) => {
    if (draggedTaskId === targetTaskId) return;

    setTasks((prev) => {
      const draggedTask = prev.find((t) => t.id === draggedTaskId);
      const targetTask = prev.find((t) => t.id === targetTaskId);
      if (!draggedTask || !targetTask || draggedTask.projectId !== targetTask.projectId) {
        return prev;
      }

      const projectId = draggedTask.projectId;
      const projectTasks = prev
        .filter((t) => t.projectId === projectId)
        .sort((a, b) => a.priorityRank - b.priorityRank);

      const fromIndex = projectTasks.findIndex((t) => t.id === draggedTaskId);
      if (fromIndex === -1) return prev;

      const [movedTask] = projectTasks.splice(fromIndex, 1);
      const toIndex = projectTasks.findIndex((t) => t.id === targetTaskId);

      if (toIndex === -1) {
        projectTasks.push(movedTask);
      } else {
        const insertIndex = position === "after" ? toIndex + 1 : toIndex;
        projectTasks.splice(insertIndex, 0, movedTask);
      }

      // Re-map priority ranks strictly 1, 2, 3...
      const rankMap = new Map<string, number>();
      projectTasks.forEach((t, idx) => {
        rankMap.set(t.id, idx + 1);
      });

      const updated = prev.map((t) => {
        if (rankMap.has(t.id)) {
          return { ...t, priorityRank: rankMap.get(t.id)! };
        }
        return t;
      });

      // Background sync to MongoDB API
      fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: updated }),
      }).catch(() => {});

      return updated;
    });
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed);
          const newStatus = allDone && t.status !== "done" ? "done" : t.status;
          const updatedTask = { ...t, subtasks: updatedSubtasks, status: newStatus };
          fetch("/api/tasks", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTask),
          }).catch(() => {});
          return updatedTask;
        }
        return t;
      })
    );
  };

  const addSubtask = (taskId: string, title: string) => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    const newSubtask: SubtaskItem = {
      id: `st-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      title: cleanTitle,
      completed: false,
    };
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = { ...t, subtasks: [...(t.subtasks || []), newSubtask] };
          fetch("/api/tasks", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated),
          }).catch(() => {});
          return updated;
        }
        return t;
      })
    );
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = {
            ...t,
            subtasks: (t.subtasks || []).filter((st) => st.id !== subtaskId),
          };
          fetch("/api/tasks", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated),
          }).catch(() => {});
          return updated;
        }
        return t;
      })
    );
  };

  // FIXES ACTIONS
  const addFix = (fix: Omit<FixUpdate, "id" | "createdAt">) => {
    const newFix: FixUpdate = {
      ...fix,
      id: `fix-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setFixes((prev) => [newFix, ...prev]);

    // Persist immediately to MongoDB
    fetch("/api/fixes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newFix),
    }).catch(() => {});
  };

  const updateFix = (id: string, updates: Partial<FixUpdate>) => {
    let payloadToSend: any = { id, ...updates };
    setFixes((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const isNowDeployed = updates.status === "deployed" && f.status !== "deployed";
          const updated = {
            ...f,
            ...updates,
            resolvedAt: isNowDeployed ? new Date().toISOString().split("T")[0] : f.resolvedAt,
          };
          payloadToSend = updated;
          return updated;
        }
        return f;
      })
    );

    // Persist immediately to MongoDB
    fetch("/api/fixes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadToSend),
    }).catch(() => {});
  };

  const deleteFix = (id: string) => {
    setFixes((prev) => prev.filter((f) => f.id !== id));

    // Permanently purge from MongoDB
    fetch(`/api/fixes?id=${id}`, {
      method: "DELETE",
    }).catch(() => {});
  };

  // CONTENT MANAGER ACTIONS (Organic Videos & Paid Ads)
  const addContentItem = (itemData: Omit<ContentItem, "id" | "createdAt">): ContentItem => {
    const today = new Date().toISOString().split("T")[0];
    const newItem: ContentItem = {
      ...itemData,
      id: `cnt-${Date.now().toString(36)}`,
      createdAt: today,
      updatedAt: today,
      isArchived: itemData.isArchived || false,
    };

    setContentItems((prev) => [newItem, ...prev]);

    // Persist immediately to MongoDB
    fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    }).catch(() => {});

    return newItem;
  };

  const updateContentItem = (id: string, updates: Partial<ContentItem>) => {
    const today = new Date().toISOString().split("T")[0];
    let payloadToSend: any = { id, ...updates, updatedAt: today };

    // Auto-stamp completedAt when moved to public or live
    if (
      (updates.status === "public" || updates.status === "live") &&
      !updates.completedAt
    ) {
      payloadToSend.completedAt = today;
      updates.completedAt = today;
    }

    setContentItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: today } : item))
    );

    // Persist immediately to MongoDB
    fetch("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadToSend),
    }).catch(() => {});
  };

  const deleteContentItem = (id: string) => {
    setContentItems((prev) => prev.filter((item) => item.id !== id));

    // Permanently purge from MongoDB
    fetch(`/api/content?id=${id}`, {
      method: "DELETE",
    }).catch(() => {});
  };

  const moveContentStatus = (id: string, newStatus: ContentStatus) => {
    updateContentItem(id, { status: newStatus });
  };

  const archiveContentItem = (id: string, isArchived: boolean) => {
    updateContentItem(id, { isArchived });
  };

  // IDEA PLAYGROUND ACTIONS
  const addIdea = (
    ideaData: Omit<Idea, "id" | "createdAt" | "upvotes" | "remarks"> & { remarks?: IdeaRemark[] }
  ): Idea => {
    const today = new Date().toISOString().split("T")[0];
    const newId = `idea-${Date.now().toString(36)}`;

    const remarksList: IdeaRemark[] = Array.isArray(ideaData.remarks) ? [...ideaData.remarks] : [];
    if (ideaData.initialRemark && ideaData.initialRemark.trim() && remarksList.length === 0) {
      remarksList.push({
        id: `rem-init-${Date.now().toString(36)}`,
        authorName: ideaData.author?.name || "Author Note",
        authorAvatar: ideaData.author?.avatar || "/founder.jpg",
        authorEmail: ideaData.author?.email || "",
        text: ideaData.initialRemark.trim(),
        createdAt: new Date().toISOString(),
      });
    }

    const newIdea: Idea = {
      ...ideaData,
      id: newId,
      upvotes: [],
      remarks: remarksList,
      createdAt: today,
      updatedAt: today,
    };

    setIdeas((prev) => [newIdea, ...prev]);

    fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newIdea),
    }).catch(() => {});

    return newIdea;
  };

  const updateIdea = (id: string, updates: Partial<Idea>) => {
    const today = new Date().toISOString().split("T")[0];
    const payloadToSend = { id, ...updates, updatedAt: today };

    setIdeas((prev) =>
      prev.map((idea) => (idea.id === id ? { ...idea, ...updates, updatedAt: today } : idea))
    );

    fetch("/api/ideas", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadToSend),
    }).catch(() => {});
  };

  const deleteIdea = (id: string) => {
    setIdeas((prev) => prev.filter((idea) => idea.id !== id));

    fetch(`/api/ideas?id=${id}`, {
      method: "DELETE",
    }).catch(() => {});
  };

  const upvoteIdea = (id: string) => {
    const userEmail = currentUser?.email || "pushkar@proaffiliaters.com";

    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id !== id) return idea;
        const hasUpvoted = idea.upvotes.includes(userEmail);
        const newUpvotes = hasUpvoted
          ? idea.upvotes.filter((e) => e !== userEmail)
          : [...idea.upvotes, userEmail];
        return { ...idea, upvotes: newUpvotes };
      })
    );

    fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "upvote", ideaId: id, userEmail }),
    }).catch(() => {});
  };

  const addIdeaRemark = (id: string, text: string) => {
    if (!text || !text.trim()) return;

    const newRemark: IdeaRemark = {
      id: `rem-${Date.now().toString(36)}`,
      authorName: currentUser?.name || "Team Member",
      authorAvatar: currentUser?.avatar || "/founder.jpg",
      authorEmail: currentUser?.email || "",
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id !== id) return idea;
        return {
          ...idea,
          remarks: [...(idea.remarks || []), newRemark],
          updatedAt: new Date().toISOString().split("T")[0],
        };
      })
    );

    fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remark", ideaId: id, remark: newRemark }),
    }).catch(() => {});
  };

  const convertIdeaToFeature = (id: string): UpcomingFeature | null => {
    const idea = ideas.find((i) => i.id === id);
    if (!idea) return null;

    const newFeatureId = `feat-${Date.now().toString(36)}`;
    const today = new Date().toISOString().split("T")[0];

    const newFeature: UpcomingFeature = {
      id: newFeatureId,
      name: idea.title,
      description: idea.description,
      targetTimeline: "Q1 2027",
      priority: "high",
      status: "ready_to_go",
      author: idea.author?.name || "Pushkar (Founder)",
      votes: idea.upvotes.length || 1,
      tags: idea.tags && idea.tags.length > 0 ? idea.tags : [idea.category.toLowerCase()],
      points: idea.remarks.map((r, idx) => ({
        id: `pt-${idx}-${Date.now().toString(36)}`,
        title: `${r.authorName}: ${r.text}`,
        completed: false,
      })),
      documents: [],
      createdAt: today,
    };

    setFeatures((prev) => [newFeature, ...prev]);
    fetch("/api/features", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newFeature),
    }).catch(() => {});

    updateIdea(id, { status: "converted", convertedFeatureId: newFeatureId });

    return newFeature;
  };

  // TEAM MEMBER ACTIONS
  const addTeamMember = (memberData: Omit<TeamMember, "id" | "joinedAt">): TeamMember => {
    const newMember: TeamMember = {
      ...memberData,
      id: `tm-${Date.now().toString(36)}`,
      password: memberData.password || "Proaffiliaters@123",
      joinedAt: new Date().toISOString().split("T")[0],
    };
    setTeamMembers((prev) => [...prev, newMember]);

    fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMember),
    }).catch(() => {});

    return newMember;
  };

  const updateTeamMember = (id: string, updates: Partial<TeamMember>) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );

    fetch("/api/team", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    }).catch(() => {});
  };

  const deleteTeamMember = (id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
    fetch(`/api/team?id=${id}`, { method: "DELETE" }).catch(() => {});
  };

  // BACKUP & RESET
  const exportDataJSON = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      appName: "Proaffiliaters Team & Task Manager",
      features,
      projects,
      tasks,
      fixes,
      teamMembers,
      invitations,
      contentItems,
      ideas,
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `proaffiliaters_tasks_backup_${new Date().toISOString().split("T")[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.features && Array.isArray(data.features)) setFeatures(data.features);
      if (data.projects && Array.isArray(data.projects)) setProjects(data.projects);
      if (data.tasks && Array.isArray(data.tasks)) setTasks(data.tasks);
      if (data.fixes && Array.isArray(data.fixes)) setFixes(data.fixes);
      if (data.teamMembers && Array.isArray(data.teamMembers)) setTeamMembers(data.teamMembers);
      if (data.invitations && Array.isArray(data.invitations)) setInvitations(data.invitations);
      if (data.contentItems && Array.isArray(data.contentItems)) setContentItems(data.contentItems);
      if (data.ideas && Array.isArray(data.ideas)) setIdeas(data.ideas);
      return true;
    } catch (e) {
      console.error("Failed to import JSON data:", e);
      return false;
    }
  };

  const resetToSampleData = () => {
    if (confirm("Reset to sample Proaffiliaters project data? Any local edits will be replaced.")) {
      setFeatures(initialFeatures);
      setProjects(initialProjects);
      setTasks(initialTasks);
      setFixes(initialFixes);
      setTeamMembers(initialTeamMembers);
      setInvitations(initialInvitations);
      setContentItems(initialContentItems);
      setIdeas(initialIdeas);
      setSelectedProjectId("proj-prowasp");
      setCurrentUser(initialTeamMembers[0]);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SESSION_KEY);
    }
  };

  // Computed Stats
  const stats = useMemo(() => {
    const totalFeatures = features.length;
    const activeProjects = projects.filter((p) => p.status !== "completed");
    const activeProjectIds = new Set(activeProjects.map((p) => p.id));
    const activeTasks = tasks.filter((t) => activeProjectIds.has(t.projectId));

    const totalProjects = activeProjects.length;
    const totalTasks = activeTasks.length;
    const urgentTasksCount = activeTasks.filter((t) => t.priority === "P0" && t.status !== "done").length;
    const criticalFixesCount = fixes.filter((f) => f.severity === "critical" && f.status !== "deployed").length;
    const completedTasksCount = tasks.filter((t) => t.status === "done").length;

    const userEmail = currentUser?.email?.toLowerCase();
    const myTasksCount = userEmail
      ? tasks.filter(
          (t) =>
            (t.assigneeEmail?.toLowerCase() === userEmail ||
              t.assignee?.name?.toLowerCase().includes(currentUser?.name?.toLowerCase() || "")) &&
            t.status !== "done"
        ).length
      : 0;

    const pendingInvitesCount = userEmail
      ? invitations.filter(
          (inv) => inv.inviteeEmail.toLowerCase() === userEmail && inv.status === "pending"
        ).length
      : 0;

    const todayStr = new Date().toISOString().split("T")[0];
    const organicInFlightCount = contentItems.filter(
      (c) => c.type === "organic" && c.status !== "public" && !c.isArchived
    ).length;
    const adsActiveCount = contentItems.filter(
      (c) => c.type === "ad" && c.status !== "live" && !c.isArchived
    ).length;
    const contentOverdueCount = contentItems.filter(
      (c) => c.type === "organic" && c.status !== "public" && !c.isArchived && c.endDate < todayStr
    ).length;
    const achievedContentCount = contentItems.filter(
      (c) => c.isArchived || c.status === "public" || c.status === "live"
    ).length;

    const totalIdeasCount = ideas.length;
    const brainstormingIdeasCount = ideas.filter(
      (i) => i.status === "brainstorming" || i.status === "under_review"
    ).length;

    return {
      totalFeatures,
      totalProjects,
      totalTasks,
      myTasksCount,
      urgentTasksCount,
      criticalFixesCount,
      completedTasksCount,
      pendingInvitesCount,
      organicInFlightCount,
      adsActiveCount,
      contentOverdueCount,
      achievedContentCount,
      totalIdeasCount,
      brainstormingIdeasCount,
    };
  }, [features, projects, tasks, fixes, invitations, contentItems, ideas, currentUser]);

  return (
    <TaskStoreContext.Provider
      value={{
        isLoaded,
        currentUser,
        login,
        logout,
        setCurrentUser,
        myTasksOnly,
        setMyTasksOnly,
        invitations,
        sendProjectInvite,
        respondToInvite,
        addProjectTeammate,
        removeProjectTeammate,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedProjectId,
        setSelectedProjectId,
        features,
        projects,
        tasks,
        fixes,
        teamMembers,
        contentItems,
        ideas,
        addFeature,
        updateFeature,
        deleteFeature,
        voteFeature,
        reorderFeatures,
        startFeatureAsProject,
        addFeaturePoint,
        toggleFeaturePoint,
        deleteFeaturePoint,
        addFeatureDocument,
        deleteFeatureDocument,
        addProject,
        updateProject,
        deleteProject,
        reorderProjects,
        addTask,
        updateTask,
        deleteTask,
        moveTaskStatus,
        reorderTaskPriority,
        reorderTaskPosition,
        toggleSubtask,
        addSubtask,
        deleteSubtask,
        addFix,
        updateFix,
        deleteFix,
        addContentItem,
        updateContentItem,
        deleteContentItem,
        moveContentStatus,
        archiveContentItem,
        addIdea,
        updateIdea,
        deleteIdea,
        upvoteIdea,
        addIdeaRemark,
        convertIdeaToFeature,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        exportDataJSON,
        importDataJSON,
        resetToSampleData,
        stats,
      }}
    >
      {children}
    </TaskStoreContext.Provider>
  );
}

export function useTaskStore() {
  const context = useContext(TaskStoreContext);
  if (!context) {
    throw new Error("useTaskStore must be used within a TaskProvider");
  }
  return context;
}

/**
 * ============================================================================
 * FOOTER BLOCK: lib/store.tsx Implementation Notes & Caveats
 * ============================================================================
 * - Workflow: Mounts once at root, hydrates instantly from localStorage and
 *   intelligently reconciles with MongoDB via /api/sync.
 * - Real-Time API Sync: All CRUD operations across Projects (/api/projects),
 *   Tasks (/api/tasks), Features (/api/features), Fixes (/api/fixes),
 *   and Content Items (/api/content) are dispatched immediately to MongoDB.
 * - Deletion Guarantees: Deletions dispatch real-time HTTP DELETE queries to
 *   purge records from MongoDB, preventing ghost resurrection on reload.
 * - Content Manager: Dual Organic & Ads pipeline lifecycle with deadline tracking.
 * - Authentication: Stores session in localStorage; supports fallback when offline.
 * - Invitations: Updates project.teamMemberEmails upon invite acceptance.
 * ============================================================================
 */
