import { uniqFromArrays } from './helpers';
import { JQLSearch, StoredIssue } from './types/types';

/**
 * Send notification
 * @returns void
 */
let currentNotificationId: string = '';
let notificationIssueKey: string = '';
function sendNewIssueNotification(key: string): void {
  chrome.notifications.create({
    iconUrl: '/public/48.png',
    type: 'basic',
    title: 'Nowe zgłoszenia',
    message: `Zostały utworzone nowe zgłoszenia: ${key}`,
    buttons: [{
      title: 'Przejdź do zgłoszenia',
    }],
  }, (id) => {
    currentNotificationId = id;
    notificationIssueKey = key;
  });
}

/**
 * Check changes in chrome storage to find if there's new issues
 * so we can push notification to user
 * @param changes Record<string, any>
 */
function checkNewIssues(changes: Record<string, any>) {
  const issues = changes.currentIssues;
  if (issues) {
    const { oldValue, newValue } = issues;
    if (newValue > oldValue) {
      const oldKeys = oldValue.map((issue: StoredIssue) => issue.key);
      const newKeys = newValue.map((issue: StoredIssue) => issue.key);
      const uniqKeys = uniqFromArrays(newKeys, oldKeys);
      uniqKeys.forEach(sendNewIssueNotification);
    }
  }
}

/**
 * Send search query provided by user to Jira to find issues
 * @returns Promise<JQLSearch>
 */
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

chrome.storage.onChanged.addListener(async (changes) => {
  checkNewIssues(changes);
  console.log('New item in storage', changes);
});

/**
 * Search issue interval
 */
const UPDATE_INTERVAL = 60 * 1000;
setInterval(async () => {
  const results = await searchJQL();
  const issues = results.issues.map((issue) => ({
    key: issue.key,
    status: issue.fields.status.name,
    url: `https://enetproduction.atlassian.net/browse/${issue.key}`,
  }));
  await chrome.storage.sync.set({ currentIssues: issues });
}, UPDATE_INTERVAL);

chrome.notifications.onButtonClicked.addListener(async (notifId, btnIdx) => {
  const result: Record<string, StoredIssue[]> = await chrome.storage.sync.get(['currentIssues']);
  const storedIssues: StoredIssue[] = result.currentIssues;
  if (storedIssues) {
    const issue = storedIssues.find((i) => i.key === notificationIssueKey);
    if (notifId === currentNotificationId) {
      if (btnIdx === 0) {
        chrome.tabs.create({ url: issue?.url ?? '#' });
      }
    }
  }
});

sendNewIssueNotification('TASUP-13078');
