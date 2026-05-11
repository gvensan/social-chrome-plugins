<script lang="ts">
  interface Props {
    checked: boolean;
    label: string;
    onChange: (next: boolean) => void;
  }
  let { checked, label, onChange }: Props = $props();
</script>

<button
  type="button"
  class="flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
  onclick={() => onChange(!checked)}
>
  <span>{label}</span>
  <span
    class="relative inline-block h-4 w-7 rounded-full transition-colors"
    class:bg-brand-600={checked}
    class:bg-slate-300={!checked}
    class:dark:bg-slate-600={!checked}
  >
    <span
      class="absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all"
      class:left-3.5={checked}
      class:left-0.5={!checked}
    ></span>
  </span>
</button>
