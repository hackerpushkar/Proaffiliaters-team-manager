/**
 * ============================================================================
 * HEADER BLOCK: components/ContentStatsModal.tsx — Performance & Analytics Editor
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Provides an interactive modal dialog to record, track, and update performance
 * metrics and conversion statistics for Content Pieces and Paid Ads:
 * - Organic Video Metrics: Views, Likes, Comments, Clicks, Retention/Watch Time
 * - Paid Ad Metrics: Spend (₹/$), Impressions, Clicks, Conversions/Leads, ROAS, CPC
 * - Custom qualitative notes and timestamped iteration history
 * - Supports editing at any time as analytics change over time
 *
 * WHY THIS FILE EXISTS:
 * Fulfills user request: "Another is Add Data ( its info about video like stats
 * and other things ) if add then show and analytis change by tiem so also give
 * option to edit ... this for video and for ads same".
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Triggered from the card's "+ Add Data" or "Edit Data" button; dispatches
 * updateContentItem in useTaskStore with persistent MongoDB syncing.
 * ============================================================================
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  BarChart2,
  TrendingUp,
  Eye,
  Heart,
  MessageSquare,
  MousePointerClick,
  DollarSign,
  Users,
  Clock,
  Sparkles,
  Trash2,
  Calendar,
} from "lucide-react";
import { ContentItem, ContentStats } from "@/lib/types";

interface ContentStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem | null;
  onSave: (stats: ContentStats | undefined) => void;
}

export const ContentStatsModal: React.FC<ContentStatsModalProps> = ({
  isOpen,
  onClose,
  item,
  onSave,
}) => {
  const [views, setViews] = useState("");
  const [likes, setLikes] = useState("");
  const [comments, setComments] = useState("");
  const [clicks, setClicks] = useState("");
  const [spend, setSpend] = useState("");
  const [conversions, setConversions] = useState("");
  const [roas, setRoas] = useState("");
  const [cpc, setCpc] = useState("");
  const [impressions, setImpressions] = useState("");
  const [customNotes, setCustomNotes] = useState("");

  useEffect(() => {
    if (item && item.stats) {
      setViews(item.stats.views || "");
      setLikes(item.stats.likes || "");
      setComments(item.stats.comments || "");
      setClicks(item.stats.clicks || "");
      setSpend(item.stats.spend || "");
      setConversions(item.stats.conversions || "");
      setRoas(item.stats.roas || "");
      setCpc(item.stats.cpc || "");
      setImpressions(item.stats.impressions || "");
      setCustomNotes(item.stats.customNotes || "");
    } else {
      setViews("");
      setLikes("");
      setComments("");
      setClicks("");
      setSpend("");
      setConversions("");
      setRoas("");
      setCpc("");
      setImpressions("");
      setCustomNotes("");
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const isOrganic = item.type === "organic";

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const todayDate = new Date().toISOString().split("T")[0];

    const statsPayload: ContentStats = {
      views: views.trim() || undefined,
      likes: likes.trim() || undefined,
      comments: comments.trim() || undefined,
      clicks: clicks.trim() || undefined,
      spend: spend.trim() || undefined,
      conversions: conversions.trim() || undefined,
      roas: roas.trim() || undefined,
      cpc: cpc.trim() || undefined,
      impressions: impressions.trim() || undefined,
      customNotes: customNotes.trim() || undefined,
      updatedAt: todayDate,
    };

    onSave(statsPayload);
    onClose();
  };

  const handleClear = () => {
    if (confirm("Remove all performance stats from this content item?")) {
      onSave(undefined);
      onClose();
    }
  };

  const hasExistingStats = Boolean(item.stats && Object.keys(item.stats).length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
              <BarChart2 size={18} />
            </div>
            <div>
              <h2 className="text-base font-heading font-extrabold text-foreground">
                {hasExistingStats
                  ? isOrganic
                    ? "Edit Video Performance Data"
                    : "Edit Ad Performance Data"
                  : isOrganic
                  ? "Add Video Analytics & Stats"
                  : "Add Ad Performance & ROAS"}
              </h2>
              <p className="text-xs text-muted-foreground line-clamp-1">{item.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Last Updated Banner */}
        {item.stats?.updatedAt && (
          <div className="px-4 py-2 bg-muted/40 border-b border-border flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar size={12} className="text-primary" />
              <span>Last Updated: {item.stats.updatedAt}</span>
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
            >
              <Trash2 size={11} />
              <span>Clear Data</span>
            </button>
          </div>
        )}

        {/* Inputs Form */}
        <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {isOrganic ? (
            /* Organic Video Metrics */
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
                    <Eye size={12} className="text-primary" />
                    <span>Views</span>
                  </label>
                  <input
                    type="text"
                    value={views}
                    onChange={(e) => setViews(e.target.value)}
                    placeholder="e.g. 18.5K or 18500"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
                    <Heart size={12} className="text-red-500" />
                    <span>Likes</span>
                  </label>
                  <input
                    type="text"
                    value={likes}
                    onChange={(e) => setLikes(e.target.value)}
                    placeholder="e.g. 1.2K"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
                    <MessageSquare size={12} className="text-amber-500" />
                    <span>Comments</span>
                  </label>
                  <input
                    type="text"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="e.g. 140"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
                    <MousePointerClick size={12} className="text-emerald-500" />
                    <span>Clicks / Link Visits</span>
                  </label>
                  <input
                    type="text"
                    value={clicks}
                    onChange={(e) => setClicks(e.target.value)}
                    placeholder="e.g. 420"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
                  <Clock size={12} className="text-purple-500" />
                  <span>Avg Watch Time / Retention</span>
                </label>
                <input
                  type="text"
                  value={conversions}
                  onChange={(e) => setConversions(e.target.value)}
                  placeholder="e.g. 3m 45s (58% retention)"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
          ) : (
            /* Paid Ad Creative Metrics */
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
                    <DollarSign size={12} className="text-amber-500" />
                    <span>Ad Spend</span>
                  </label>
                  <input
                    type="text"
                    value={spend}
                    onChange={(e) => setSpend(e.target.value)}
                    placeholder="e.g. ₹6,500 or $80"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
                    <TrendingUp size={12} className="text-emerald-500" />
                    <span>ROAS</span>
                  </label>
                  <input
                    type="text"
                    value={roas}
                    onChange={(e) => setRoas(e.target.value)}
                    placeholder="e.g. 3.8x"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
                    <Users size={12} className="text-primary" />
                    <span>Conversions / Leads</span>
                  </label>
                  <input
                    type="text"
                    value={conversions}
                    onChange={(e) => setConversions(e.target.value)}
                    placeholder="e.g. 48 Leads"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
                    <MousePointerClick size={12} className="text-purple-500" />
                    <span>Link Clicks</span>
                  </label>
                  <input
                    type="text"
                    value={clicks}
                    onChange={(e) => setClicks(e.target.value)}
                    placeholder="e.g. 950"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
                    <Eye size={12} className="text-muted-foreground" />
                    <span>Impressions</span>
                  </label>
                  <input
                    type="text"
                    value={impressions}
                    onChange={(e) => setImpressions(e.target.value)}
                    placeholder="e.g. 52,000"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
                    <DollarSign size={12} className="text-muted-foreground" />
                    <span>Cost Per Click (CPC)</span>
                  </label>
                  <input
                    type="text"
                    value={cpc}
                    onChange={(e) => setCpc(e.target.value)}
                    placeholder="e.g. ₹6.8"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Qualitative Notes */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Performance Notes & Learnings
            </label>
            <textarea
              rows={3}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. High CTR observed from 7 PM - 11 PM. Telegram affiliate pin generated strong engagement."
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-1.5"
            >
              <Sparkles size={13} />
              <span>{hasExistingStats ? "Update Data" : "Save Performance Data"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * FOOTER BLOCK: components/ContentStatsModal.tsx Implementation Notes
 * ============================================================================
 * - Workflow: Tailors form fields automatically for Organic Videos vs Paid Ads.
 * - Time-Series Tracking: Stamps updatedAt timestamp for dynamic audit history.
 * ============================================================================
 */
