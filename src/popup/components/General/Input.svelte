<script lang="ts">
    const randomNum = Math.floor(Math.random() * 999);
    export let id: string = `input-${randomNum}`;

    export let label: string = ''
    export let value: string = '';
</script>

<label for={id}>{label}</label>
<input bind:value {id} class='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight mb-2' />
