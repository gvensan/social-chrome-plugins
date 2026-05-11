<script lang="ts">
  import { router, type View } from '@toolkit/core';

  const items: ReadonlyArray<{ id: View; label: string }> = [
    { id: 'templates', label: 'Home' },
    { id: 'builder', label: 'Builder' },
    { id: 'saved', label: 'Saved' },
    { id: 'settings', label: 'Settings' },
    { id: 'about', label: 'About' },
  ];
</script>

<nav
  class="flex border-t border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
>
  {#each items as item (item.id)}
    {@const active = router.view === item.id}
    <button
      type="button"
      class="flex flex-1 items-center justify-center px-2 py-2 text-[11px] font-medium transition-colors"
      class:text-brand-700={active}
      class:bg-white={active}
      class:text-slate-500={!active}
      class:hover:text-slate-800={!active}
      title={item.label}
      aria-label={item.label}
      onclick={() => router.go(item.id)}
    >
      {#if item.id === 'about'}
        <svg
          class="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            stroke-width="2"
          />
          <path
            d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      {:else}
        {item.label}
      {/if}
    </button>
  {/each}
</nav>
