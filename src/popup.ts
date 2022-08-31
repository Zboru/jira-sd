const button = document.querySelector('button');

async function setDataStatus() {
  const credentials = await chrome.storage.sync.get(['auth']);
  const bool = JSON.stringify(credentials) !== '{}';
  const container = document.querySelector('#status') as HTMLElement;
  if (bool) {
    container!.innerText = '✅';
  } else {
    container!.innerText = '❌';
  }
}

(async () => {
  await setDataStatus();
})();

button?.addEventListener('click', async () => {
  const email = document.querySelector('#email') as HTMLInputElement;
  const token = document.querySelector('#token') as HTMLInputElement;

  if (!email || !token) {
    return;
  }

  const encryptedString = btoa(`${email.value}:${token.value}`);
  await chrome.storage.sync.set({ auth: encryptedString });
  await setDataStatus();
});
