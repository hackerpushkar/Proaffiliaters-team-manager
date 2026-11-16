/**
 * ============================================================================
 * HEADER BLOCK: components/ContentManagerView.tsx — Content & Ads Production Hub
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Implements the master "Content Manager" workspace for Proaffiliaters:
 * - 2 Primary Tabs: "📹 Organic Videos" and "🎯 Paid Ads Manager"
 * - Sub-view Toggle: "⚡ Active Pipeline" vs "🏆 Achieved / Completed Videos"
 * - 6-Stage production lifecycle steppers with 1-click stage progression
 * - Automated Red Alert Container when an Organic Video misses its End Deadline
 *   (Ads are exempt from red container styling per user specifications)
 * - Achieved / Done Videos archive where completed assets can be inspected,
 *   revisited, and opened via live links
 * - Real-time MongoDB persistence and cross-tab synchronization
 *
 * WHY THIS FILE EXISTS:
 * Fulfills the user request: "section name as content manager here i add ads post
 * and organic post post by our team... container become red if deadline miss for
 * content (videos not for ads)... done video open when we open achieved videos".
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Connects to useTaskStore for content items, triggers ContentModal for creation/editing,
 * and maintains continuous database synchronization.
 * ============================================================================
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Video,
  Target,
  Sparkles,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Edit2,
  Trash2,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Archive,
  ChevronRight,
  ChevronDown,
  FileText,
  Film,
  Eye,
  RefreshCw,
  Layers,
  FileCheck,
  Image as ImageIcon,
  BarChart2,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";
import {
  ContentItem,
  ContentType,
  ContentStatus,
  ContentPlatform,
  OrganicContentStatus,
  AdContentStatus,
  ScriptAttachment,
  ContentStats,
} from "@/lib/types";
import { ContentScriptModal } from "@/components/ContentScriptModal";
import { ContentStatsModal } from "@/components/ContentStatsModal";

interface ContentManagerViewProps {
  onOpenAddModal: (type?: ContentType) => void;
  onOpenEditModal: (item: ContentItem) => void;
}

const ORGANIC_ORDER: OrganicContentStatus[] = [
  "researching",
  "scripting",
  "shooting",
  "editing",
  "review",
  "public",
];

const AD_ORDER: AdContentStatus[] = [
  "researching",
  "scripting",
  "shooting",
  "checking",
  "reviews",
  "live",
];

const STAGE_LABELS: Record<ContentStatus, string> = {
  researching: "Researching",
  scripting: "Scripting",
  shooting: "Shooting",
  editing: "Editing",
  review: "Review",
  public: "Public (Done)",
  checking: "Checking",
  reviews: "Reviews",
  live: "Live (Active)",
};

export const ContentManagerView: React.FC<ContentManagerViewProps> = ({
  onOpenAddModal,
  onOpenEditModal,
}) => {
  const {
    contentItems,
    updateContentItem,
    deleteContentItem,
    moveContentStatus,
    archiveContentItem,
    stats,
  } = useTaskStore();

  const [activeTab, setActiveTab] = useState<ContentType>("organic");
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedStage, setSelectedStage] = useState<string>("all");

  // Script & Stats Modal States
  const [scriptModalItem, setScriptModalItem] = useState<ContentItem | null>(null);
  const [statsModalItem, setStatsModalItem] = useState<ContentItem | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Filter content items
  const filteredItems = useMemo(() => {
    return (contentItems || []).filter((item) => {
      // 1. Match Content Type (organic vs ad)
      if (item.type !== activeTab) return false;

      // 2. View Mode (Active Pipeline vs Achieved Videos)
      const isCompleted = item.status === "public" || item.status === "live";
      const isAchieved = Boolean(item.isArchived) || isCompleted;

      if (viewMode === "active" && isAchieved) return false;
      if (viewMode === "archived" && !isAchieved) return false;

      // 3. Platform Filter
      if (selectedPlatform !== "all" && item.platform !== selectedPlatform) {
        return false;
      }

      // 4. Stage Filter
      if (selectedStage !== "all" && item.status !== selectedStage) {
        return false;
      }

      // 5. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = (item.description || "").toLowerCase().includes(q);
        const matchesNotes = (item.notes || "").toLowerCase().includes(q);
        const matchesPlatform = (item.platform || "").toLowerCase().includes(q);
        const matchesAssignee = (item.assignee?.name || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesNotes && !matchesPlatform && !matchesAssignee) {
          return false;
        }
      }

      return true;
    });
  }, [contentItems, activeTab, viewMode, selectedPlatform, selectedStage, searchQuery]);

  // Counts for tabs
  const organicActiveCount = useMemo(() => {
    return (contentItems || []).filter(
      (c) => c.type === "organic" && c.status !== "public" && !c.isArchived
    ).length;
  }, [contentItems]);

  const adsActiveCount = useMemo(() => {
    return (contentItems || []).filter(
      (c) => c.type === "ad" && c.status !== "live" && !c.isArchived
    ).length;
  }, [contentItems]);

  const achievedCount = useMemo(() => {
    return (contentItems || []).filter(
      (c) => c.type === activeTab && (c.isArchived || c.status === "public" || c.status === "live")
    ).length;
  }, [contentItems, activeTab]);

  // Helper: check if organic item missed deadline
  const isItemOverdue = (item: ContentItem) => {
    if (item.type !== "organic") return false; // Ads do not turn red
    if (item.status === "public" || item.isArchived) return false;
    return item.endDate < todayStr;
  };

  // Helper: calculate days remaining or overdue
  const getDeadlineBadge = (item: ContentItem) => {
    const isOverdue = isItemOverdue(item);
    const end = new Date(item.endDate);
    const today = new Date(todayStr);
    const diffDays = Math.round((end.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (item.status === "public" || item.status === "live" || item.isArchived) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 size={12} />
          <span>{item.status === "public" ? "Published" : "Live Campaign"}</span>
        </span>
      );
    }

    if (isOverdue) {
      const daysOverdue = Math.abs(diffDays);
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 animate-pulse">
          <AlertTriangle size={12} />
          <span>Overdue by {daysOverdue} {daysOverdue === 1 ? "day" : "days"} (Due {item.endDate})</span>
        </span>
      );
    }

    if (diffDays === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <Clock size={12} />
          <span>Due Today</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-muted text-muted-foreground border border-border">
        <Clock size={12} />
        <span>{diffDays} {diffDays === 1 ? "day" : "days"} left (Due {item.endDate})</span>
      </span>
    );
  };

  // Helper: Status badge style for the card box
  const getStatusBadgeStyle = (status: ContentStatus, isOverdue: boolean) => {
    if (isOverdue) {
      return "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30";
    }
    if (status === "public" || status === "live") {
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    }
    if (status === "review" || status === "reviews" || status === "checking") {
      return "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30";
    }
    if (status === "editing") {
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
    }
    if (status === "scripting" || status === "shooting") {
      return "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30";
    }
    return "bg-primary/15 text-primary border-primary/30";
  };

  // Handle stage advancing
  const handleAdvanceStage = (item: ContentItem) => {
    if (item.type === "organic") {
      const curIdx = ORGANIC_ORDER.indexOf(item.status as OrganicContentStatus);
      if (curIdx < ORGANIC_ORDER.length - 1) {
        moveContentStatus(item.id, ORGANIC_ORDER[curIdx + 1]);
      }
    } else {
      const curIdx = AD_ORDER.indexOf(item.status as AdContentStatus);
      if (curIdx < AD_ORDER.length - 1) {
        moveContentStatus(item.id, AD_ORDER[curIdx + 1]);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner Ribbon */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Content Engine
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              Proaffiliaters Media Studio
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-foreground tracking-tight">
            Content Manager
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-2xl">
            Track video production from research to publish, and monitor active paid ad creatives with automated deadline alerts.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onOpenAddModal(activeTab)}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={15} />
            <span>{activeTab === "organic" ? "+ New Video" : "+ New Ad Creative"}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-card border border-border flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <Video size={18} />
          </div>
          <div>
            <div className="text-lg font-heading font-extrabold text-foreground leading-tight">
              {stats.organicInFlightCount}
            </div>
            <div className="text-[11px] font-medium text-muted-foreground">
              Organic in Production
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Target size={18} />
          </div>
          <div>
            <div className="text-lg font-heading font-extrabold text-foreground leading-tight">
              {stats.adsActiveCount}
            </div>
            <div className="text-[11px] font-medium text-muted-foreground">
              Active Ads Running
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${
            stats.contentOverdueCount > 0
              ? "bg-red-500/15 text-red-600 dark:text-red-400 animate-pulse"
              : "bg-muted text-muted-foreground"
          }`}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <div className={`text-lg font-heading font-extrabold leading-tight ${
              stats.contentOverdueCount > 0 ? "text-red-600 dark:text-red-400" : "text-foreground"
            }`}>
              {stats.contentOverdueCount}
            </div>
            <div className="text-[11px] font-medium text-muted-foreground">
              Overdue Deadlines
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="text-lg font-heading font-extrabold text-foreground leading-tight">
              {stats.achievedContentCount}
            </div>
            <div className="text-[11px] font-medium text-muted-foreground">
              Achieved / Published
            </div>
          </div>
        </div>
      </div>

      {/* Main Controls Row: Tabs & View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 rounded-2xl bg-card border border-border">
        {/* 2 Primary Tabs: Organic Videos vs Paid Ads */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("organic")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "organic"
                ? "bg-card text-primary shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Video size={14} />
            <span>Organic Videos</span>
            <span className="px-1.5 py-0.2 rounded-md bg-muted text-[10px] font-mono">
              {organicActiveCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ad")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "ad"
                ? "bg-card text-purple-600 dark:text-purple-400 shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Target size={14} />
            <span>Paid Ads Manager</span>
            <span className="px-1.5 py-0.2 rounded-md bg-muted text-[10px] font-mono">
              {adsActiveCount}
            </span>
          </button>
        </div>

        {/* View Mode Toggle: Active Pipeline vs Achieved Videos */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center p-1 bg-muted/60 rounded-xl border border-border text-xs">
            <button
              type="button"
              onClick={() => setViewMode("active")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "active"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles size={13} className="text-primary" />
              <span>Active Pipeline</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("archived")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "archived"
                  ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Archive size={13} />
              <span>Achieved Videos</span>
              <span className="px-1.5 py-0.2 rounded-md bg-muted text-[10px] font-mono">
                {achievedCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Platform Filter Ribbon */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-3 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab === "organic" ? "organic videos" : "ads"} by title, hook, platform, creator...`}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="all">All Platforms</option>
            <option value="YouTube">YouTube</option>
            <option value="Instagram Reels">Instagram Reels</option>
            <option value="YouTube Shorts">YouTube Shorts</option>
            <option value="Telegram">Telegram</option>
            <option value="Facebook Ads">Facebook Ads</option>
            <option value="Google Ads">Google Ads</option>
            <option value="Twitter/X">Twitter/X</option>
          </select>

          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="all">All Stages</option>
            {activeTab === "organic" ? (
              <>
                <option value="researching">Researching</option>
                <option value="scripting">Scripting</option>
                <option value="shooting">Shooting</option>
                <option value="editing">Editing</option>
                <option value="review">Review</option>
                <option value="public">Public (Done)</option>
              </>
            ) : (
              <>
                <option value="researching">Researching</option>
                <option value="scripting">Scripting</option>
                <option value="shooting">Shooting</option>
                <option value="checking">Checking</option>
                <option value="reviews">Reviews</option>
                <option value="live">Live (Active)</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Content Cards Container */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-dashed border-border flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
            {activeTab === "organic" ? <Video size={24} /> : <Target size={24} />}
          </div>
          <h3 className="text-base font-heading font-extrabold text-foreground mb-1">
            {viewMode === "active"
              ? `No active ${activeTab === "organic" ? "organic videos" : "ads"} found`
              : `No achieved ${activeTab === "organic" ? "videos" : "ads"} archived yet`}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">
            {viewMode === "active"
              ? "Start a new video or campaign creative and guide it through its 6-stage production pipeline."
              : "Completed videos marked as Public or Live will automatically appear here in the Achieved Archive."}
          </p>
          {viewMode === "active" && (
            <button
              type="button"
              onClick={() => onOpenAddModal(activeTab)}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all flex items-center gap-2"
            >
              <Plus size={14} />
              <span>Create First {activeTab === "organic" ? "Video" : "Ad"}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isOverdue = isItemOverdue(item);
            const stagesList = item.type === "organic" ? ORGANIC_ORDER : AD_ORDER;
            const currentStageIndex = stagesList.indexOf(item.status as any);
            const isDone = item.status === "public" || item.status === "live";

            return (
              <div
                key={item.id}
                className={`group p-3.5 sm:p-4 rounded-xl transition-all duration-200 border ${
                  isOverdue
                    ? "bg-red-500/5 dark:bg-red-950/20 border-red-500/60 shadow-md shadow-red-500/10 ring-1 ring-red-500/30"
                    : "bg-card border-border hover:border-primary/40 shadow-xs hover:shadow-md"
                }`}
              >
                {/* Top Row: Meta badges, Platform, Deadline & Quick Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/40">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Platform Chip */}
                    <span className="px-2 py-0.5 rounded-lg text-[11px] font-extrabold bg-muted text-foreground border border-border flex items-center gap-1.5">
                      {item.type === "organic" ? (
                        <Video size={11} className="text-primary" />
                      ) : (
                        <Target size={11} className="text-purple-500" />
                      )}
                      <span>{item.platform || "YouTube"}</span>
                    </span>

                    {/* Deadline Pill / Overdue Badge */}
                    {getDeadlineBadge(item)}

                    {/* Creator avatar */}
                    {item.assignee && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 pl-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.assignee.avatar || "/founder.jpg"}
                          alt={item.assignee.name}
                          className="w-3.5 h-3.5 rounded-full object-cover border border-border"
                        />
                        <span>{item.assignee.name}</span>
                      </span>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                    {/* Live link if available */}
                    {item.publishedUrl && (
                      <a
                        href={item.publishedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/25 transition-all flex items-center gap-1"
                        title="Open live published URL"
                      >
                        <ExternalLink size={11} />
                        <span>Watch Live</span>
                      </a>
                    )}

                    {/* Script link if available */}
                    {item.scriptUrl && (
                      <a
                        href={item.scriptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                        title="Open Script Document"
                      >
                        <FileText size={13} />
                      </a>
                    )}

                    {/* Raw Footage folder if available */}
                    {item.rawFootageUrl && (
                      <a
                        href={item.rawFootageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                        title="Open Raw Footage Folder"
                      >
                        <Film size={13} />
                      </a>
                    )}

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => onOpenEditModal(item)}
                      className="p-1 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                      title="Edit Content Item"
                    >
                      <Edit2 size={13} />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete "${item.title}"?`)) {
                          deleteContentItem(item.id);
                        }
                      }}
                      className="p-1 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                      title="Delete Content Item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Middle: Video Title on Left & Current Status in highlighted box on Right */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1.5 sm:py-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-heading font-extrabold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {item.title}
                    </h3>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 leading-relaxed">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Status Select Container & Actions in the highlighted box */}
                  <div className="shrink-0 flex items-center gap-2">
                    {/* Status Select Input Container */}
                    <div
                      className={`relative inline-flex items-center rounded-xl border transition-all ${getStatusBadgeStyle(
                        item.status,
                        isOverdue
                      )}`}
                    >
                      <span className="absolute left-2.5 pointer-events-none flex items-center text-current">
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      </span>
                      <select
                        value={item.status}
                        onChange={(e) => moveContentStatus(item.id, e.target.value as ContentStatus)}
                        className="appearance-none bg-transparent pl-6 pr-7 py-1 text-xs font-extrabold cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-xl"
                        title="Change production stage"
                      >
                        {stagesList.map((st, idx) => (
                          <option key={st} value={st} className="bg-card text-foreground font-semibold py-1">
                            {idx + 1}. {STAGE_LABELS[st].replace(" (Done)", "").replace(" (Active)", "")}
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-2 pointer-events-none text-current opacity-70">
                        <ChevronDown size={13} />
                      </span>
                    </div>

                    {/* Quick Step Advance Button */}
                    {!isDone && (
                      <button
                        type="button"
                        onClick={() => handleAdvanceStage(item)}
                        className="px-2.5 py-1 rounded-xl text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 transition-all flex items-center gap-1 shrink-0"
                        title="Advance to next production stage"
                      >
                        <span>Next</span>
                        <ChevronRight size={12} />
                      </button>
                    )}

                    {/* Archived toggle if Done */}
                    {isDone && (
                      <button
                        type="button"
                        onClick={() => archiveContentItem(item.id, !item.isArchived)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 shrink-0 ${
                          item.isArchived
                            ? "bg-muted text-muted-foreground border-border hover:text-foreground"
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"
                        }`}
                      >
                        <Archive size={12} />
                        <span>{item.isArchived ? "Archived" : "Archive"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Lower Row: Script Manager (Left Box) & Performance Data (Right Box) */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-border/40">
                  {/* Left Box: Script Manager */}
                  <div className="flex items-center">
                    {item.scriptAttachment || item.scriptUrl ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-primary/10 text-primary border border-primary/25 hover:bg-primary/15 transition-all">
                        {item.scriptAttachment?.format === "pdf" ? (
                          <FileCheck size={13} className="text-red-500" />
                        ) : item.scriptAttachment?.format === "image" ? (
                          <ImageIcon size={13} className="text-amber-500" />
                        ) : (
                          <FileText size={13} className="text-primary" />
                        )}
                        <button
                          type="button"
                          onClick={() => setScriptModalItem(item)}
                          className="hover:underline truncate max-w-[170px] sm:max-w-[240px] text-left"
                          title="View / Manage Script Document"
                        >
                          {item.scriptAttachment?.name || "View Script"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setScriptModalItem(item)}
                          className="p-0.5 rounded hover:bg-primary/20 transition-colors ml-0.5"
                          title="Edit Script"
                        >
                          <Edit2 size={11} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setScriptModalItem(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border border-dashed transition-all"
                        title="Add Script (Docs, PDF, or Image)"
                      >
                        <Plus size={12} className="text-primary" />
                        <span>Add Script</span>
                      </button>
                    )}
                  </div>

                  {/* Right Box: Performance Data & Analytics */}
                  <div className="flex items-center">
                    {item.stats && Object.keys(item.stats).length > 0 && (item.stats.views || item.stats.spend || item.stats.clicks || item.stats.conversions || item.stats.roas) ? (
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl text-xs font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/25 hover:bg-purple-500/15 transition-all">
                        <BarChart2 size={13} className="text-purple-600 dark:text-purple-400 shrink-0" />
                        <span className="truncate max-w-[200px] sm:max-w-[280px]">
                          {item.type === "organic"
                            ? [
                                item.stats.views ? `${item.stats.views} Views` : null,
                                item.stats.likes ? `${item.stats.likes} Likes` : null,
                                item.stats.clicks ? `${item.stats.clicks} Clicks` : null,
                              ]
                                .filter(Boolean)
                                .join(" • ") || "Analytics Tracked"
                            : [
                                item.stats.spend ? `${item.stats.spend} Spend` : null,
                                item.stats.roas ? `${item.stats.roas} ROAS` : null,
                                item.stats.conversions ? `${item.stats.conversions}` : null,
                              ]
                                .filter(Boolean)
                                .join(" • ") || "Ad Stats Tracked"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setStatsModalItem(item)}
                          className="p-0.5 rounded hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 transition-colors ml-0.5"
                          title="Edit Analytics Data"
                        >
                          <Edit2 size={11} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setStatsModalItem(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border border-dashed transition-all"
                        title={item.type === "organic" ? "Add Video Performance Data" : "Add Ad Metrics & ROAS"}
                      >
                        <BarChart2 size={12} className="text-purple-500" />
                        <span>Add Data</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Script Modal Dialog */}
      <ContentScriptModal
        isOpen={Boolean(scriptModalItem)}
        item={scriptModalItem}
        onClose={() => setScriptModalItem(null)}
        onSave={(attachment, url) => {
          if (scriptModalItem) {
            updateContentItem(scriptModalItem.id, {
              scriptAttachment: attachment,
              scriptUrl: url || "",
            });
            setScriptModalItem((prev) =>
              prev ? { ...prev, scriptAttachment: attachment, scriptUrl: url || "" } : null
            );
          }
        }}
      />

      {/* Stats & Analytics Modal Dialog */}
      <ContentStatsModal
        isOpen={Boolean(statsModalItem)}
        item={statsModalItem}
        onClose={() => setStatsModalItem(null)}
        onSave={(newStats) => {
          if (statsModalItem) {
            updateContentItem(statsModalItem.id, { stats: newStats });
            setStatsModalItem((prev) => (prev ? { ...prev, stats: newStats } : null));
          }
        }}
      />
    </div>
  );
};

/**
 * ============================================================================
 * FOOTER BLOCK: components/ContentManagerView.tsx Implementation Notes & Caveats
 * ============================================================================
 * - Workflow: Dual Organic/Ads tabs, active/archived sub-views, 6-stage steppers.
 * - Deadline Watchdog: Applies red border and pulsing crimson alert state
 *   EXCLUSIVELY to Organic Videos whose endDate is past due (ads remain neutral).
 * - Live Integration: Direct links to scripts, raw footage, and published assets.
 * ============================================================================
 */
