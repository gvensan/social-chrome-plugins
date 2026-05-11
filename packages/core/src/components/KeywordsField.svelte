<script lang="ts">
  import BooleanHelper from './BooleanHelper.svelte';

  interface Props {
    value: string | undefined;
    onChange: (next: string | undefined) => void;
    placeholder?: string;
  }
  let { value, onChange, placeholder = 'e.g. AI engineering' }: Props = $props();

  let helperOpen = $state(false);
  let textarea: HTMLTextAreaElement | undefined = $state();
  const fieldId = `kw_${Math.random().toString(36).slice(2, 9)}`;

  const insert = (snippet: string) => {
    const ta = textarea;
    if (!ta) {
      onChange(((value ?? '') + snippet).trimStart());
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const current = value ?? '';
    const next = current.slice(0, start) + snippet + current.slice(end);
    onChange(next);
    queueMicrotask(() => {
      ta.focus();
      const pos = start + snippet.length;
      ta.setSelectionRange(pos, pos);
    });
  };
</script>

<div>
  <div class="mb-1 flex items-center justify-between">
    <label class="label !mb-0" for={fieldId}>Keywords</label>
    <button
      class="btn-ghost !py-0.5 !text-[11px]"
      type="button"
      onclick={() => (helperOpen = true)}
    >
      Boolean helper
    </button>
  </div>
  <textarea
    id={fieldId}
    bind:this={textarea}
    class="input min-h-[60px] resize-none font-mono text-[11.5px]"
    {placeholder}
    value={value ?? ''}
    oninput={(e) => {
      const v = (e.currentTarget as HTMLTextAreaElement).value;
      onChange(v === '' ? undefined : v);
    }}
  ></textarea>
</div>

<BooleanHelper
  open={helperOpen}
  onClose={() => (helperOpen = false)}
  onInsert={(s) => {
    insert(s);
    helperOpen = false;
  }}
/>
