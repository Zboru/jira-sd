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

chrome.runtime.onMessage.addListener((message) => {
  if (message.notification) {
    sendNotification();
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  console.log('New item in storage', changes, areaName);
});
