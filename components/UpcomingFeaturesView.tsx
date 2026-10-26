/**
 * ============================================================================
 * HEADER BLOCK: components/UpcomingFeaturesView.tsx — Upcoming Features Pipeline
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Implements the Upcoming Features Innovation & Research Hub:
 * - 1-Line full-width linear container list (replacing old 2x2 grid)
 * - 4 Enterprise Lifecycle Phases: Thinking, Research, Ready to Go, Future Build
 * - Full-Page Feature Detail Workspace: Click any container to open full-page view
 * - Research Points & Document attachments tracking
 * - 1-Click "▶ Start Feature": Converts research points automatically into tasks in Ongoing Projects
 *
 * WHY THIS FILE EXISTS:
 * Fulfills user request: "rename it to Upcoming Features and make i line one container
 * and also for this we can add points after done research we can also upload some documents
 * and give a button a start then our points become task automatically
 * and other pases like future build , thinking , research , ready to go
 * and when we click on container and show full page view for that upcoming projects".
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Dispatches feature updates and project conversion to useTaskStore; renders
 * either the 1-line feature stream or FeatureDetailView for full-page inspection.
 * ============================================================================
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Lightbulb,
  Plus,
  ThumbsUp,
  Sparkles,
  Calendar,
  User,
  Tag,
  Filter,
  Trash2,
  Edit2,
  CheckCircle2,
  FileText,
  Rocket,
  ArrowRight,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { UpcomingFeature, FeaturePriority, FeatureStatus } from "@/lib/types";
import { FeatureDetailView } from "./FeatureDetailView";

interface UpcomingFeaturesViewProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (feature: UpcomingFeature) => void;
}

export const UpcomingFeaturesView: React.FC<UpcomingFeaturesViewProps> = ({
  onOpenAddModal,
  onOpenEditModal,
}) => {
  const {
    features,
    deleteFeature,
    voteFeature,
    startFeatureAsProject,
    searchQuery,
  } = useTaskStore();

  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const filteredFeatures = useMemo(() => {
    return features.filter((feat) => {
      // Search query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = feat.name.toLowerCase().includes(q);
        const matchesDesc = feat.description.toLowerCase().includes(q);
        const matchesAuthor = feat.author.toLowerCase().includes(q);
        const matchesTag = (feat.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesAuthor && !matchesTag) return false;
      }

      // Status filter
      if (statusFilter !== "all" && feat.status !== statusFilter) return false;

      // Priority filter
      if (priorityFilter !== "all" && feat.priority !== priorityFilter) return false;

      return true;
    });
  }, [features, searchQuery, statusFilter, priorityFilter]);

  const getPriorityBadge = (priority: FeaturePriority) => {
    switch (priority) {
      case "critical":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      case "high":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "medium":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
      case "low":
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
    }
  };

  const getPhaseInfo = (status: FeatureStatus) => {
    switch (status) {
      case "thinking":
        return {
          label: "Thinking",
          icon: "💡",
          color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        };
      case "research":
        return {
          label: "Research",
          icon: "🔬",
          color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        };
      case "ready_to_go":
        return {
          label: "Ready to Go",
          icon: "🚀",
          color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        };
      case "future_build":
        return {
          label: "Future Build",
          icon: "⏳",
          color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        };
      case "in_progress":
        return {
          label: "In Progress",
          icon: "⚡",
          color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
        };
      default:
        return {
          label: status,
          icon: "📌",
          color: "bg-muted text-muted-foreground border-border",
        };
    }
  };

  const handleStartFeature = (e: React.MouseEvent, feature: UpcomingFeature) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Start "${feature.name}"?\n\nThis will automatically create a new Ongoing Project and convert all ${feature.points?.length || 0} research points into sprint tasks.`
    );
    if (!confirmed) return;

    startFeatureAsProject(feature.id);
  };

  // If a feature is selected, render the dedicated Full-Page Feature Detail View
  if (selectedFeatureId) {
    return (
      <FeatureDetailView
        featureId={selectedFeatureId}
        onBack={() => setSelectedFeatureId(null)}
        onEditFeature={(f) => {
          setSelectedFeatureId(null);
          onOpenEditModal(f);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 animate-fadeIn pb-12">
      {/* Top Banner & Command Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-foreground tracking-tight">
                Upcoming Features
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 uppercase">
                Research & Execution Pipeline
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Break down ideas into research points, attach reference docs, and 1-click start to generate sprint tasks.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary/90 shadow-sm transition-all shrink-0 active:scale-95"
        >
          <Plus size={15} />
          <span>Propose Feature</span>
        </button>
      </div>

      {/* Filter and Phase Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-card border border-border shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
            <Filter size={14} />
            <span className="font-medium">Phase:</span>
          </div>

          {/* Phase Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {[
              { id: "all", label: "All Phases", icon: "✨" },
              { id: "thinking", label: "Thinking", icon: "💡" },
              { id: "research", label: "Research", icon: "🔬" },
              { id: "ready_to_go", label: "Ready to Go", icon: "🚀" },
              { id: "future_build", label: "Future Build", icon: "⏳" },
              { id: "in_progress", label: "In Progress", icon: "⚡" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  statusFilter === tab.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* 1-Line Container Full-Width Stack */}
      {filteredFeatures.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-card border border-border shadow-xs">
          <Lightbulb size={36} className="text-muted-foreground mb-3 opacity-60" />
          <h3 className="text-sm font-semibold text-foreground">No upcoming features found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
              ? "Try adjusting your search query or phase filter."
              : "Be the first team member to write an upcoming feature proposal!"}
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-white"
          >
            <Plus size={14} />
            <span>Propose Feature</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredFeatures.map((feat) => {
            const phase = getPhaseInfo(feat.status);
            const pointsCount = feat.points?.length || 0;
            const completedPointsCount = (feat.points || []).filter((p) => p.completed).length;
            const docsCount = feat.documents?.length || 0;

            return (
              <div
                key={feat.id}
                onClick={() => setSelectedFeatureId(feat.id)}
                className="group relative flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all cursor-pointer overflow-hidden"
              >
                {/* Left Accent indicator line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Main Content Block */}
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  {/* Meta Pills Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Phase Badge */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs ${phase.color}`}>
                      <span>{phase.icon}</span>
                      <span>{phase.label}</span>
                    </span>

                    {/* Priority Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPriorityBadge(feat.priority)}`}>
                      {feat.priority}
                    </span>

                    {/* Target Timeline */}
                    <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground px-2 py-0.5 rounded-md bg-muted/60">
                      <Calendar size={11} className="text-primary" />
                      <span>{feat.targetTimeline}</span>
                    </div>

                    {/* Author */}
                    <span className="text-[11px] text-muted-foreground hidden sm:inline">
                      by {feat.author}
                    </span>
                  </div>

                  {/* Feature Title */}
                  <h3 className="text-base font-heading font-extrabold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                    <span>{feat.name}</span>
                    <ChevronRight size={15} className="text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h3>

                  {/* Feature Description snippet */}
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {feat.description}
                  </p>

                  {/* Research Points & Docs Badges Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {/* Points Count Pill */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/70 text-foreground border border-border text-[11px] font-medium">
                      <CheckCircle2 size={12} className={pointsCount > 0 ? "text-emerald-500" : "text-muted-foreground"} />
                      <span>
                        {pointsCount > 0
                          ? `${completedPointsCount}/${pointsCount} Research Points`
                          : "0 Research Points"}
                      </span>
                    </div>

                    {/* Docs Count Pill */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/70 text-foreground border border-border text-[11px] font-medium">
                      <FileText size={12} className={docsCount > 0 ? "text-primary" : "text-muted-foreground"} />
                      <span>{docsCount} {docsCount === 1 ? "Doc" : "Docs"}</span>
                    </div>

                    {/* Tags */}
                    {feat.tags && feat.tags.slice(0, 3).map((t, i) => (
                      <span key={i} className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Action Block */}
                <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
                  {/* Upvote Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      voteFeature(feat.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      feat.hasVoted
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted/70 hover:bg-muted text-foreground border border-border"
                    }`}
                    title="Upvote feature"
                  >
                    <ThumbsUp size={13} className={feat.hasVoted ? "fill-current" : ""} />
                    <span>{feat.votes}</span>
                  </button>

                  {/* Start Feature / Convert to Project Button */}
                  {feat.status !== "in_progress" ? (
                    <button
                      type="button"
                      onClick={(e) => handleStartFeature(e, feat)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-primary to-indigo-600 text-white text-xs font-bold shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
                      title="Convert this feature and its research points into an Ongoing Project with actionable tasks"
                    >
                      <Rocket size={13} />
                      <span>Start Feature</span>
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      <span>In Progress</span>
                    </span>
                  )}

                  {/* Edit button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEditModal(feat);
                    }}
                    className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                    title="Edit Feature"
                  >
                    <Edit2 size={14} />
                  </button>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete upcoming feature "${feat.name}"?`)) {
                        deleteFeature(feat.id);
                      }
                    }}
                    className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                    title="Delete Feature"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * ============================================================================
 * FOOTER BLOCK: components/UpcomingFeaturesView.tsx Implementation Notes
 * ============================================================================
 * - Layout: 1-line full-width containers; clicking any card opens FeatureDetailView.
 * - Lifecycle: Thinking, Research, Ready to Go, Future Build, In Progress.
 * - Start Engine: Automatically converts research points into sprint tasks in Ongoing Projects.
 * ============================================================================
 */
