<script lang="ts" generics="T extends string">
  interface Props {
    options: ReadonlyArray<{ value: T; label: string }>;
    value: T | undefined;
    placeholder?: string;
    onChange: (v: T | undefined) => void;
  }
  let { options, value, placeholder = '— Any —', onChange }: Props = $props();
</script>

<select
  class="input"
  value={value ?? ''}
  onchange={(e) => {
    const v = (e.currentTarget as HTMLSelectElement).value;
    onChange(v === '' ? undefined : (v as T));
  }}
>
  <option value="">{placeholder}</option>
  {#each options as opt (opt.value)}
    <option value={opt.value}>{opt.label}</option>
  {/each}
</select>
