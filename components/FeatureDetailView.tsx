/**
 * ============================================================================
 * HEADER BLOCK: components/FeatureDetailView.tsx — Full-Page Feature Workspace
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Provides an expansive full-page view for an individual Upcoming Feature:
 * - Direct back navigation to the main Upcoming Features list
 * - Interactive Phase Switcher (Thinking, Research, Ready to Go, Future Build)
 * - Research Points checklist engine: add, toggle, and delete actionable spec points
 * - Document & Resource Attachment hub: link research docs, PDFs, specs, and Figma/Notion URLs
 * - Research Notes & Findings editor with instant autosave / save button
 * - 1-Click "▶ Start Feature": Converts research points into prioritized tasks in Ongoing Projects
 *
 * WHY THIS FILE EXISTS:
 * Fulfills user requirement: "when we click on container and show full page view for that upcoming projects".
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Rendered by UpcomingFeaturesView when a feature container is clicked.
 * Interacts with useTaskStore to update feature fields, points, documents, and trigger conversion.
 * ============================================================================
 */

"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Sparkles,
  Rocket,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  FileText,
  ExternalLink,
  Link2,
  Calendar,
  User,
  ThumbsUp,
  Edit,
  Save,
  Check,
  AlertCircle,
  Lightbulb,
  FilePlus,
  Tag,
  ArrowRight,
} from "lucide-react";
import { UpcomingFeature, FeaturePriority, FeatureStatus, FeaturePoint, FeatureDocument } from "@/lib/types";
import { useTaskStore } from "@/lib/store";

interface FeatureDetailViewProps {
  featureId: string;
  onBack: () => void;
  onEditFeature: (feature: UpcomingFeature) => void;
}

