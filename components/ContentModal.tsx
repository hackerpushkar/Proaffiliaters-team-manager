/**
 * ============================================================================
 * HEADER BLOCK: components/ContentModal.tsx — Content Piece & Ad Drawer
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Provides a sleek right-side slide-over drawer to create or edit Content Pieces
 * (Organic Videos) and Paid Advertising Creatives (Ads):
 * - Type selector: Organic Video vs Paid Ad
 * - Title, Platform, Assignee, Start Date, and End Deadline
 * - Dynamic stage selector matching the 6-stage lifecycle of each content type
 * - Asset URLs: Script URL, Raw Footage link, and Live Published URL
 * - Notes & Creative angle inputs
 *
 * WHY THIS FILE EXISTS:
 * Gives the Proaffiliaters video and marketing team an intuitive creation and
 * editing interface with real-time validation and deadline presets.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Dispatches addContentItem or updateContentItem in useTaskStore, syncing to MongoDB.
 * ============================================================================
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Video,
  Sparkles,
  Calendar,
  User,
  Link as LinkIcon,
  FileText,
  Film,
  ExternalLink,
  Target,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";
import {
  ContentItem,
  ContentType,
  ContentStatus,
  ContentPlatform,
  OrganicContentStatus,
  AdContentStatus,
} from "@/lib/types";

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentToEdit?: ContentItem | null;
  initialType?: ContentType;
}

const PLATFORMS: ContentPlatform[] = [
  "YouTube",
  "Instagram Reels",
  "YouTube Shorts",
  "Telegram",
  "Facebook Ads",
  "Google Ads",
  "Twitter/X",
  "Website",
  "Other",
];

const ORGANIC_STAGES: { id: OrganicContentStatus; label: string; desc: string }[] = [
  { id: "researching", label: "Researching", desc: "Topic & competitor hook analysis" },
  { id: "scripting", label: "Scripting", desc: "Drafting script & narrative structure" },
  { id: "shooting", label: "Shooting", desc: "Recording raw visual & audio footage" },
  { id: "editing", label: "Editing", desc: "Video cuts, sound, B-roll & color grading" },
  { id: "review", label: "Review", desc: "Founder & team quality verification" },
  { id: "public", label: "Public", desc: "Published live to channel audience" },
];

const AD_STAGES: { id: AdContentStatus; label: string; desc: string }[] = [
  { id: "researching", label: "Researching", desc: "Offer, target audience & hook research" },
  { id: "scripting", label: "Scripting", desc: "Copywriting high-converting ad copy" },
  { id: "shooting", label: "Shooting", desc: "Filming ad creative variants" },
  { id: "checking", label: "Checking", desc: "Policy compliance & dimension checks" },
  { id: "reviews", label: "Reviews", desc: "Performance & budget spend review" },
  { id: "live", label: "Live", desc: "Active campaign running on ad network" },
];

export const ContentModal: React.FC<ContentModalProps> = ({
  isOpen,
  onClose,
  contentToEdit,
  initialType = "organic",
}) => {
  const { addContentItem, updateContentItem, teamMembers } = useTaskStore();

  const [type, setType] = useState<ContentType>(initialType);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState<ContentPlatform>("YouTube");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<ContentStatus>("researching");
  const [assigneeEmail, setAssigneeEmail] = useState("");
  const [scriptUrl, setScriptUrl] = useState("");
  const [rawFootageUrl, setRawFootageUrl] = useState("");
  const [publishedUrl, setPublishedUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isArchived, setIsArchived] = useState(false);

  useEffect(() => {
    if (contentToEdit) {
      setType(contentToEdit.type);
      setTitle(contentToEdit.title);
      setDescription(contentToEdit.description || "");
      setPlatform(contentToEdit.platform || "YouTube");
      setStartDate(contentToEdit.startDate);
      setEndDate(contentToEdit.endDate);
      setStatus(contentToEdit.status);
      setAssigneeEmail(contentToEdit.assigneeEmail || contentToEdit.assignee?.name || "");
      setScriptUrl(contentToEdit.scriptUrl || "");
      setRawFootageUrl(contentToEdit.rawFootageUrl || "");
      setPublishedUrl(contentToEdit.publishedUrl || "");
      setNotes(contentToEdit.notes || "");
      setIsArchived(contentToEdit.isArchived || false);
    } else {
      const today = new Date();
      const in5Days = new Date(today.getTime() + 5 * 86400000);
      setType(initialType);
      setTitle("");
      setDescription("");
      setPlatform(initialType === "organic" ? "YouTube" : "Facebook Ads");
      setStartDate(today.toISOString().split("T")[0]);
      setEndDate(in5Days.toISOString().split("T")[0]);
      setStatus("researching");
      setAssigneeEmail(teamMembers[0]?.email || "");
      setScriptUrl("");
      setRawFootageUrl("");
      setPublishedUrl("");
      setNotes("");
      setIsArchived(false);
    }
  }, [contentToEdit, initialType, teamMembers]);

  // When type changes, ensure valid status
  const handleTypeChange = (newType: ContentType) => {
    setType(newType);
    if (newType === "organic") {
      setPlatform("YouTube");
      setStatus("researching");
    } else {
      setPlatform("Facebook Ads");
      setStatus("researching");
    }
  };

  const handleApplyPreset = (days: number) => {
    const base = startDate ? new Date(startDate) : new Date();
    const target = new Date(base.getTime() + days * 86400000);
    setEndDate(target.toISOString().split("T")[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !endDate) return;

    const selectedMember = teamMembers.find(
      (m) => m.email.toLowerCase() === assigneeEmail.toLowerCase()
    );

    const assigneeData = selectedMember
      ? {
          name: selectedMember.name,
          avatar: selectedMember.avatar,
          role: selectedMember.role,
        }
      : {
          name: "Pushkar (Founder)",
          avatar: "/founder.jpg",
          role: "Lead",
        };

    const payload = {
      type,
      title: title.trim(),
      description: description.trim(),
      platform,
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate,
      status,
      assignee: assigneeData,
      assigneeEmail: selectedMember?.email || assigneeEmail,
      scriptUrl: scriptUrl.trim(),
      rawFootageUrl: rawFootageUrl.trim(),
      publishedUrl: publishedUrl.trim(),
      notes: notes.trim(),
      isArchived,
    };

    if (contentToEdit) {
      updateContentItem(contentToEdit.id, payload);
    } else {
      addContentItem(payload);
    }

    onClose();
  };

  if (!isOpen) return null;

  const activeStages = type === "organic" ? ORGANIC_STAGES : AD_STAGES;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div
        className="relative w-full max-w-xl h-full bg-card border-l border-border shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideInRight"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Line */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-indigo-500 to-accent" />

        {/* Drawer Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              type === "organic"
                ? "bg-primary/10 border-primary/25 text-primary"
                : "bg-purple-500/10 border-purple-500/25 text-purple-600 dark:text-purple-400"
            }`}>
              {type === "organic" ? <Video size={20} /> : <Target size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-heading font-extrabold text-foreground">
                {contentToEdit ? "Edit Content Piece" : "New Content Piece"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {type === "organic"
                  ? "Organic video production pipeline (6 stages to Public)"
                  : "Paid advertising creative workflow (6 stages to Live)"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Form Body */}
        <form id="content-modal-form" onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Type Switcher Segmented Pills */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Content Category
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => handleTypeChange("organic")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  type === "organic"
                    ? "bg-card text-primary shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Video size={14} />
                <span>Organic Video</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("ad")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  type === "ad"
                    ? "bg-card text-purple-600 dark:text-purple-400 shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Target size={14} />
                <span>Paid Ad Creative</span>
              </button>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              {type === "organic" ? "Video Title" : "Ad Campaign / Creative Name"} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === "organic"
                  ? "e.g. How to Automate Amazon Affiliate Deals with Telegram Bot"
                  : "e.g. Q4 Black Friday Prowasp Bot Retargeting Video Ad v2"
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Platform & Assignee Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Target Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as ContentPlatform)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                {PLATFORMS.map((plat) => (
                  <option key={plat} value={plat}>
                    {plat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Lead / Creator
              </label>
              <select
                value={assigneeEmail}
                onChange={(e) => setAssigneeEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.email}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates: Start & End Deadline with Quick Presets */}
          <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar size={13} className="text-primary" />
                Production Deadlines
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground font-semibold">Presets:</span>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(3)}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-muted hover:bg-card border border-border text-foreground transition-all"
                >
                  +3d
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(7)}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-muted hover:bg-card border border-border text-foreground transition-all"
                >
                  +1w
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(14)}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-muted hover:bg-card border border-border text-foreground transition-all"
                >
                  +2w
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  End Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* 6-Stage Current Status Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Current Production Stage
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {activeStages.map((st, idx) => {
                const isSelected = status === st.id;
                const isFinal = st.id === "public" || st.id === "live";
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatus(st.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? isFinal
                          ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 shadow-xs"
                          : "bg-primary/10 border-primary/50 text-primary shadow-xs"
                        : "bg-background border-border text-foreground hover:bg-muted/70"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold">
                        {idx + 1}. {st.label}
                      </span>
                      {isSelected && <CheckCircle2 size={13} className="shrink-0" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 leading-tight">
                      {st.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resource Links (Script, Footage, Live URL) */}
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Production Assets & Links
            </label>
            <div className="space-y-2">
              <div className="relative">
                <FileText size={14} className="absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="url"
                  value={scriptUrl}
                  onChange={(e) => setScriptUrl(e.target.value)}
                  placeholder="Script URL (Google Docs / Notion / Frame.io)"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="relative">
                <Film size={14} className="absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="url"
                  value={rawFootageUrl}
                  onChange={(e) => setRawFootageUrl(e.target.value)}
                  placeholder="Raw Footage Folder (Google Drive / Dropbox)"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="relative">
                <ExternalLink size={14} className="absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="url"
                  value={publishedUrl}
                  onChange={(e) => setPublishedUrl(e.target.value)}
                  placeholder="Live Published URL (YouTube link / Instagram reel / Ad preview)"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* Description & Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Creative Hook & Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Outline the hook, key takeaway, audio track, call to action, or editing notes..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          {/* Archive Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="content-is-archived"
              checked={isArchived}
              onChange={(e) => setIsArchived(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
            />
            <label htmlFor="content-is-archived" className="text-xs text-muted-foreground font-medium cursor-pointer">
              Mark as Achieved / Archived (Move to Completed Archive)
            </label>
          </div>
        </form>

        {/* Sticky Action Footer */}
        <div className="p-4 sm:p-6 border-t border-border bg-card flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-bold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="content-modal-form"
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all flex items-center gap-2"
          >
            <Sparkles size={14} />
            <span>{contentToEdit ? "Save Changes" : "Create Content Piece"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * FOOTER BLOCK: components/ContentModal.tsx Implementation Notes & Caveats
 * ============================================================================
 * - Workflow: Sliding right-side drawer with dynamic stage options per type.
 * - Caveat: Auto-adjusts status to 'researching' when switching between types.
 * ============================================================================
 */
