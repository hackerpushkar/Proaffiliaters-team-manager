/**
 * ============================================================================
 * HEADER BLOCK: components/Header.tsx — Top Navigation & Command Bar
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Renders the top navigation header matching Figma redesign:
 * - 76px height, glassmorphism backdrop blur
 * - Proaffiliaters brand mark (40x40 gradient "P") with Manrope 800 title
 * - Centered global search bar with instant cross-category popup matching
 * - Quick "Done" counter chip pill
 * - Interactive Project Invitations Bell with pending requests popover
 * - Theme switch (Light / Dark) with hydration protection
 * - Employee profile chip & admin dropdown
 *
 * WHY THIS FILE EXISTS:
 * Serves as the persistent command bar across all dashboard views.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Interacts with useTaskStore to process search, invitations, and auth state.
 * ============================================================================
 */

"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Sun,
  Moon,
  AlertCircle,
  CheckCircle2,
  Menu,
  Bell,
  LogOut,
  Shield,
  User,
  Check,
  X as CloseIcon,
  Layers,
  Lightbulb,
  CheckSquare,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const router = useRouter();
  const {
    currentUser,
    logout,
    invitations,
    respondToInvite,
    searchQuery,
    setSearchQuery,
    stats,
    projects,
    features,
    tasks,
    setActiveTab,
    setSelectedProjectId,
  } = useTaskStore();

  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [invitesOpen, setInvitesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Sync theme on mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("proaffiliaters_theme");
      const hasDark =
        storedTheme === "dark" ||
        document.documentElement.classList.contains("dark");
      if (hasDark) {
        document.documentElement.classList.add("dark");
        setIsDark(true);
      } else {
        document.documentElement.classList.remove("dark");
        setIsDark(false);
      }
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("proaffiliaters_theme", "light");
      setIsDark(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("proaffiliaters_theme", "dark");
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Filter invitations addressed to current user that are pending
  const userEmail = currentUser?.email?.toLowerCase();
  const myPendingInvites = invitations.filter(
    (inv) => inv.inviteeEmail.toLowerCase() === userEmail && inv.status === "pending"
  );

  // Live Cross-Category Search Matching
  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const matchedProjects = (projects || [])
      .filter((p) => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)))
      .map((p) => ({
        id: p.id,
        title: p.name,
        category: p.category || "Project",
        type: "Project" as const,
        action: () => {
          setSelectedProjectId(p.id);
          setActiveTab("projects");
          setSearchQuery("");
        },
      }));

    const matchedFeatures = (features || [])
      .filter((f) => f.name.toLowerCase().includes(q) || (f.description && f.description.toLowerCase().includes(q)))
      .map((f) => ({
        id: f.id,
        title: f.name,
        category: f.targetTimeline || "Feature",
        type: "Feature" as const,
        action: () => {
          setActiveTab("features");
          setSearchQuery("");
        },
      }));

    const matchedTasks = (tasks || [])
      .filter((t) => t.name.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)))
      .map((t) => ({
        id: t.id,
        title: t.name,
        category: t.priority,
        type: "Task" as const,
        action: () => {
          setSelectedProjectId(t.projectId);
          setActiveTab("projects");
          setSearchQuery("");
        },
      }));

    return [...matchedProjects, ...matchedFeatures, ...matchedTasks].slice(0, 6);
  }, [searchQuery, projects, features, tasks, setSelectedProjectId, setActiveTab, setSearchQuery]);

  return (
    <header className="sticky top-0 z-30 h-[76px] flex items-center justify-between px-4 sm:px-6 border-b border-border bg-card/95 backdrop-blur-md transition-colors">
      {/* Left: Mobile hamburger & Figma Brand */}
      <div className="flex items-center gap-3 min-w-[230px]">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>

        <Link
          href="/"
          onClick={() => {
            setActiveTab("overview");
            setSelectedProjectId(null);
          }}
          className="flex items-center gap-2.5 group text-left cursor-pointer select-none"
        >
          <div className="brand-mark shrink-0 group-hover:scale-105 transition-transform duration-200">
            P
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-heading font-extrabold text-[16px] tracking-[-0.4px] text-foreground leading-none">
              Proaffiliaters
            </span>
            <span className="text-[9px] font-bold text-primary tracking-[1.2px] uppercase mt-1 leading-none">
              WORK MANAGEMENT
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Global Search Bar with Live Matches */}
      <div className="flex-1 max-w-[520px] mx-4 relative hidden md:block">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setSearchFocused(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search features, projects, tasks, fixes..."
            className="w-full h-[42px] pl-11 pr-10 text-xs rounded-xl bg-[#f8f9fc] dark:bg-[#17203b] border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 text-muted-foreground hover:text-foreground"
            >
              <CloseIcon size={14} />
            </button>
          )}
        </div>

        {/* Live Search Popup */}
        {searchMatches.length > 0 && (
          <div className="absolute top-[48px] left-0 right-0 bg-card border border-border rounded-xl shadow-2xl p-2 z-50 animate-scaleUp">
            <div className="text-[10px] font-bold tracking-wider text-muted-foreground px-2 py-1 uppercase">
              Matching deliverables
            </div>
            {searchMatches.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={item.action}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted text-left transition-colors group"
              >
                <span className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {item.type === "Project" ? (
                    <Layers size={14} />
                  ) : item.type === "Feature" ? (
                    <Lightbulb size={14} />
                  ) : (
                    <CheckSquare size={14} />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {item.type} • {item.category}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Quick Action Chips & Profile */}
      <div className="flex items-center gap-2.5">
        {/* Figma "16 Done" Chip */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-primary font-bold text-xs shadow-xs">
          <Check size={14} className="text-primary stroke-[3]" />
          <span>{stats.completedTasksCount || 16} Done</span>
        </div>

        {/* Project Invitations Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setInvitesOpen(!invitesOpen);
              setProfileOpen(false);
            }}
            title="Project Invitations"
            className={`w-[36px] h-[36px] rounded-lg border transition-all flex items-center justify-center ${
              myPendingInvites.length > 0
                ? "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20"
                : "text-muted-foreground hover:text-primary hover:bg-primary/10 bg-muted/60 border-border"
            }`}
          >
            <Bell size={16} />
            {myPendingInvites.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-card animate-pulse">
                {myPendingInvites.length}
              </span>
            )}
          </button>

          {/* Invitations Popover */}
          {invitesOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl p-4 z-50 animate-scaleUp">
              <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold text-xs">
                    {myPendingInvites.length}
                  </div>
                  <h3 className="font-heading font-bold text-xs text-foreground">
                    Project Invitations
                  </h3>
                </div>
                <button
                  onClick={() => setInvitesOpen(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
                >
                  <CloseIcon size={14} />
                </button>
              </div>

              {myPendingInvites.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">You are all caught up!</p>
                  <p className="text-[11px] mt-0.5">No pending project join invitations.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {myPendingInvites.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 rounded-xl border border-border bg-muted/40 hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0">
                          <span
                            className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mb-1"
                            style={{
                              backgroundColor: `${inv.projectColor}20`,
                              color: inv.projectColor,
                            }}
                          >
                            Project Invite
                          </span>
                          <h4 className="font-heading font-bold text-xs text-foreground truncate">
                            {inv.projectName}
                          </h4>
                          <p className="text-[11px] text-muted-foreground">
                            Invited by <span className="font-semibold text-foreground">{inv.inviterName}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-border/50">
                        <button
                          type="button"
                          onClick={() => respondToInvite(inv.id, "accept")}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
                        >
                          <Check size={12} />
                          <span>Approve & Join</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => respondToInvite(inv.id, "decline")}
                          className="py-1.5 px-3 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-semibold border border-border active:scale-95 transition-all"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={mounted && isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="w-[36px] h-[36px] rounded-lg text-muted-foreground hover:text-foreground bg-muted/60 border border-border flex items-center justify-center transition-all"
        >
          {mounted && isDark ? (
            <Sun size={16} className="text-amber-400" />
          ) : (
            <Moon size={16} className="text-primary" />
          )}
        </button>

        {/* User Chip matching Figma: Avatar + Pushkar / Admin */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setInvitesOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-muted/70 transition-colors group cursor-pointer"
          >
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentUser?.avatar || "/founder.jpg"}
                alt={currentUser?.name || "Pushkar"}
                className="w-[34px] h-[34px] rounded-full object-cover border-2 border-primary/40 group-hover:border-primary shadow-xs transition-colors"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>
            <div className="hidden md:flex flex-col text-left pr-1 leading-tight">
              <span className="text-[12px] font-bold text-foreground">
                {currentUser?.name || "Pushkar"}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {currentUser?.accessLevel === "admin" ? "Admin" : currentUser?.role || "Leader"}
              </span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-2xl p-3 z-50 animate-scaleUp">
              <div className="p-3 rounded-xl bg-muted/50 border border-border mb-2">
                <div className="font-bold text-xs text-foreground">{currentUser?.name}</div>
                <div className="text-[11px] text-muted-foreground truncate">{currentUser?.email}</div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                    {currentUser?.role || "Team Member"}
                  </span>
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    • {currentUser?.accessLevel}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                {(currentUser?.accessLevel === "admin" || currentUser?.accessLevel === "lead") && (
                  <Link
                    href="/admin"
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-muted text-foreground transition-colors"
                  >
                    <Shield size={14} className="text-primary" />
                    <span>Admin Team Portal (/admin)</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors font-semibold"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

/**
 * ============================================================================
 * FOOTER BLOCK: components/Header.tsx Implementation Notes & Caveats
 * ============================================================================
 * - Workflow: Houses Figma 76px command bar with live multi-category search.
 * - Caveat: Checks pending invites strictly against currentUser.email.
 * ============================================================================
 */
