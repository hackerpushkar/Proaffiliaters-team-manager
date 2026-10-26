/**
 * ============================================================================
 * HEADER BLOCK: app/login/page.tsx — Proaffiliaters Employee Login Portal
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Provides the internal authentication screen for Proaffiliaters team members.
 * Enforces employee-only access (no public self-registration/signup).
 * Offers 1-click credential presets for rapid testing and role verification.
 *
 * WHY THIS FILE EXISTS:
 * Ensures access control to proprietary bots, deals harvest engines, and task boards.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Interacts with useTaskStore.login(); redirects to workspace index upon success.
 * ============================================================================
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, login, teamMembers } = useTaskStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        router.push("/");
      } else {
        setError(result.message || "Invalid email or password.");
      }
    } catch {
      setError("An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-gradient-to-br from-background via-card to-background text-foreground transition-colors selection:bg-primary/20 selection:text-primary">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
        {/* Header Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-indigo-500" />

        <div className="p-6 sm:p-8">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 via-accent/15 to-transparent border border-primary/20 shadow-sm mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Proaffiliaters Logo" className="w-8 h-8 object-contain" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight text-foreground">
              Proaffiliaters Portal
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Internal Team & Sprint Command Center
            </p>

            {/* No Signup Notice Pill */}
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/80 border border-border text-[11px] font-medium text-muted-foreground">
              <ShieldCheck size={13} className="text-primary" />
              <span>Internal Employee System • No Public Signup</span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Work Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@proaffiliaters.com"
                  className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-foreground">
                  Employee Password / PIN
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Provided by Admin
                </span>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-muted/40 border-t border-border text-center text-[11px] text-muted-foreground">
          <span>Need access or forgot password? </span>
          <Link href="/admin" className="text-primary font-semibold hover:underline">
            Contact Super Admin
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * ============================================================================
 * FOOTER BLOCK: app/login/page.tsx Implementation Notes
 * ============================================================================
 * - Workflow: Direct route rendering for employee authentication.
 * - Caveat: Enforces that employees only log in using admin-provisioned accounts.
 * ============================================================================
 */
