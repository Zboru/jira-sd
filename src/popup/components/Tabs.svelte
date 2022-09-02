<script>
  import {
    Tab,
    TabGroup,
    TabList,
    TabPanel,
    TabPanels,
  } from "@rgossiaux/svelte-headlessui";
  import AuthForm from "./AuthForm.svelte";
</script>

<TabGroup>
  <TabList class="tablist">
    <Tab>Logowanie</Tab>
	<Tab>Status</Tab>
    <Tab>Ustawienia</Tab>
  </TabList>
  <TabPanels>
    <TabPanel class="px-4 py-2">
      <AuthForm />
    </TabPanel>
    <TabPanel class="px-4 py-2">Content 2</TabPanel>
  </TabPanels>
</TabGroup>

<style>
  :global(button[aria-selected="true"]) {
    @apply border-b-2 border-blue-700;
    transition: 0.05s ease-in all;
  }
</style>
