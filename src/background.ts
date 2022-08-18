chrome.runtime.onMessage.addListener((message) => {
  if (message.notification) {
    chrome.notifications.create({
      iconUrl: '/public/48.png',
      type: 'basic',
      title: 'Handler',
      message: 'siema',
    });
  }
});
