<script>
  import {
    Tab,
    TabGroup,
    TabList,
    TabPanel,
    TabPanels,
  } from "@rgossiaux/svelte-headlessui";
  import AuthForm from "./AuthForm.svelte";
  import Settings from "./Settings.svelte";
</script>

<TabGroup>
  <TabList class="tablist">
    <Tab>Logowanie</Tab>
    <Tab>Ustawienia</Tab>
    <Tab>Status</Tab>
  </TabList>
  <TabPanels>
    <TabPanel class="px-4 py-2">
      <AuthForm />
    </TabPanel>
    <TabPanel class="px-4 py-2">
      <Settings />
    </TabPanel>
  </TabPanels>
</TabGroup>

<style>
  :global(button[aria-selected="true"]) {
    @apply border-b-2 border-blue-700;
    transition: 0.05s ease-in all;
  }
</style>
