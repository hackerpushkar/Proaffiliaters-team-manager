/**
 * ============================================================================
 * HEADER BLOCK: components/IdeaPlaygroundView.tsx — Idea Playground Hub
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Implements the master "Idea Playground" workspace where the entire team can:
 * - Post new ideas with categories, descriptions, and rationales
 * - Collaborate through real-time remarks and constructive feedback
 * - Upvote standout community ideas to bubble up trending concepts
 * - Track lifecycle states (Brainstorming -> Under Review -> Planned -> Converted)
 * - 1-Click Convert approved ideas into official Upcoming Features
 * - Filter by categories, "My Ideas", "Top Upvoted", or keyword search
 *
 * WHY THIS FILE EXISTS:
 * Fulfills the user request: "new feature name as idea playground ... make it
 * after my tasks ... in these we can post our ideas and some remark with these
 * idea anybody on platform can send idea".
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Renders as a dedicated primary tab right after "My Tasks". Interacts with
 * useTaskStore (ideas, addIdea, updateIdea, deleteIdea, upvoteIdea, addIdeaRemark,
 * convertIdeaToFeature) with persistent cloud synchronization.
 * ============================================================================
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Lightbulb,
  Plus,
  Sparkles,
  Search,
  Filter,
  ThumbsUp,
  MessageSquare,
  Rocket,
  Edit2,
  Trash2,
  Tag,
  CheckCircle2,
  Send,
  Flame,
  User,
  ArrowRight,
  TrendingUp,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { Idea, IdeaCategory, IdeaStatus } from "@/lib/types";

interface IdeaPlaygroundViewProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (idea: Idea) => void;
}

const CATEGORY_COLORS: Record<IdeaCategory, string> = {
  Product: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
  Automation: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
  Growth: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25",
  Marketing: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
  "UI/UX": "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/25",
  "Internal Tool": "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25",
  Other: "bg-muted text-muted-foreground border-border",
};

const STATUS_CONFIG: Record<
  IdeaStatus,
  { label: string; badge: string; dot: string }
> = {
  brainstorming: {
    label: "Brainstorming",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    dot: "bg-amber-500",
  },
  under_review: {
    label: "Under Review",
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
    dot: "bg-blue-500",
  },
  planned: {
    label: "Approved / Planned",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    dot: "bg-emerald-500",
  },
  converted: {
    label: "Converted to Feature",
    badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25",
    dot: "bg-purple-500",
  },
  archived: {
    label: "Archived",
    badge: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
};

export const IdeaPlaygroundView: React.FC<IdeaPlaygroundViewProps> = ({
  onOpenAddModal,
  onOpenEditModal,
}) => {
  const {
    ideas,
    currentUser,
    deleteIdea,
    upvoteIdea,
    addIdeaRemark,
    convertIdeaToFeature,
    updateIdea,
  } = useTaskStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeFilterTab, setActiveFilterTab] = useState<
    "all" | "trending" | "my_ideas" | "planned" | "converted"
  >("all");
  const [expandedRemarks, setExpandedRemarks] = useState<Record<string, boolean>>({});
  const [remarkInputs, setRemarkInputs] = useState<Record<string, string>>({});

  const userEmail = currentUser?.email || "pushkar@proaffiliaters.com";

  // Toggle remarks dropdown
  const toggleRemarks = (ideaId: string) => {
    setExpandedRemarks((prev) => ({ ...prev, [ideaId]: !prev[ideaId] }));
  };

  // Handle submitting a remark on an idea
  const handlePostRemark = (ideaId: string) => {
    const text = remarkInputs[ideaId];
    if (!text || !text.trim()) return;

    addIdeaRemark(ideaId, text.trim());
    setRemarkInputs((prev) => ({ ...prev, [ideaId]: "" }));
    setExpandedRemarks((prev) => ({ ...prev, [ideaId]: true }));
  };

  // Convert Idea to Feature with confirmation
  const handleConvert = (idea: Idea) => {
    if (idea.status === "converted") {
      alert("This idea has already been converted into an Upcoming Feature.");
      return;
    }
    if (
      confirm(
        `Convert "${idea.title}" into an official Upcoming Feature on the roadmap?`
      )
    ) {
      const createdFeature = convertIdeaToFeature(idea.id);
      if (createdFeature) {
        alert(
          `Success! "${idea.title}" has been converted to an Upcoming Feature in Q1 2027.`
        );
      }
    }
  };

  // Delete Idea with confirmation
  const handleDelete = (idea: Idea) => {
    if (confirm(`Delete idea "${idea.title}"?`)) {
      deleteIdea(idea.id);
    }
  };

  // KPI Metrics calculation
  const totalIdeas = ideas.length;
  const brainstormingCount = ideas.filter(
    (i) => i.status === "brainstorming" || i.status === "under_review"
  ).length;
  const totalUpvotes = ideas.reduce((acc, i) => acc + (i.upvotes?.length || 0), 0);
  const convertedCount = ideas.filter((i) => i.status === "converted").length;

  // Filtered & Sorted Ideas
  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      // 1. Category Filter
      if (selectedCategory !== "all" && idea.category !== selectedCategory) {
        return false;
      }

      // 2. Tab Filter
      if (activeFilterTab === "my_ideas") {
        const isMine =
          idea.author?.email?.toLowerCase() === userEmail.toLowerCase() ||
          idea.author?.name?.toLowerCase().includes(currentUser?.name?.toLowerCase() || "");
        if (!isMine) return false;
      } else if (activeFilterTab === "planned") {
        if (idea.status !== "planned") return false;
      } else if (activeFilterTab === "converted") {
        if (idea.status !== "converted") return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = idea.title.toLowerCase().includes(q);
        const matchesDesc = idea.description.toLowerCase().includes(q);
        const matchesAuthor = idea.author?.name?.toLowerCase().includes(q);
        const matchesTag = idea.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesAuthor && !matchesTag) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (activeFilterTab === "trending") {
        return (b.upvotes?.length || 0) - (a.upvotes?.length || 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [ideas, selectedCategory, activeFilterTab, searchQuery, userEmail, currentUser?.name]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-card via-card to-primary/5 border border-border shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider mb-2">
            <Lightbulb size={13} />
            <span>Open Innovation & Brainstorming</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-foreground">
            Idea Playground
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Have an idea to boost affiliate conversions, streamline bots, or improve our tools?
            Post it here, add your remarks, and collaborate with the team!
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Post New Idea</span>
        </button>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Ideas
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Lightbulb size={16} />
            </div>
          </div>
          <div className="text-2xl font-heading font-extrabold text-foreground mt-2">
            {totalIdeas}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Community submissions
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              In Review / Brainstorm
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="text-2xl font-heading font-extrabold text-foreground mt-2">
            {brainstormingCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Awaiting team consensus
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Upvotes
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Flame size={16} />
            </div>
          </div>
          <div className="text-2xl font-heading font-extrabold text-foreground mt-2">
            {totalUpvotes}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Teammate endorsements
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Converted to Roadmap
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Rocket size={16} />
            </div>
          </div>
          <div className="text-2xl font-heading font-extrabold text-foreground mt-2">
            {convertedCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Moved to Upcoming Features
          </div>
        </div>
      </div>

      {/* Filter Ribbon & Category Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveFilterTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeFilterTab === "all"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Ideas ({ideas.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilterTab("trending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeFilterTab === "trending"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Flame size={13} className="text-amber-500" />
            <span>Trending</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilterTab("my_ideas")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeFilterTab === "my_ideas"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Ideas
          </button>
          <button
            type="button"
            onClick={() => setActiveFilterTab("planned")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeFilterTab === "planned"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Planned
          </button>
          <button
            type="button"
            onClick={() => setActiveFilterTab("converted")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeFilterTab === "converted"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Converted
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ideas, authors, tags..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-card text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-border bg-card text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shrink-0"
          >
            <option value="all">All Categories</option>
            <option value="Product">Product</option>
            <option value="Automation">Automation</option>
            <option value="Growth">Growth</option>
            <option value="Marketing">Marketing</option>
            <option value="UI/UX">UI/UX</option>
            <option value="Internal Tool">Internal Tool</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Ideas Feed */}
      {filteredIdeas.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border border-dashed">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center mb-3">
            <Lightbulb size={28} />
          </div>
          <h3 className="text-base font-heading font-extrabold text-foreground">
            No Ideas Found in this View
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No ideas matched "${searchQuery}". Try a different keyword.`
              : "Be the first to post a new idea or pitch to the team!"}
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="mt-4 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all inline-flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Post the First Idea</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIdeas.map((idea) => {
            const hasUpvoted = idea.upvotes?.includes(userEmail);
            const statusMeta = STATUS_CONFIG[idea.status] || STATUS_CONFIG.brainstorming;
            const categoryStyle =
              CATEGORY_COLORS[idea.category] || CATEGORY_COLORS.Other;
            const isExpanded = Boolean(expandedRemarks[idea.id]);
            const remarkCount = idea.remarks?.length || 0;

            return (
              <div
                key={idea.id}
                className="group p-4 sm:p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                {/* Card Top: Author Info + Category & Status Pills */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/40">
                  <div className="flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={idea.author?.avatar || "/founder.jpg"}
                      alt={idea.author?.name || "Author"}
                      className="w-7 h-7 rounded-full object-cover border border-border shrink-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <span>{idea.author?.name || "Pushkar (Founder)"}</span>
                        {idea.author?.role && (
                          <span className="text-[10px] font-normal text-muted-foreground">
                            • {idea.author.role}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Posted {idea.createdAt}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                    {/* Category Pill */}
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold border ${categoryStyle}`}
                    >
                      {idea.category}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${statusMeta.badge}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                      <span>{statusMeta.label}</span>
                    </span>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => onOpenEditModal(idea)}
                      className="p-1 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all ml-1"
                      title="Edit Idea"
                    >
                      <Edit2 size={13} />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(idea)}
                      className="p-1 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                      title="Delete Idea"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Card Middle: Idea Title & Description */}
                <div className="py-3">
                  <h3 className="text-base sm:text-lg font-heading font-extrabold text-foreground group-hover:text-primary transition-colors">
                    {idea.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 whitespace-pre-wrap leading-relaxed">
                    {idea.description}
                  </p>

                  {/* Tags */}
                  {idea.tags && idea.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      {idea.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-mono font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions Bottom Row: Upvote + Remarks Toggle + Convert to Feature */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/40">
                  <div className="flex items-center gap-2">
                    {/* Upvote Button */}
                    <button
                      type="button"
                      onClick={() => upvoteIdea(idea.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        hasUpvoted
                          ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                          : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                      }`}
                      title={hasUpvoted ? "Remove upvote" : "Upvote this idea"}
                    >
                      <Lightbulb
                        size={14}
                        className={hasUpvoted ? "fill-white text-white" : "text-amber-500"}
                      />
                      <span>{idea.upvotes?.length || 0} Upvotes</span>
                    </button>

                    {/* Remarks Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleRemarks(idea.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        isExpanded
                          ? "bg-primary/10 text-primary border-primary/25"
                          : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                      }`}
                    >
                      <MessageSquare size={13} className="text-purple-500" />
                      <span>{remarkCount} Remarks</span>
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </div>

                  {/* Convert to Upcoming Feature Action */}
                  <div className="flex items-center gap-2">
                    {idea.status === "converted" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                        <CheckCircle2 size={13} />
                        <span>Added to Upcoming Features</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConvert(idea)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/25 transition-all flex items-center gap-1.5"
                        title="Promote this idea to an official Upcoming Feature"
                      >
                        <Rocket size={13} />
                        <span>Convert to Feature</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Collapsible Remarks Section */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border/40 space-y-3 animate-in fade-in duration-150">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare size={12} className="text-primary" />
                      <span>Team Remarks & Feedback ({remarkCount})</span>
                    </div>

                    {/* Remarks List */}
                    {remarkCount === 0 ? (
                      <p className="text-xs text-muted-foreground italic pl-1">
                        No remarks posted yet. Be the first to share your thoughts on this idea!
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {idea.remarks.map((rem) => (
                          <div
                            key={rem.id}
                            className="p-3 rounded-xl bg-muted/30 border border-border/60 flex items-start gap-2.5"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={rem.authorAvatar || "/founder.jpg"}
                              alt={rem.authorName}
                              className="w-6 h-6 rounded-full object-cover border border-border shrink-0 mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-foreground">
                                  {rem.authorName}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {rem.createdAt?.split("T")[0] || "Today"}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap leading-relaxed">
                                {rem.text}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inline Post Remark Input */}
                    <div className="flex items-center gap-2 pt-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentUser?.avatar || "/founder.jpg"}
                        alt={currentUser?.name || "Pushkar"}
                        className="w-7 h-7 rounded-full object-cover border border-border shrink-0"
                      />
                      <input
                        type="text"
                        value={remarkInputs[idea.id] || ""}
                        onChange={(e) =>
                          setRemarkInputs((prev) => ({
                            ...prev,
                            [idea.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handlePostRemark(idea.id);
                          }
                        }}
                        placeholder="Add your remark or feedback on this idea..."
                        className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => handlePostRemark(idea.id)}
                        disabled={!remarkInputs[idea.id]?.trim()}
                        className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                      >
                        <Send size={12} />
                        <span>Remark</span>
                      </button>
                    </div>
                  </div>
                )}
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
 * FOOTER BLOCK: components/IdeaPlaygroundView.tsx Implementation Notes
 * ============================================================================
 * - Workflow: Community idea submission, live upvoting, and remark thread discussions.
 * - Conversion Bridge: Promotes ideas to Upcoming Features with 1-click execution.
 * - Real-Time Synchronization: All actions persist through useTaskStore and MongoDB.
 * ============================================================================
 */
