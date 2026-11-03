/**
 * ============================================================================
 * HEADER BLOCK: components/MemberModal.tsx — Add & Edit Team Member Dialog
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Modal dialog enabling Super Admins and Team Leads to:
 * - Provision new team member accounts with real credentials and roles
 * - Edit existing team profiles, skills, access permissions, and status
 * - Manage granular permissions (Admin, Lead, Developer, Ops, Viewer)
 *
 * WHY THIS FILE EXISTS:
 * Fulfills the requirement: "admin panel for add real team account and manage their roles".
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Dispatches addTeamMember / updateTeamMember in useTaskStore, updating all project assignees.
 * ============================================================================
 */

"use client";

import React, { useState, useEffect } from "react";
import { X, UserPlus, Shield, Mail, Send, Award, Check, KeyRound, Eye, EyeOff, Sparkles } from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { TeamMember, MemberAccessLevel, MemberStatus } from "@/lib/types";

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: TeamMember | null;
}

const PRESET_ROLES = [
  "Lead Architect & Founder",
  "Senior Backend Engineer",
  "Next.js & Frontend Engineer",
  "DevOps & Security Specialist",
  "Affiliate Operations Manager",
  "QA Automation Engineer",
  "Product Designer",
  "Affiliate Growth Specialist",
];

