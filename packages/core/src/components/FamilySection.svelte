<script lang="ts">
  import { otherSiblings } from '../family';
  import FamilyCard from './FamilyCard.svelte';

  interface Props {
    /** The id of the current plugin (e.g. `linkedin`). Excluded from the list. */
    currentId: string;
  }
  let { currentId }: Props = $props();

  const siblings = $derived(otherSiblings(currentId));
</script>

{#if siblings.length > 0}
  <div class="space-y-2">
    <div class="label">More from this publisher</div>
    {#each siblings as plugin (plugin.id)}
      <FamilyCard {plugin} />
    {/each}
  </div>
{/if}
