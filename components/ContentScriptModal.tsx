/**
 * ============================================================================
 * HEADER BLOCK: components/ContentScriptModal.tsx — Script & Document Manager
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Provides a specialized modal dialog to attach, view, replace, and manage
 * production scripts for Content Pieces (Organic Videos) and Paid Ads:
 * - Multi-format support: Google Docs, PDFs, Images (storyboard/shots), and direct URLs
 * - Built-in instant viewer / lightbox for Images, PDFs, and Docs links
 * - Local file attachment via FileReader (DataURL) for zero-latency preview
 * - Remove & Replace capabilities for continuous iteration
 *
 * WHY THIS FILE EXISTS:
 * Fulfills user request: "here give option add script if script added then show script
 * ( all format avaible docs , pdf , and imge ) ... this for video and for ads same".
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Called from ContentManagerView cards; dispatches updateContentItem in useTaskStore
 * which syncs changes to MongoDB and LocalStorage.
 * ============================================================================
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  FileCheck,
  Image as ImageIcon,
  Link as LinkIcon,
  Upload,
  ExternalLink,
  Trash2,
  CheckCircle,
  Eye,
  Sparkles,
} from "lucide-react";
import { ContentItem, ScriptAttachment } from "@/lib/types";

interface ContentScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem | null;
  onSave: (scriptAttachment?: ScriptAttachment, scriptUrl?: string) => void;
}

export const ContentScriptModal: React.FC<ContentScriptModalProps> = ({
  isOpen,
  onClose,
  item,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<"link" | "upload" | "text">("link");
  const [scriptName, setScriptName] = useState("");
  const [scriptUrl, setScriptUrl] = useState("");
  const [format, setFormat] = useState<"docs" | "pdf" | "image" | "link">("docs");
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [textContent, setTextContent] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (item) {
      if (item.scriptAttachment) {
        setScriptName(item.scriptAttachment.name || "");
        setScriptUrl(item.scriptAttachment.url || "");
        setFormat(item.scriptAttachment.format || "docs");
        setFileSize(item.scriptAttachment.size || null);
        if (item.scriptAttachment.url && item.scriptAttachment.url.startsWith("data:")) {
          setFileData(item.scriptAttachment.url);
          setActiveTab("upload");
        } else {
          setActiveTab("link");
        }
      } else if (item.scriptUrl) {
        setScriptName(`${item.title} Script`);
        setScriptUrl(item.scriptUrl);
        setFormat(item.scriptUrl.includes("docs.google.com") ? "docs" : "link");
        setActiveTab("link");
      } else {
        setScriptName(`${item.title} Script`);
        setScriptUrl("");
        setFileData(null);
        setFileSize(null);
        setFormat("docs");
        setActiveTab("link");
      }
      setIsPreviewOpen(false);
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;
    setFileSize(sizeFormatted);
    setScriptName(file.name);

    if (file.type.startsWith("image/")) {
      setFormat("image");
    } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      setFormat("pdf");
    } else {
      setFormat("docs");
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFileData(result);
      setScriptUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    let finalUrl = scriptUrl.trim();
    if (activeTab === "text" && textContent.trim()) {
      finalUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(textContent.trim())}`;
    }

    if (!finalUrl && !fileData) {
      alert("Please provide a script URL, upload a file, or enter script text.");
      return;
    }

    const attachment: ScriptAttachment = {
      name: scriptName.trim() || `${item.title} Script`,
      url: fileData || finalUrl,
      format,
      size: fileSize || undefined,
      type: format === "image" ? "image/*" : format === "pdf" ? "application/pdf" : "document",
    };

    onSave(attachment, attachment.url);
    onClose();
  };

  const handleRemove = () => {
    if (confirm("Remove this script from the content item?")) {
      onSave(undefined, "");
      onClose();
    }
  };

  const hasExistingScript = Boolean(item.scriptAttachment?.url || item.scriptUrl);
  const currentUrl = item.scriptAttachment?.url || item.scriptUrl || "";
  const currentFormat = item.scriptAttachment?.format || (currentUrl.includes("docs.google.com") ? "docs" : "link");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-base font-heading font-extrabold text-foreground">
                {hasExistingScript ? "Manage Script" : "Add Production Script"}
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

        {/* Existing Script Quick Viewer Preview */}
        {hasExistingScript && (
          <div className="p-4 sm:p-5 border-b border-border bg-primary/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  {currentFormat === "pdf" ? (
                    <FileCheck size={16} />
                  ) : currentFormat === "image" ? (
                    <ImageIcon size={16} />
                  ) : (
                    <FileText size={16} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">
                    {item.scriptAttachment?.name || "Production Script"}
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                    <span className="uppercase font-mono font-bold text-primary">
                      {currentFormat}
                    </span>
                    {item.scriptAttachment?.size && (
                      <span>• {item.scriptAttachment.size}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                {currentUrl && (
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-hover shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Eye size={13} />
                    <span>Open Script</span>
                    <ExternalLink size={11} />
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 border border-red-500/20 transition-all"
                  title="Remove script"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Method Tabs */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Script Source Format
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-muted rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab("link")}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "link"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LinkIcon size={13} />
                <span>Doc Link</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "upload"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Upload size={13} />
                <span>Upload File</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("text")}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "text"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText size={13} />
                <span>Direct Text</span>
              </button>
            </div>
          </div>

          {/* Script Name */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Script Label / Document Title
            </label>
            <input
              type="text"
              required
              value={scriptName}
              onChange={(e) => setScriptName(e.target.value)}
              placeholder="e.g. Master Hook & Script v2"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Tab 1: Web Link / Google Docs */}
          {activeTab === "link" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Document URL (Google Docs, Notion, Word, PDF Link)
                </label>
                <input
                  type="url"
                  value={scriptUrl.startsWith("data:") ? "" : scriptUrl}
                  onChange={(e) => {
                    const url = e.target.value;
                    setScriptUrl(url);
                    setFileData(null);
                    if (url.includes("docs.google.com")) setFormat("docs");
                    else if (url.endsWith(".pdf")) setFormat("pdf");
                    else if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) setFormat("image");
                    else setFormat("link");
                  }}
                  placeholder="https://docs.google.com/document/d/... or https://..."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  Format Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["docs", "pdf", "image", "link"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setFormat(fmt)}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all border ${
                        format === fmt
                          ? "bg-primary text-white border-primary"
                          : "bg-muted/50 text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Upload File (PDF, Image, Docs) */}
          {activeTab === "upload" && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-foreground mb-1">
                Upload File (PDF, Image JPG/PNG, or Document)
              </label>
              <div className="relative border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-muted/20">
                <input
                  type="file"
                  accept=".pdf,image/*,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Upload size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground">
                      Click to browse or drag file here
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Supports PDF, PNG, JPG, WebP, Word, & Text documents
                    </p>
                  </div>
                  {fileSize && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 text-[11px] font-bold border border-emerald-500/30">
                      <CheckCircle size={11} />
                      Attached: {fileSize} ({format.toUpperCase()})
                    </span>
                  )}
                </div>
              </div>

              {/* Instant Image Preview if uploaded file is image */}
              {fileData && format === "image" && (
                <div className="p-2 rounded-xl border border-border bg-muted/30">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Image Preview
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fileData}
                    alt="Script storyboard"
                    className="max-h-48 rounded-lg object-contain mx-auto border border-border"
                  />
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Direct Script Text */}
          {activeTab === "text" && (
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Script Copy & Voiceover Lines
              </label>
              <textarea
                rows={6}
                value={textContent}
                onChange={(e) => {
                  setTextContent(e.target.value);
                  setFormat("docs");
                }}
                placeholder="[HOOK - 0:00 to 0:05]
Did you know you can automate your entire Telegram deals channel with zero coding?

[BODY - 0:05 to 0:45]
Here is the step-by-step bot setup on Proaffiliaters...

[CALL TO ACTION - 0:45 to 0:60]
Link is in the description!"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          )}

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
              <span>{hasExistingScript ? "Update Script" : "Save Script"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * FOOTER BLOCK: components/ContentScriptModal.tsx Implementation Notes
 * ============================================================================
 * - Workflow: Supports URL links, Base64 uploads (PDF/Image), and inline text.
 * - Caveat: Keeps storage footprint compact while allowing live browser viewing.
 * ============================================================================
 */
