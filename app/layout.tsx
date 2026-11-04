/**
 * ============================================================================
 * HEADER BLOCK: app/layout.tsx — Root Application Shell & Theme Wrapper
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Configures HTML metadata, typography fonts (DM Sans, Plus Jakarta Sans,
 * JetBrains Mono), initializes the root TaskProvider context, and sets
 * the default light mode theme matching the Proaffiliaters web ecosystem.
 *
 * WHY THIS FILE EXISTS:
 * Serves as the top-level Next.js App Router layout wrapping all child routes.
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Injects CSS variables, global scrollbars, and state provider for child components.
 * ============================================================================
 */

import type { Metadata } from "next";
import { Manrope, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TaskProvider } from "@/lib/store";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Proaffiliaters Team & Task Manager",
  description:
    "Official internal command center for Proaffiliaters: Upcoming Features, Ongoing Projects & Priority Tasks, and Fix & Updates.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${dmSans.variable} ${jetbrainsMono.variable} min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary font-sans`}
      >
        <TaskProvider>{children}</TaskProvider>
      </body>
    </html>
  );
}

/**
 * ============================================================================
 * FOOTER BLOCK: app/layout.tsx Implementation Notes & Caveats
 * ============================================================================
 * - Workflow: Renders root layout in default clean light mode matching Proaffiliaters web app.
 * ============================================================================
 */
