<script lang="ts">
  interface Props {
    /** Diameter in px. Defaults to 12 (matches button text height). */
    size?: number;
  }
  let { size = 12 }: Props = $props();
</script>

<span
  class="inline-block animate-spin rounded-full border-2 border-current border-t-transparent align-[-2px]"
  style:width="{size}px"
  style:height="{size}px"
  aria-hidden="true"
></span>
