<script lang="ts">
  interface Props {
    open: boolean;
    onClose: () => void;
    onInsert: (snippet: string) => void;
  }
  let { open, onClose, onInsert }: Props = $props();

  const operators: Array<{ label: string; insert: string; help: string }> = [
    { label: '"phrase"', insert: '"" ', help: 'Exact-phrase match' },
    { label: 'AND', insert: ' AND ', help: 'Both terms must appear' },
    { label: 'OR', insert: ' OR ', help: 'Either term' },
    { label: 'NOT', insert: ' NOT ', help: 'Exclude term' },
    { label: '( … )', insert: '() ', help: 'Group expressions' },
  ];

  const examples: string[] = [
    '("product manager" OR "product owner") AND (Agile OR Scrum) NOT junior',
    'marketing AND "content strategy"',
    '("AI" OR "machine learning") AND ("hiring" OR "we are hiring") NOT recruiter',
  ];

  const insert = (s: string) => {
    onInsert(s);
  };
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-end bg-black/40"
    role="dialog"
    aria-modal="true"
  >
    <button
      type="button"
      class="absolute inset-0 cursor-default"
      aria-label="Close"
      onclick={onClose}
    ></button>
    <div
      class="relative w-full max-h-[80%] overflow-y-auto rounded-t-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="mb-2 flex items-center justify-between">
        <h2 class="text-[13px] font-semibold">Boolean helper</h2>
        <button class="btn-ghost" type="button" onclick={onClose}>Close</button>
      </div>
      <p class="mb-2 text-[11px] text-slate-500 dark:text-slate-400">
        Operators must be UPPERCASE. Tap to insert.
      </p>
      <div class="mb-3 grid grid-cols-2 gap-1.5">
        {#each operators as op (op.label)}
          <button
            class="btn-secondary justify-start"
            type="button"
            onclick={() => insert(op.insert)}
          >
            <span class="font-mono">{op.label}</span>
            <span class="ml-2 text-[10px] text-slate-500">{op.help}</span>
          </button>
        {/each}
      </div>
      <div class="label">Examples (tap to insert)</div>
      <div class="space-y-1.5">
        {#each examples as ex (ex)}
          <button
            class="w-full rounded border border-slate-200 bg-slate-50 p-2 text-left font-mono text-[11px] text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-700"
            type="button"
            onclick={() => insert(ex)}
          >
            {ex}
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}
