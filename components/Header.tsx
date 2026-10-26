/**
 * ============================================================================
 * HEADER BLOCK: components/Header.tsx — Top Navigation & Command Bar
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Renders the top navigation header containing:
 * - Proaffiliaters official logo & title badge
 * - Global search bar across features, projects, and fixes
 * - Interactive Project Invitations Bell with pending requests popover
 * - Individual "My Tasks" count pill
 * - Data Backup (Export JSON / Import JSON) and Reset actions
 * - Dark/Light mode theme switch with hydration protection
 * - Logged-in employee profile menu with Sign Out and Admin Portal links
 *
 * WHY THIS FILE EXISTS:
 * Serves as the persistent command bar across all dashboard views.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Interacts with useTaskStore to process search, invitations, and auth state.
 * ============================================================================
 */

"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Sun,
  Moon,
  AlertCircle,
  Zap,
  CheckCircle2,
  Menu,
  Bell,
  LogOut,
  Shield,
  User,
  Check,
  X as CloseIcon,
  CheckSquare,
  Sparkles,
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
  } = useTaskStore();

  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [invitesOpen, setInvitesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

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

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 py-3 border-b backdrop-blur-xl bg-card/90 border-border transition-colors">
      {/* Left: Mobile hamburger & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>

        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20 shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Proaffiliaters Logo"
              className="w-6 h-6 object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-base tracking-tight text-foreground">
                Proaffiliaters
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded-full bg-primary/10 text-primary border border-primary/20">
                Team & Task
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Internal Command Center & Product Engine
            </p>
          </div>
        </Link>
      </div>

      {/* Center: Search input */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search features, projects, tasks, fixes..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right: Quick KPI badges, Data Actions, Invitations, Theme & Profile */}
      <div className="flex items-center gap-2">
        {/* Global KPI Counters */}
        <div className="hidden xl:flex items-center gap-2 mr-1">
          {stats.urgentTasksCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              <AlertCircle size={13} className="text-red-500 animate-pulse" />
              <span>{stats.urgentTasksCount} P0</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20">
            <CheckCircle2 size={13} />
            <span>{stats.completedTasksCount} Done</span>
          </div>
        </div>

        {/* Project Invitations Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setInvitesOpen(!invitesOpen);
              setProfileOpen(false);
            }}
            title="Project Invitations"
            className={`relative p-2 rounded-xl border transition-all ${
              myPendingInvites.length > 0
                ? "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20"
                : "text-muted-foreground hover:text-foreground bg-muted border-border"
            }`}
          >
            <Bell size={16} />
            {myPendingInvites.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-card animate-pulse">
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
                  <Sparkles size={24} className="mx-auto mb-2 text-primary/40" />
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



        {/* Theme Toggle Button with Hydration Guard */}
        <button
          onClick={toggleTheme}
          title={mounted && isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground bg-muted border border-border transition-all"
        >
          {mounted && isDark ? (
            <Sun size={16} className="text-amber-400" />
          ) : (
            <Moon size={16} className="text-indigo-600" />
          )}
        </button>

        {/* Current Employee Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setInvitesOpen(false);
            }}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-muted transition-colors group"
          >
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentUser?.avatar || "/founder.jpg"}
                alt={currentUser?.name || "Employee"}
                className="w-8 h-8 rounded-full object-cover border-2 border-primary/40 group-hover:border-primary shadow-xs transition-colors"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>
            <div className="hidden md:block text-left pr-1">
              <div className="text-xs font-bold text-foreground leading-tight truncate max-w-[100px]">
                {currentUser?.name ? currentUser.name.split(" ")[0] : "Account"}
              </div>
              <div className="text-[10px] text-muted-foreground capitalize leading-tight">
                {currentUser?.accessLevel || "Member"}
              </div>
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
 * - Workflow: Houses global notifications bell with interactive approval actions.
 * - Caveat: Checks pending invites strictly against currentUser.email.
 * ============================================================================
 */
