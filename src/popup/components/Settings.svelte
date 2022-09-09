<script lang="ts">
    import { selectItem } from "@/extension/types/types";
    import Logger from "@/extension/logger";

    import Button from "./General/Button.svelte";
    import Checkbox from "./General/Checkbox.svelte";
    import Input from "./General/Input.svelte";
    import Select from "./General/Select.svelte";

    let notifications: boolean = false;
    let JQL: string = "";
    async function saveSettings(): Promise<void> {
        console.log(notifications);
        
        await chrome.storage.sync.set({ JQL, notifications, area: selectedArea });
    }

    const areas: selectItem[] = [
        {name: 'Marketing', value: 'MAR'},
        {name: 'Produkt', value: 'PROD'},
        {name: 'Edytor', value: 'EDI'},
        {name: 'Customer', value: 'CRM'},
    ];
    let selectedArea: string = 'MAR';

    /**
     * Load saved data to variables
    */
    (async () => {
        const result = await chrome.storage.sync.get(['JQL', 'notifications', 'area']);
        Logger.warn('savedData', result)
        selectedArea = result.area;
        notifications = result.notifications
        JQL = result.JQL;
    })();
</script>

<div>
    <Input bind:value={JQL} label="JQL"/>
    <Checkbox class="my-2" bind:value={notifications} label="Włącz powiadomienia"/>
    <Select label="Obszar:" items={areas} bind:value={selectedArea}/>
    <div class="flex mt-2">
        <div class="flex-1"></div>
        <Button click={saveSettings}>Zapisz</Button>
    </div>
</div>