export const FeatureDetailView: React.FC<FeatureDetailViewProps> = ({
  featureId,
  onBack,
  onEditFeature,
}) => {
  const {
    features,
    updateFeature,
    voteFeature,
    deleteFeature,
    startFeatureAsProject,
    addFeaturePoint,
    toggleFeaturePoint,
    deleteFeaturePoint,
    addFeatureDocument,
    deleteFeatureDocument,
    currentUser,
  } = useTaskStore();

  const feature = features.find((f) => f.id === featureId);

  // Local state for adding points
  const [newPointText, setNewPointText] = useState("");

  // Local state for adding documents
  const [showDocModal, setShowDocModal] = useState(false);
  const [docName, setDocName] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [docType, setDocType] = useState("spec");
  const [docSize, setDocSize] = useState("");

  // Local state for research notes
  const [notesText, setNotesText] = useState(feature?.notes || "");
  const [isSavedNotes, setIsSavedNotes] = useState(false);

  if (!feature) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground text-sm">Feature not found.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
        >
          Back to Upcoming Features
        </button>
      </div>
    );
  }

  const handleAddPointSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPointText.trim()) return;
    addFeaturePoint(feature.id, newPointText);
    setNewPointText("");
  };

  const handleAddDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !docUrl.trim()) return;
    addFeatureDocument(feature.id, {
      name: docName.trim(),
      url: docUrl.trim(),
      type: docType,
      size: docSize.trim() || "Web Link",
    });
    setDocName("");
    setDocUrl("");
    setDocSize("");
    setShowDocModal(false);
  };

  const handleSaveNotes = () => {
    updateFeature(feature.id, { notes: notesText });
    setIsSavedNotes(true);
    setTimeout(() => setIsSavedNotes(false), 2500);
  };

  const handlePhaseChange = (newStatus: FeatureStatus) => {
    updateFeature(feature.id, { status: newStatus });
  };

  const handleStartFeature = () => {
    const confirmed = window.confirm(
      `Start "${feature.name}"?\n\nThis will automatically create a new Ongoing Project and convert all ${feature.points?.length || 0} research points into sprint tasks.`
    );
    if (!confirmed) return;

    startFeatureAsProject(feature.id);
  };

  // Phase Badge Helpers
  const getPhaseInfo = (status: FeatureStatus) => {
    switch (status) {
      case "thinking":
        return {
          label: "Thinking",
          icon: "💡",
          color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          desc: "Initial concept & brainstorming",
        };
      case "research":
        return {
          label: "Research",
          icon: "🔬",
          color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          desc: "Gathering specs, APIs & docs",
        };
      case "ready_to_go":
        return {
          label: "Ready to Go",
          icon: "🚀",
          color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          desc: "Points refined & ready for build",
        };
      case "future_build":
        return {
          label: "Future Build",
          icon: "⏳",
          color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
          desc: "Scheduled for upcoming quarters",
        };
      case "in_progress":
        return {
          label: "In Progress",
          icon: "⚡",
          color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
          desc: "Active sprint project underway",
        };
      default:
        return {
          label: status,
          icon: "📌",
          color: "bg-muted text-muted-foreground border-border",
          desc: "",
        };
    }
  };

  const currentPhase = getPhaseInfo(feature.status);
  const completedPointsCount = (feature.points || []).filter((p) => p.completed).length;
  const totalPointsCount = feature.points?.length || 0;
  const pointsProgress = totalPointsCount > 0 ? Math.round((completedPointsCount / totalPointsCount) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-16 max-w-6xl mx-auto w-full">
      {/* Top Navigation & Action Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground p-2 rounded-xl hover:bg-muted/60 transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          <span>Back to Upcoming Features</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Start Feature / Convert to Project Button */}
          {feature.status !== "in_progress" ? (
            <button
              onClick={handleStartFeature}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-primary to-indigo-600 text-white text-xs font-bold shadow-md shadow-primary/20 hover:brightness-110 active:scale-98 transition-all flex items-center gap-2"
              title="Convert this feature and its research points into an Ongoing Project with actionable tasks"
            >
              <Rocket size={15} />
              <span>Start Feature (Convert to Tasks)</span>
            </button>
          ) : (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              <span>Active in Ongoing Projects</span>
            </div>
          )}

          <button
            onClick={() => onEditFeature(feature)}
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
            title="Edit Feature Details"
          >
            <Edit size={15} />
          </button>

          <button
            onClick={() => {
              if (window.confirm(`Delete upcoming feature "${feature.name}"?`)) {
                deleteFeature(feature.id);
                onBack();
              }
            }}
            className="p-2 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
            title="Delete Feature"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Accent top gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-purple-500 to-indigo-500" />

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            {/* Meta Tags Row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Phase Switcher Dropdown */}
              <div className="relative inline-flex items-center">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-xs ${currentPhase.color}`}>
                  <span>{currentPhase.icon}</span>
                  <span>{currentPhase.label}</span>
                </span>
                <select
                  value={feature.status}
                  onChange={(e) => handlePhaseChange(e.target.value as FeatureStatus)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  title="Change Lifecycle Phase"
                >
                  <option value="thinking">💡 Thinking (Initial Concept)</option>
                  <option value="research">🔬 Research (Gathering Specs)</option>
                  <option value="ready_to_go">🚀 Ready to Go (Build Ready)</option>
                  <option value="future_build">⏳ Future Build (Backlog)</option>
                  <option value="in_progress">⚡ In Progress (Active Sprint)</option>
                </select>
              </div>

              {/* Priority Badge */}
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                feature.priority === "critical"
                  ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                  : feature.priority === "high"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
              }`}>
                {feature.priority}
              </span>

              {/* Target Timeline */}
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground px-2.5 py-0.5 rounded-full bg-muted/60 border border-border">
                <Calendar size={12} className="text-primary" />
                <span>Target: {feature.targetTimeline}</span>
              </div>

              {/* Author */}
              <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-0.5">
                <User size={12} />
                <span>Proposed by {feature.author}</span>
              </div>
            </div>

            {/* Feature Title */}
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground tracking-tight">
              {feature.name}
            </h1>

            {/* Feature Description */}
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-4xl">
              {feature.description}
            </p>

            {/* Tags */}
            {feature.tags && feature.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {feature.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20"
                  >
                    <Tag size={10} />
                    <span>#{tag}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: Upvotes Widget */}
          <div className="flex sm:flex-col items-center justify-center p-4 rounded-2xl bg-muted/40 border border-border shrink-0 gap-2 min-w-[120px]">
            <button
              onClick={() => voteFeature(feature.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                feature.hasVoted
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "bg-card border border-border text-foreground hover:border-primary/40"
              }`}
            >
              <ThumbsUp size={14} className={feature.hasVoted ? "fill-current" : ""} />
              <span>{feature.votes} Upvotes</span>
            </button>
            <span className="text-[10px] text-muted-foreground font-medium">
              Team Interest Score
            </span>
          </div>
        </div>
      </div>

      {/* Two-Column Workspace: Left (Research Points) & Right (Documents & Notes) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Research Points & Task Readiness */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Research Points Container */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h2 className="text-base font-heading font-bold text-foreground">
                    Actionable Research Points
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Break down specifications. These will automatically become tasks on start.
                  </p>
                </div>
              </div>

              {totalPointsCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-foreground">
                    {completedPointsCount}/{totalPointsCount} Verified
                  </span>
                  <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {pointsProgress}%
                  </span>
                </div>
              )}
            </div>

            {/* Quick Add Point Input */}
            <form onSubmit={handleAddPointSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={newPointText}
                onChange={(e) => setNewPointText(e.target.value)}
                placeholder="Add research point (e.g. 'Audit API rate limit quotas')... Press Enter"
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
              <button
                type="submit"
                disabled={!newPointText.trim()}
                className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0"
              >
                <Plus size={14} />
                <span>Add Point</span>
              </button>
            </form>

            {/* Points List */}
            {(!feature.points || feature.points.length === 0) ? (
              <div className="py-8 text-center rounded-xl bg-muted/20 border border-dashed border-border p-6">
                <Lightbulb size={24} className="mx-auto mb-2 text-primary/50" />
                <p className="text-xs font-bold text-foreground">No research points added yet</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Type an item above to break down this feature. When you click &quot;Start Feature&quot;, each point turns into a task.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {feature.points.map((pt, idx) => (
                  <div
                    key={pt.id}
                    className={`flex items-start justify-between gap-3 p-3 rounded-xl border transition-all ${
                      pt.completed
                        ? "bg-emerald-500/5 border-emerald-500/20 text-muted-foreground"
                        : "bg-muted/40 hover:bg-muted/70 border-border text-foreground"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFeaturePoint(feature.id, pt.id)}
                      className="mt-0.5 shrink-0 text-muted-foreground hover:text-emerald-500 transition-colors"
                      title={pt.completed ? "Mark unverified" : "Mark verified"}
                    >
                      {pt.completed ? (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      ) : (
                        <Circle size={16} />
                      )}
                    </button>

                    <div className="flex-1 text-xs font-medium leading-relaxed">
                      <span className={`font-mono text-[10px] font-bold mr-1.5 text-muted-foreground`}>
                        #{idx + 1}
                      </span>
                      <span className={pt.completed ? "line-through opacity-75" : ""}>
                        {pt.title}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteFeaturePoint(feature.id, pt.id)}
                      className="text-muted-foreground hover:text-red-500 p-1 rounded-lg hover:bg-red-500/10 transition-colors shrink-0"
                      title="Delete Point"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Launch Banner Hint */}
            <div className="mt-2 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between gap-3 text-xs text-primary">
              <div className="flex items-center gap-2">
                <Rocket size={14} className="shrink-0" />
                <span className="font-semibold">
                  Ready to develop? 1-click &quot;Start Feature&quot; will create {totalPointsCount} sprint tasks.
                </span>
              </div>
              <button
                onClick={handleStartFeature}
                className="font-extrabold underline hover:text-primary/80 whitespace-nowrap"
              >
                Launch Now →
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Research Documents & Technical Notes */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Research Documents Container */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <FileText size={18} />
                </div>
                <div>
                  <h2 className="text-base font-heading font-bold text-foreground">
                    Research Documents
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Architecture specs, Notion pages, and reference files.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDocModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs font-bold transition-all flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Attach Doc</span>
              </button>
            </div>

            {/* Documents List */}
            {(!feature.documents || feature.documents.length === 0) ? (
              <div className="py-6 text-center rounded-xl bg-muted/20 border border-dashed border-border p-4">
                <FilePlus size={20} className="mx-auto mb-1.5 text-muted-foreground/60" />
                <p className="text-xs font-bold text-foreground">No documents attached</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Attach API specs, Google Docs, or architecture diagrams.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {feature.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted border border-border transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                        {doc.type === "pdf" ? (
                          <FileText size={14} />
                        ) : (
                          <Link2 size={14} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1 truncate"
                        >
                          <span className="truncate">{doc.name}</span>
                          <ExternalLink size={10} className="shrink-0 text-muted-foreground" />
                        </a>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span className="uppercase font-mono">{doc.type || "Link"}</span>
                          {doc.size && <span>• {doc.size}</span>}
                          {doc.uploadedAt && <span>• {doc.uploadedAt}</span>}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteFeatureDocument(feature.id, doc.id)}
                      className="text-muted-foreground hover:text-red-500 p-1 rounded-lg hover:bg-red-500/10 transition-colors shrink-0"
                      title="Remove Document"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Research Notes & Architecture Findings */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h2 className="text-base font-heading font-bold text-foreground">
                Technical Notes & Findings
              </h2>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:bg-primary/90 transition-all flex items-center gap-1.5"
              >
                {isSavedNotes ? (
                  <>
                    <Check size={13} />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save size={13} />
                    <span>Save Notes</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={6}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Record technical findings, benchmark results, API constraints, and implementation architecture here..."
              className="w-full p-3 text-xs rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-mono leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Attach Document Dialog Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden p-6">
            <h3 className="text-base font-heading font-bold text-foreground mb-1">
              Attach Research Document / Link
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Link an external API spec, Google Drive document, Figma wireframe, or PDF.
            </p>

            <form onSubmit={handleAddDocSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Telegram MTProto Reconnect RFC"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">URL / Resource Link</label>
                <input
                  type="url"
                  required
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  placeholder="https://docs.google.com/..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Resource Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="spec">Technical Spec</option>
                    <option value="doc">Document</option>
                    <option value="pdf">PDF File</option>
                    <option value="link">Web Link</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Size / Label (Optional)</label>
                  <input
                    type="text"
                    value={docSize}
                    onChange={(e) => setDocSize(e.target.value)}
                    placeholder="e.g. 1.2 MB or Notion"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:bg-primary/90"
                >
                  Attach Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * ============================================================================
 * FOOTER BLOCK: components/FeatureDetailView.tsx Implementation Notes
 * ============================================================================
 * - Workflow: Full-page detail view allowing research point breakdown & doc attachments.
 * - Conversion Engine: startFeatureAsProject creates an OngoingProject and converts points to tasks.
 * ============================================================================
 */
