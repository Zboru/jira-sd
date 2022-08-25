const button = document.querySelector('button');

(async () => {
  const credentials = await chrome.storage.sync.get(['auth']);
  console.log(credentials);
})();

button?.addEventListener('click', async () => {
  const email = document.querySelector('#email') as HTMLInputElement;
  const token = document.querySelector('#token') as HTMLInputElement;

  if (!email || !token) {
    return;
  }

  const encryptedString = btoa(`${email.value}:${token.value}`);
  await chrome.storage.sync.set({ auth: encryptedString });
});
