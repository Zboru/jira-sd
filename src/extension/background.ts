import { uniqFromArrays } from './helpers';
import { JQLSearch, StoredIssue } from './types/types';

/**
 * Send notification
 * @returns void
 */
function sendNotification(issueKeys: string[]): void {
  chrome.notifications.create({
    iconUrl: '/public/48.png',
    type: 'basic',
    title: 'Nowe zgłoszenia',
    message: `Zostały utworzone nowe zgłoszenia: ${issueKeys.join(',')}`,
  });
}

async function checkCredentials(): Promise<boolean> {
  const storageData: Record<string, string> = await chrome.storage.sync.get(['auth']);
  return JSON.stringify(storageData) !== '{}';
}

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

/**
 * Check if there's added new issue to current
 * @param {string[]} issueKeys
 */
async function findNewIssue(issueKeys: string[]): Promise<string[] | null> {
  let { cachedIssuesKeys } = await chrome.storage.sync.get(['cachedIssuesKeys']);
  if (cachedIssuesKeys === undefined) {
    cachedIssuesKeys = [];
  }
  const newlyAddedIssues: string[] = issueKeys.filter((k) => !cachedIssuesKeys.includes(k));
  return newlyAddedIssues;
}

const UPDATE_INTERVAL = 5000;
(async () => {
  const { sendNotifications } = await chrome.storage.sync.get(['sendNotifications']);
  if (await checkCredentials() && sendNotifications) {
    setInterval(async () => {
      const results = await searchJQL();

      const issueKeys = results.issues.map((i) => i.key);

      const newIssues = await findNewIssue(issueKeys);
      if (newIssues?.length) {
        sendNotification(newIssues);
      }

      await chrome.storage.sync.set({ cachedIssuesKeys: issueKeys });
    }, UPDATE_INTERVAL);
  }
})();
