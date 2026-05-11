<script lang="ts" generics="T extends string | number">
  interface Props {
    options: ReadonlyArray<{ value: T; label: string }>;
    selected: ReadonlyArray<T>;
    onToggle: (value: T) => void;
  }
  let { options, selected, onToggle }: Props = $props();

  const isSelected = (v: T): boolean => selected.includes(v);
</script>

<div class="flex flex-wrap gap-1">
  {#each options as opt (opt.value)}
    <button
      type="button"
      class="chip"
      class:chip-active={isSelected(opt.value)}
      onclick={() => onToggle(opt.value)}
    >
      {opt.label}
    </button>
  {/each}
</div>
