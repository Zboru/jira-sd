<script lang="ts">
  import Button from "./General/Button.svelte";
  import Input from "./General/Input.svelte";
  import Switch from "./General/Switch.svelte";

  let sendNotifications: boolean = false;
  let JQL: string = "";

  async function saveSettings(): Promise<void> {
    await chrome.storage.sync.set({ JQL, sendNotifications });
  }

  (async () => {
    const result = await chrome.storage.sync.get(["JQL", "sendNotifications"]);
    JQL = result.JQL;
    sendNotifications = result.sendNotifications;
  })();
</script>

<div>
  <Switch
    bind:value={sendNotifications}
    label="Powiadomienia o nowych zgłoszeniach"
  />
  <label for="JQL">JQL:</label>
  <Input bind:value={JQL} disabled={!sendNotifications} id="JQL" />

  <div class="actions">
    <div class="spacer" />
    <Button on:click={saveSettings}>Zapisz</Button>
  </div>
</div>

<style>
  .actions {
    display: flex;
  }
  .spacer {
    flex-grow: 1;
  }
</style>