const PRESET_AVATARS = [
  { label: "Founder", path: "/founder.jpg" },
  { label: "Avatar 1 (Alex)", path: "/avatars/anime1.png" },
  { label: "Avatar 2 (Rohan)", path: "/avatars/anime2.png" },
  { label: "Avatar 3 (Sarah)", path: "/avatars/anime3.png" },
  { label: "Avatar 4 (Vikram)", path: "/avatars/anime4.png" },
];

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  memberToEdit,
}) => {
  const { addTeamMember, updateTeamMember } = useTaskStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Proaffiliaters@123");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(PRESET_ROLES[0]);
  const [customRole, setCustomRole] = useState("");
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0].path);
  const [accessLevel, setAccessLevel] = useState<MemberAccessLevel>("developer");
  const [status, setStatus] = useState<MemberStatus>("active");
  const [skillsText, setSkillsText] = useState("");
  const [telegramHandle, setTelegramHandle] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (memberToEdit) {
      setName(memberToEdit.name);
      setEmail(memberToEdit.email || "");
      setPassword(memberToEdit.password || "Proaffiliaters@123");
      setRole(memberToEdit.role);
      setCustomRole("");
      setAvatar(memberToEdit.avatar || PRESET_AVATARS[0].path);
      setAccessLevel(memberToEdit.accessLevel || "developer");
      setStatus(memberToEdit.status || "active");
      setSkillsText((memberToEdit.skills || []).join(", "));
      setTelegramHandle(memberToEdit.telegramHandle || "");
      setBio(memberToEdit.bio || "");
    } else {
      setName("");
      setEmail("");
      setPassword("Proaffiliaters@123");
      setRole(PRESET_ROLES[2]);
      setCustomRole("");
      setAvatar(PRESET_AVATARS[1].path);
      setAccessLevel("developer");
      setStatus("active");
      setSkillsText("React, Next.js, TypeScript");
      setTelegramHandle("");
      setBio("");
    }
  }, [memberToEdit, isOpen]);

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let generated = "";
    for (let i = 0; i < 10; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter the team member name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      alert("Please enter a valid team email address.");
      return;
    }

    const finalRole = customRole.trim() || role;
    const skills = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const cleanPass = password.trim() || "Proaffiliaters@123";

    if (memberToEdit) {
      updateTeamMember(memberToEdit.id, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: cleanPass,
        role: finalRole,
        avatar,
        accessLevel,
        status,
        skills,
        telegramHandle: telegramHandle.trim(),
        bio: bio.trim(),
      });
    } else {
      addTeamMember({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: cleanPass,
        role: finalRole,
        avatar,
        accessLevel,
        status,
        skills,
        telegramHandle: telegramHandle.trim(),
        bio: bio.trim(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Dimmed Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Slide-Over Drawer Container */}
      <div className="relative w-full max-w-xl sm:max-w-2xl bg-card border-l border-border shadow-2xl h-full flex flex-col z-10 animate-slideInRight overflow-hidden">
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-indigo-500 to-purple-600 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/95 backdrop-blur-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="text-base font-heading font-extrabold text-foreground tracking-tight">
                {memberToEdit ? "Edit Team Account & Role" : "Add Real Team Account"}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Configure account credentials, permissions, assigned role, and contact details.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="Close drawer (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm">
          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vikram Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">
                Work Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. vikram@proaffiliaters.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                required
              />
            </div>
          </div>

          {/* Employee Login Credential Provisioning */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                <KeyRound size={13} className="text-primary" />
                <span>Employee Login Password / PIN:</span>
              </label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
              >
                <Sparkles size={11} />
                <span>Generate Strong Password</span>
              </button>
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Employee login credential"
                className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Admin provisioned login credential. Used by the employee on the /login portal.
            </p>
          </div>

          {/* Role & Access Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Assigned Role:</label>
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  if (e.target.value !== "Custom") setCustomRole("");
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              >
                {PRESET_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
                <option value="Custom">Custom Role...</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">
                Access Level / Permissions:
              </label>
              <select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value as MemberAccessLevel)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs font-semibold"
              >
                <option value="admin">Super Admin (Full Platform Control)</option>
                <option value="lead">Project Lead (Manage Initiatives & Tasks)</option>
                <option value="developer">Developer (Assign, Code & Resolve Fixes)</option>
                <option value="ops">Affiliate Ops (Manage Campaigns & Bots)</option>
                <option value="viewer">Viewer (Read-Only Access)</option>
              </select>
            </div>
          </div>

          {role === "Custom" && (
            <div>
              <label className="block font-semibold text-foreground mb-1">Enter Custom Role:</label>
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="e.g. Mobile Flutter Developer"
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                required
              />
            </div>
          )}

          {/* Avatar Selector */}
          <div>
            <label className="block font-semibold text-foreground mb-1.5">Profile Avatar:</label>
            <div className="flex items-center gap-3 overflow-x-auto p-2 rounded-xl bg-muted/40 border border-border">
              {PRESET_AVATARS.map((av) => (
                <button
                  type="button"
                  key={av.path}
                  onClick={() => setAvatar(av.path)}
                  className={`relative p-1 rounded-full border-2 transition-all shrink-0 ${
                    avatar === av.path
                      ? "border-primary ring-2 ring-primary/30 scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                  title={av.label}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={av.path}
                    alt={av.label}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {avatar === av.path && (
                    <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-primary text-white">
                      <Check size={10} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Telegram & Account Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Telegram Handle:</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-muted-foreground">@</span>
                <input
                  type="text"
                  value={telegramHandle.replace(/^@/, "")}
                  onChange={(e) => setTelegramHandle(`@${e.target.value.replace(/^@/, "")}`)}
                  placeholder="username"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Account Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MemberStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs font-semibold"
              >
                <option value="active">Active (Full Access)</option>
                <option value="invited">Invited (Pending First Login)</option>
                <option value="inactive">Inactive / Suspended</option>
              </select>
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block font-semibold text-foreground mb-1">
              Skills & Expertise (Comma-separated):
            </label>
            <input
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="e.g. Next.js, Telegram Bot, Docker, Python Scrapers"
              className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
            />
          </div>

          {/* Short Bio */}
          <div>
            <label className="block font-semibold text-foreground mb-1">
              Short Responsibilities / Bio:
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              placeholder="Primary areas of ownership (e.g. In charge of scraper proxy rotation & deal taxonomy)..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
            />
          </div>

          {/* Actions */}
          <div className="px-6 py-4 -mx-6 -mb-6 border-t border-border bg-card/95 backdrop-blur-xs flex items-center justify-between shrink-0 sticky bottom-0 mt-4">
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              * Required fields
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-muted-foreground hover:text-foreground bg-muted border border-border font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 shadow-sm transition-all"
              >
                <Shield size={16} />
                <span>{memberToEdit ? "Save Changes" : "Create Team Account"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * FOOTER BLOCK: components/MemberModal.tsx Implementation Notes
 * ============================================================================
 * - Workflow: Creates or edits real team member records with roles and access levels.
 * - Validation: Enforces valid email and non-empty name before dispatching to store.
 * ============================================================================
 */
