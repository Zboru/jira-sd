<script lang="ts">
    export let label: string;
    const randomNum = Math.floor(Math.random() * 999);
    export let id: string = `checkbox-${randomNum}`;
    export let value: boolean = false;
    
    let className = '';
    export { className as class }
</script>

<div class={className + ' flex items-center'}>
    <input
        {id}
        type="checkbox"
        bind:checked={value}
        class="w-4 h-4 select-none rounded-sm text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
    />
    <label
        for={id}
        class="ml-2 mb-0 text-sm font-medium text-gray-900 dark:text-gray-300"
    >
        {label}
    </label>
</div>
