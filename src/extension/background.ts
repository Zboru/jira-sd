// import { JQLSearch } from './types';

/**
 * Send notification
 * @returns void
 */
function sendNotification(): void {
  chrome.notifications.create({
    iconUrl: '/public/48.png',
    type: 'basic',
    title: 'Nowe zgłoszenie',
    message: 'Zostało utworzone nowe zgłoszenie: TASUP-11111',
  });
}

// async function searchJQL(): Promise<JQLSearch> {
//   const storageData: Record<string, string> = await chrome.storage.sync.get(['auth']);
//   if (!storageData) {
//     return {} as JQLSearch;
//   }
//   const query: Record<string, string> = await chrome.storage.sync.get(['JQL']);
//   const response = await fetch(`https://enetproduction.atlassian.net/rest/api/3/search?jql=${query.JQL}`, {
//     method: 'GET',
//     headers: {
//       Authorization: `Basic ${storageData.auth}`,
//       Accept: 'application/json',
//     },
//   });
//   return response.json();
// }

chrome.runtime.onMessage.addListener((message) => {
  if (message.notification) {
    sendNotification();
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  console.log('New item in storage', changes, areaName);
});

// const UPDATE_INTERVAL = 5000;
// const searchInterval = setInterval(async () => {
//   // const results = await searchJQL();
//   console.log(results);
// }, UPDATE_INTERVAL);

// setTimeout(() => {
//   clearInterval(searchInterval);
// }, 30000);
