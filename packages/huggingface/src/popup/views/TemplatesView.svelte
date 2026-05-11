<script lang="ts">
  import { BUILTIN_TEMPLATES } from '@lib/templates';
  import { CollapsibleSection, groupTemplates } from '@toolkit/core';
  import TemplateCard from '../components/TemplateCard.svelte';

  const groups = $derived(groupTemplates(BUILTIN_TEMPLATES));
  const totalCount = $derived(BUILTIN_TEMPLATES.length);
</script>

<div class="space-y-2 p-3">
  <p class="mb-1 text-[11px] text-slate-500 dark:text-slate-400">
    One-click slices of Hugging Face. Tap a section heading to expand.
    Each card shows the filters its "Open" button will apply, so you
    know what you're clicking before you click.
  </p>
  {#each groups as { name, templates } (name)}
    <CollapsibleSection title={name} count={templates.length} open={false}>
      <div class="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2">
        {#each templates as template (template.id)}
          <TemplateCard {template} />
        {/each}
      </div>
    </CollapsibleSection>
  {/each}

  <div
    class="mt-3 rounded border border-slate-200 bg-slate-50 p-2 text-[10.5px] leading-snug text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
  >
    <div class="mb-1 font-semibold text-slate-700 dark:text-slate-200">
      {totalCount} templates available
    </div>
    <ul class="space-y-0.5">
      {#each groups as { name, templates } (name)}
        <li>
          <span class="font-medium">{name}</span>
          ({templates.length}):
          {templates.map((t) => t.title).join(' · ')}
        </li>
      {/each}
    </ul>
  </div>
</div>
