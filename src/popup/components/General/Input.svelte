<script lang="ts">
  export let value: string = "";
  export let id: string = "";
  export let disabled: boolean = false;
</script>

<input
  bind:value
  {id}
  {disabled}
  class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight mb-2 disabled:bg-gray-200"
/>
