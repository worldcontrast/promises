"""
World Contrast — Settings
File: config/settings.py

All configuration loaded from environment variables.
Never hardcoded. Never committed to version control.

Required environment variables:
  ANTHROPIC_API_KEY    — Claude API key (platform.anthropic.com)
  SUPABASE_URL         — Supabase project URL
  SUPABASE_KEY         — Supabase service role key

Optional:
  WEB3_STORAGE_KEY     — IPFS archiving (Phase 2)
  AGENT_VERSION        — Agent version string (default: 1.0.0)
  LOG_LEVEL            — Logging level (default: INFO)
  MAX_CONCURRENT       — Max concurrent fetches (default: 3)
"""

import os
from dataclasses import dataclass


@dataclass
class Settings:
    # ── REQUIRED ──────────────────────────────────────────────
    anthropic_api_key: str = ''
    supabase_url: str = ''
    supabase_key: str = ''

    # ── OPTIONAL ──────────────────────────────────────────────
    web3_storage_key: str = ''
    agent_version: str = '1.0.0'
    log_level: str = 'INFO'
    max_concurrent: int = 3

    def __post_init__(self):
        """Load from environment variables."""
        self.anthropic_api_key = os.environ.get('ANTHROPIC_API_KEY', '')
        self.supabase_url = os.environ.get('SUPABASE_URL', '')
        self.supabase_key = os.environ.get('SUPABASE_KEY', '')
        self.web3_storage_key = os.environ.get('WEB3_STORAGE_KEY', '')
        self.agent_version = os.environ.get('AGENT_VERSION', '1.0.0')
        self.log_level = os.environ.get('LOG_LEVEL', 'INFO')
        self.max_concurrent = int(os.environ.get('MAX_CONCURRENT', '3'))

        # Validate required variables
        missing = []
        if not self.anthropic_api_key:
            missing.append('ANTHROPIC_API_KEY')
        if not self.supabase_url:
            missing.append('SUPABASE_URL')
        if not self.supabase_key:
            missing.append('SUPABASE_KEY')

        if missing:
            raise ValueError(
                f"Missing required environment variables: {', '.join(missing)}\n"
                f"See .env.example for setup instructions."
            )
