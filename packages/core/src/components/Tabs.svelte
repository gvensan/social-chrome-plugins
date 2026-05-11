<script lang="ts" generics="T extends string">
  interface Props {
    items: ReadonlyArray<{ id: T; label: string }>;
    active: T;
    onChange: (id: T) => void;
  }
  let { items, active, onChange }: Props = $props();
</script>

<div
  class="flex rounded-md border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800"
>
  {#each items as item (item.id)}
    {@const selected = item.id === active}
    <button
      type="button"
      class="flex-1 rounded px-2 py-1 text-[12px] font-medium transition-colors"
      class:bg-white={selected}
      class:shadow-sm={selected}
      class:text-brand-700={selected}
      class:text-slate-500={!selected}
      class:hover:text-slate-800={!selected}
      onclick={() => onChange(item.id)}
    >
      {item.label}
    </button>
  {/each}
</div>
