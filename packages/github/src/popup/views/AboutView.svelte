<script lang="ts">
  import { FamilySection } from '@toolkit/core';
</script>

<div class="space-y-3 p-3">
  <div class="space-y-1">
    <div class="text-[14px] font-semibold">GitHub Search Toolkit</div>
    <p class="text-[11px] text-slate-500 dark:text-slate-400">
      Version 0.1 · Unofficial third-party tool · Not affiliated with
      GitHub.
    </p>
  </div>

  <div class="space-y-2">
    <div class="label">What this is</div>
    <p class="text-[11.5px] leading-snug text-slate-600 dark:text-slate-300">
      A side-panel tool for composing GitHub search URLs with qualifier
      helpers (<code>language:</code>, <code>stars:</code>,
      <code>topic:</code>, <code>license:</code>, etc.) plus
      "inbox" templates for PRs awaiting review, issues assigned, and
      Trending. Generates URLs and opens them — no API calls, no
      scraping.
    </p>
  </div>

  <div class="space-y-2">
    <div class="label">What it does, briefly</div>
    <ul
      class="ml-4 list-disc space-y-0.5 text-[11.5px] leading-snug text-slate-600 dark:text-slate-300"
    >
      <li><strong>Templates</strong> — one-click recipes grouped by intent.</li>
      <li><strong>Builder</strong> — typed forms for Repositories, Code, Issues, PRs, and Users.</li>
      <li><strong>Saved</strong> — your library of saved searches with tags.</li>
      <li><strong>Settings</strong> — theme, display mode, defaults, JSON backup.</li>
    </ul>
  </div>

  <div class="space-y-2">
    <div class="label">Privacy</div>
    <ul
      class="ml-4 list-disc space-y-0.5 text-[11.5px] leading-snug text-slate-600 dark:text-slate-300"
    >
      <li>All data lives in <code>chrome.storage.local</code> on this device.</li>
      <li>No telemetry, no analytics, no remote calls.</li>
      <li>No <code>host_permissions</code>, no content scripts, no API tokens.</li>
      <li>Use is subject to GitHub's Terms of Service.</li>
    </ul>
  </div>

  <hr class="border-slate-200 dark:border-slate-700" />

  <FamilySection currentId="github" />
</div>
