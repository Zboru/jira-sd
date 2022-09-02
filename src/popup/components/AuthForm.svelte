<script lang="ts">
  //2rtWbyPo7CP7v1Fmrelr9C55
  let authState = "";
  let email: string = "";
  let token: string = "";

  /**
   * Set authState variable basing on saved credentials in localStorage
   * @returns Promise<void>
   */
  async function setDataStatus(): Promise<void> {
    const credentials = await chrome.storage.sync.get(["auth"]);
    const bool = JSON.stringify(credentials) !== "{}";
    authState = bool ? "✅" : "❌";
  }

  /**
   * Check if provided user data is valid by sending request to JIRA
   * @returns Promise<void>
   */
  async function checkCredentials(): Promise<void> {
    const auth = btoa(`${email}:${token}`);
    try {
      const request = await fetch(
        `https://enetproduction.atlassian.net/rest/auth/1/session`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${auth}`,
            Accept: "application/json",
          },
        }
      );
      const response = await request.json();
      if (response) {
        await chrome.storage.sync.set({ auth });
        authState = "✅";
      }
    } catch (error) {
      authState = "❌";
    }
  }

  setDataStatus();
</script>

<div class="authForm">
  <label for="email"
    >Adres e-mail: <span class="text-xs text-gray-400 italic"
      >(imie.nazwisko@enp.pl)</span
    ></label
  >
  <input type="email" bind:value={email} id="email" />
  <label for="token"
    >Token API:
    <a
      class="text-blue-400 text-xs italic"
      target="_blank"
      href="https://id.atlassian.com/manage-profile/security/api-tokens"
      >Tutaj</a
    >
  </label>
  <input type="text" bind:value={token} id="token" />
  <div class="flex items-center justify-between mb-2">
    <p class="font-medium text-sm">
      Status danych: <span class="">{authState}</span>
    </p>
    <div class="flex-1" />
    <button
      on:click={checkCredentials}
      class="bg-blue-700 hover:bg-blue-500 text-sm text-white focus:ring-4 focus:ring-blue-300 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      type="button"
    >
      Zapisz dane
    </button>
  </div>
</div>
