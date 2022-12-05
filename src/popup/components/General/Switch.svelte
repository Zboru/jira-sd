<script lang="ts">
  import { Switch } from "@rgossiaux/svelte-headlessui";
  export let value = false;
  export let label = "Switch";
  const randomID = `switch-${Math.floor(Math.random() * 9999)}`;
</script>

<div class="switch-container">
  <label class="switch-label" on:click={() => (value = !value)} for={randomID}>
    {label}:
  </label>
  <Switch
    id={randomID}
    checked={value}
    on:change={(e) => (value = e.detail)}
    class={value ? "switch switch-enabled" : "switch switch-disabled"}
  >
    <span class="toggle" class:toggle-on={value} class:toggle-off={!value} />
  </Switch>
</div>

<style>
  .switch-container {
    display: flex;
    flex-direction: column;
  }

  :global(.switch) {
    position: relative;
    display: inline-flex;
    align-items: center;
    border-radius: 9999px;
    height: 1.5rem;
    width: 2.75rem;
  }

  :global(.switch-enabled) {
    /* Blue */
    background-color: rgb(37 99 235);
  }

  :global(.switch-disabled) {
    /* Gray */
    background-color: rgb(229 231 235);
  }

  .switch-label {
    user-select: none;
    margin: 0;
  }

  .toggle {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    background-color: rgb(255 255 255);
    border-radius: 9999px;
  }

  .toggle-on {
    transform: translateX(1.5rem);
  }

  .toggle-off {
    transform: translateX(0.2rem);
  }
</style>
