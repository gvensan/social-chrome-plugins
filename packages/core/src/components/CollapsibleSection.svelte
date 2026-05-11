<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    count?: number;
    open?: boolean;
    children: Snippet;
  }

  let { title, count, open = true, children }: Props = $props();
</script>

<details
  {open}
  class="rounded-lg border border-slate-200 bg-white open:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:open:bg-slate-800/60"
>
  <summary
    class="flex cursor-pointer select-none items-center justify-between px-3 py-2 text-[12px] font-semibold text-slate-700 dark:text-slate-200"
  >
    <span class="flex items-center gap-1.5">
      <svg
        class="h-3 w-3 transition-transform group-open:rotate-90"
        viewBox="0 0 12 12"
        fill="none"
      >
        <path
          d="M4 2 L8 6 L4 10"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      {title}
    </span>
    {#if count !== undefined}
      <span class="text-[10px] font-normal text-slate-400">{count}</span>
    {/if}
  </summary>
  <div class="border-t border-slate-200 p-2 dark:border-slate-700">
    {@render children()}
  </div>
</details>
