<script lang="ts">
  /**
   * Banner shown at the top of the Builder view when the user is
   * editing a previously-saved search (Saved tab → Edit). Makes it
   * unambiguous *which* entry is being edited, and gives explicit
   * exit / fork affordances so the user is never "trapped" in edit
   * mode.
   *
   * Rendering is fully controlled by the caller — this component
   * has no state of its own. The parent decides when to mount it
   * (e.g. `{#if builder.editingSavedId}`), what name to show, and
   * what the transient `status` reads (e.g. "Updated" right after
   * an in-place save).
   */
  interface Props {
    /** Name of the saved entry being edited. Shown prominently. */
    name: string;
    /** Transient status message displayed next to the "Editing saved"
     *  label — e.g. "Updated" briefly after a successful overwrite.
     *  Caller controls timing (typically clears it via setTimeout). */
    status?: string;
    /** Save the current builder state as a NEW entry (rather than
     *  overwriting the one being edited). Typically opens the
     *  SaveSearchDialog in create mode. Hidden when omitted. */
    onSaveAsNew?: () => void;
    /** Exit edit mode while keeping the current builder state intact.
     *  Lets the user continue working without overwriting the saved
     *  entry. Hidden when omitted. */
    onExit?: () => void;
  }
  let { name, status, onSaveAsNew, onExit }: Props = $props();
</script>

<div
  class="flex items-center justify-between gap-2 rounded-lg border border-sky-300 bg-sky-50 px-2.5 py-1.5 dark:border-sky-700 dark:bg-sky-900/20"
  role="status"
>
  <div class="min-w-0 flex-1">
    <div class="flex items-center gap-1.5">
      <div
        class="text-[9.5px] font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300"
      >
        Editing saved
      </div>
      {#if status}
        <div
          class="text-[9.5px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300"
        >
          · {status}
        </div>
      {/if}
    </div>
    <div
      class="truncate text-[12px] font-semibold text-slate-800 dark:text-slate-100"
      title={name}
    >
      {name}
    </div>
  </div>
  <div class="flex shrink-0 gap-1">
    {#if onSaveAsNew}
      <button
        class="btn-ghost text-[11px]"
        type="button"
        onclick={onSaveAsNew}
        title="Save the current state as a new saved search instead of overwriting"
      >
        Save as new
      </button>
    {/if}
    {#if onExit}
      <button
        class="btn-ghost text-[11px]"
        type="button"
        onclick={onExit}
        aria-label="Exit edit mode"
        title="Exit edit mode (keeps current builder state)"
      >
        ×
      </button>
    {/if}
  </div>
</div>
