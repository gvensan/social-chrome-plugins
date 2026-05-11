<script lang="ts">
  import { FamilySection } from '@toolkit/core';
</script>

<div class="space-y-3 p-3">
  <div class="space-y-1">
    <div class="text-[14px] font-semibold">LinkedIn Feed Toolkit</div>
    <p class="text-[11px] text-slate-500 dark:text-slate-400">
      Version 0.1 · Unofficial third-party tool · Not affiliated with
      LinkedIn.
    </p>
  </div>

  <div class="space-y-2">
    <div class="label">What this is</div>
    <p class="text-[11.5px] leading-snug text-slate-600 dark:text-slate-300">
      A side-panel tool for composing LinkedIn search URLs — fresh job
      pulse, network feed, topic monitor, people-by-title, jobs at a
      company, posts from a company page, posts by a person. Saves
      companies and individuals once so you can reuse them as filter
      tags across searches. The toolkit only generates URLs and opens
      them in your browser. It does not scrape, automate, or send data
      over the network beyond user-clicked profile/page lookups for
      URN extraction.
    </p>
  </div>

  <div class="space-y-2">
    <div class="label">What it does, briefly</div>
    <ul
      class="ml-4 list-disc space-y-0.5 text-[11.5px] leading-snug text-slate-600 dark:text-slate-300"
    >
      <li><strong>Home</strong> — one-click templates grouped by intent (Posts / Jobs / People).</li>
      <li><strong>Builder</strong> — typed forms for Posts, Jobs, and People searches.</li>
      <li><strong>Saved</strong> — your library of saved searches with tags.</li>
      <li><strong>Filters</strong> — saved <em>Companies</em> and <em>People</em>, used as filter tags in Posts / Jobs / People searches. Captured via paste-URL, "From current tab," or in-place "Get ID" upgrade.</li>
      <li><strong>Settings</strong> — theme, display mode, link-open mode, defaults, JSON backup.</li>
    </ul>
  </div>

  <div class="space-y-2">
    <div class="label">Privacy</div>
    <ul
      class="ml-4 list-disc space-y-0.5 text-[11.5px] leading-snug text-slate-600 dark:text-slate-300"
    >
      <li>All data lives in <code>chrome.storage.local</code> on this device.</li>
      <li>No telemetry, no analytics, no remote calls during normal use.</li>
      <li>"From current tab" / "Get ID" use scoped <code>linkedin.com</code> permissions on user click to either (a) regex-scan the active LinkedIn tab's HTML for a <code>urn:li:fsd_company</code> / <code>urn:li:fsd_member</code> match, or (b) fetch the relevant <code>/company/&lt;slug&gt;/</code> or <code>/in/&lt;vanity&gt;/</code> URL with your session cookies. Only the matched numeric ID is kept; full HTML never leaves the page.</li>
      <li>Use is subject to LinkedIn's User Agreement.</li>
    </ul>
  </div>

  <hr class="border-slate-200 dark:border-slate-700" />

  <FamilySection currentId="linkedin" />
</div>
