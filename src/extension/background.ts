import { uniqFromArrays } from './helpers';
import { JQLSearch, StoredIssue } from './types';

/**
 * Send notification
 * @returns void
 */
let myNotificationID:string = '';
function sendNewIssuesNotification(keys: string[]): void {
  chrome.notifications.create({
    iconUrl: '/public/48.png',
    type: 'basic',
    title: 'Nowe zgłoszenia',
    message: `Zostały utworzone nowe zgłoszenia: ${keys.join(',')}`,
    buttons: [{
      title: 'Przejdź do zgłoszenia',
    }],
  }, (id) => {
    myNotificationID = id;
  });
}

function checkNewIssues(changes: Record<string, any>) {
  const issues = changes.currentIssues;
  if (issues) {
    const { oldValue, newValue } = issues;
    if (newValue > oldValue) {
      const oldKeys = oldValue.map((issue: StoredIssue) => issue.key);
      const newKeys = newValue.map((issue: StoredIssue) => issue.key);
      const uniqKeys = uniqFromArrays(newKeys, oldKeys);
      sendNewIssuesNotification(uniqKeys);
    }
  }
}

// function check

async function searchJQL(): Promise<JQLSearch> {
  const storageData: Record<string, string> = await chrome.storage.sync.get(['auth']);
  if (!storageData) {
    return {} as JQLSearch;
  }
  const query: Record<string, string> = await chrome.storage.sync.get(['JQL']);
  const response = await fetch(`https://enetproduction.atlassian.net/rest/api/3/search?jql=${query.JQL}`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${storageData.auth}`,
      Accept: 'application/json',
    },
  });
  return response.json();
}

chrome.storage.onChanged.addListener(async (changes, areaName) => {
  checkNewIssues(changes);
  console.log('New item in storage', changes, areaName);
});

const UPDATE_INTERVAL = 5000;
setInterval(async () => {
  const results = await searchJQL();
  const issues = results.issues.map((issue) => ({
    key: issue.key,
    status: issue.fields.status.name,
    url: `https://enetproduction.atlassian.net/browse/${issue.key}`,
  }));
  await chrome.storage.sync.set({ currentIssues: issues });
}, UPDATE_INTERVAL);

sendNewIssuesNotification(['test']);

chrome.notifications.onButtonClicked.addListener((notifId, btnIdx) => {
  if (notifId === myNotificationID) {
    if (btnIdx === 0) {
      chrome.tabs.create({ url: 'https://google.com' }, (tab) => {});
    }
  }
});
