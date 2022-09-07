<script lang="ts">
    import Button from "./General/Button.svelte";
    import Checkbox from "./General/Checkbox.svelte";
    import Input from "./General/Input.svelte";

    let notifications: boolean = false;
    let JQL: string = "";
    async function saveSettings(): Promise<void> {
        await chrome.storage.sync.set({ JQL, notifications });
    }

    /**
     * Load saved JQL to variable
    */
    (async () => {
        const result = await chrome.storage.sync.get(['JQL']);
        JQL = result.JQL;
    })();
</script>

<div>
    <Checkbox bind:value={notifications} label="Włącz powiadomienia"/>
    <label for="JQL">JQL:</label>
    <Input bind:value={JQL} id="JQL" />
    <Button click={saveSettings}>Zapisz</Button>
</div>
