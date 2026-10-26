#!/usr/bin/env bash
# ============================================================================
# HEADER BLOCK: deploy/setup_vps.sh — VPS Deployment Wrapper
# ============================================================================
# WHAT THIS SCRIPT DOES:
# Forwards execution to the master deploy.sh script located at the repository root.
# Passes through all command-line arguments (including --quick).
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

exec bash "$ROOT_DIR/deploy.sh" "$@"

# ============================================================================
# FOOTER BLOCK: deploy/setup_vps.sh Implementation Notes
# ============================================================================
# - Usage: ./deploy/setup_vps.sh or ./deploy.sh
# ============================================================================
