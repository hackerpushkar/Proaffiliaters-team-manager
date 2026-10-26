/**
 * ============================================================================
 * HEADER BLOCK: deploy/ecosystem.config.js — PM2 Process Manager Configuration
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Defines production process management rules for PM2 on Linux VPS:
 * - Runs Next.js application on Port 3050
 * - Handles auto-restart on crashes and system reboots
 * - Dynamically resolves the project root directory
 * - Sets memory thresholds and structured log paths
 *
 * WHY THIS FILE EXISTS:
 * Ensures Proaffiliaters Team & Task Manager runs as an always-on daemon for
 * manage.proaffiliaters.com.
 * ============================================================================
 */

const path = require("path");

module.exports = {
  apps: [
    {
      name: "manage-proaffiliaters",
      script: "npm",
      args: "start",
      cwd: path.resolve(__dirname, ".."),
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3050,
      },
      error_file: "/var/log/pm2/manage-proaffiliaters-error.log",
      out_file: "/var/log/pm2/manage-proaffiliaters-out.log",
      merge_logs: true,
      time: true,
    },
  ],
};

/**
 * ============================================================================
 * FOOTER BLOCK: deploy/ecosystem.config.js Implementation Notes
 * ============================================================================
 * - Launch Command: pm2 start deploy/ecosystem.config.js
 * - Reload Command: pm2 reload manage-proaffiliaters
 * - Save Command: pm2 save && pm2 startup
 * ============================================================================
 */
