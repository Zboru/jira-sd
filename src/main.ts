// const API_TOKEN = '2rtWbyPo7CP7v1Fmrelr9C55';
// const EMAIL = 'sebastian.zborowski@enp.pl';

import css from 'dom-css';
import { getElementsByText, notEmpty, waitForElement } from './helpers';
import {
  Issue, Nullable, SiteType,
} from './types';

class JIRAServiceDeskHelper {
  private currentIssues: Issue[] = [];

  private internalIssues: Issue[] = [];

  /**
   * Get details of JIRA issue
   * @param issueKey string
   * @returns Promise<Record<string, string>>
   */
  private async getIssueData(issueKey: Nullable<string>): Promise<Record<string, string>> {
    const storageData: Record<string, string> = await chrome.storage.sync.get(['auth']);
    if (!storageData) {
      return {};
    }
    const response = await fetch(`https://enetproduction.atlassian.net/rest/api/3/issue/${issueKey}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${storageData.auth}`,
        Accept: 'application/json',
      },
    });
    return response.json();
  }

  private async searchJira(query: string) {
    console.log(query);
    const storageData: Record<string, string> = await chrome.storage.sync.get(['auth']);
    if (!storageData) {
      return {};
    }
    const q = 'project in ("ENP Support", "TERG-ADAFIR SUPPORT") AND status not in (Resolved, Closed, "Waiting for release") AND Obszar is not EMPTY AND "Obszar[Select List (multiple choices)]" = MARKETING';
    const response = await fetch(`https://enetproduction.atlassian.net/rest/api/3/search?jql=${q}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${storageData.auth}`,
        Accept: 'application/json',
      },
    });
    return response.json();
  }

  /**
   * Get current type of site for different DOM operations
   * @returns SiteType | null
   */
  private getSiteType(): Nullable<SiteType> {
    const url = window.location.href;
    if (/filter/.test(url)) {
      return SiteType.FILTER;
    }
    if (/queues/.test(url)) {
      return SiteType.QUEUE;
    }
    return null;
  }

  /**
   * Get keys of issues from table, ex. (TASUP-12345)
   */
  private getIssueKeys(): string[] {
    const keyCells = Array.from(document.querySelectorAll('.issuekey a')) as HTMLElement[];
    if (keyCells.length) {
      return keyCells
        .map((cell) => cell.dataset.issueKey ?? null)
        .filter((key) => key) as string[];
    }
    return [];
  }

  /**
   * Save all issues details to currentIssues array
   * @returns Promise<void>
   */
  private async getIssuesData(): Promise<void> {
    const keys = this.getIssueKeys();
    const promises: Promise<any>[] = keys.map((key) => this.getIssueData(key));
    const result = await Promise.allSettled(promises);

    this.currentIssues = result.map((promise) => {
      if (promise.status === 'fulfilled') {
        return promise.value as Issue;
      }
      return null;
    }).filter(notEmpty);
  }

  /**
   * Save all linked internal issues details to internalIssues array
   * @returns Promise<void>
   */
  private async getInternalIssuesData(): Promise<void> {
    const internalKeys: string[] = [];
    this.currentIssues.forEach((issue: Issue) => {
      if (!issue.fields.issuelinks.length) {
        return;
      }

      // Exclude project links, take only area clones
      const projectRegExp = /KLER|TERG4|MSO|AMI/g;

      const issueKeys: string[] = this.getChildKeys(issue)
        .filter((key) => typeof key === 'string' && !projectRegExp.test(key)) as string[];

      internalKeys.push(...issueKeys);
    });

    const promises: Promise<any>[] = internalKeys.map((key) => this.getIssueData(key));
    const result = await Promise.allSettled(promises);
    this.internalIssues = result
      .filter(((promise) => promise.status === 'fulfilled'))
      .map((promise) => {
        const promiseResult = promise as PromiseFulfilledResult<Issue>;
        return promiseResult.value;
      });
  }

  /**
   * Returns 'Status' header basing on site type
   * @returns Element | null
   */
  private getStatusTableHeader(): Nullable<Element> {
    const siteType = this.getSiteType();
    if (siteType === SiteType.FILTER) {
      return document.querySelector('.headerrow-status');
    }
    if (siteType === SiteType.QUEUE) {
      const elements = getElementsByText('Status', 'div');
      return elements[0];
    }
    return null;
  }

  /**
   * Returns status element of given issue basing on site type
   * @param issueKey
   * @returns Element | null
   */
  private getStatusTableCell(issueKey: string): Nullable<Element> {
    const siteType = this.getSiteType();
    if (siteType === SiteType.FILTER) {
      return document.querySelector(`#issuetable tr.issuerow[data-issuekey="${issueKey}"] .status`);
    }
    if (siteType === SiteType.QUEUE) {
      const regexp = new RegExp(`${issueKey}-status`);
      const cells = Array.from(document.querySelectorAll('.virtual-table-row div[data-test-id]')) as HTMLElement[];
      const statusCell = cells.filter((cell) => regexp.test(cell.dataset.testId ?? '')).at(0);
      return statusCell ?? null;
    }
    return null;
  }

  /**
   * Create header for internal status cell
   * @returns void
   */
  private createInternalStatusHeader(): void {
    // Find status header
    const statusHeader = this.getStatusTableHeader();

    const siteType = this.getSiteType();
    let header;
    let span;
    if (siteType === SiteType.QUEUE) {
      header = document.createElement('div');
      span = document.createElement('span');
      css(header, {
        width: '182px',
        'margin-left': '0px',
        flex: '0 0 auto',
        display: 'flex',
        position: 'relative',
      });
    } else {
      header = document.createElement('th');
      span = document.createElement('span');
    }
    // Create table header

    span.innerText = 'Internal status';

    header.appendChild(span);
    statusHeader?.after(header);
  }

  /**
   * Wait for tables to load so script can scrap issue keys
   * @returns Promise<void>
   */
  private async waitForLoad(): Promise<void> {
    const siteType = this.getSiteType();
    if (siteType === SiteType.FILTER) {
      await waitForElement('.issue-table-container');
    }
    if (siteType === SiteType.QUEUE) {
      await waitForElement('.virtual-table-row');
    }
  }

  /**
   * 123
   * @TODO Dokończyć budowanie kontenerów dla poszczególnych stron bo dla queue
   * jest rozwalone + ogarnąć metodę stylowania poszczególnych klocków
   * @returns HTMLElement | null
   */
  private getCellContainer(): Nullable<HTMLElement> {
    const siteType = this.getSiteType();
    let container = null;
    if (siteType === SiteType.QUEUE) {
      container = document.createElement('div');
      container.style.flex = '0 0 auto';
      container.style.marginTop = '10px';
      container.style.width = '182px';
    }
    if (siteType === SiteType.FILTER) {
      const span = document.createElement('span');
      container = document.createElement('td');
      container.appendChild(span);
    }
    return container;
  }

  /**
   * Create internal status cell in each current issue
   * @returns void
   */
  private createInternalStatusCells(): void {
    this.currentIssues.forEach((issue) => {
      const internalRegExp = /MAR|PROD|EDI/g;
      const keys = this.getChildKeys(issue);
      const childIssue = keys
        .filter((key) => internalRegExp.test(key))
        .at(0);

      if (!childIssue) {
        return;
      }

      const statusCell = this.getStatusTableCell(issue.key ?? '');

      const cellContainer = this.getCellContainer() as HTMLElement;
      if (!cellContainer) {
        return;
      }
      const internal = this.getInternalIssueByKey(childIssue);

      cellContainer.innerText = internal?.fields.status.name ?? '';
      statusCell?.after(cellContainer);
    });
  }

  /**
   * Get all issue keys from child issues connected to parent issue
   * @param parentIssue Issue
   * @returns string[]
   */
  private getChildKeys(parentIssue: Issue): string[] {
    return parentIssue.fields.issuelinks
      .map((link) => link.inwardIssue?.key ?? link.outwardIssue?.key ?? '');
  }

  private getInternalIssueByKey(key: string): Issue|undefined {
    return this.internalIssues.find((issue) => issue.key === key);
  }

  /**
   * Function used to check if user provided credentials in extension popup
   */
  private async checkCredentials(): Promise<boolean> {
    const storageData: Record<string, string> = await chrome.storage.sync.get(['auth']);
    return JSON.stringify(storageData) !== '{}';
  }

  public async init(): Promise<void> {
    // Stop extension when user doesn't provided authentication
    if (!await this.checkCredentials()) {
      return;
    }
    await this.waitForLoad();
    await this.getIssuesData();
    await this.getInternalIssuesData();
    console.log(this.internalIssues);
    this.createInternalStatusHeader();
    this.createInternalStatusCells();

    // chrome.runtime.sendMessage({ notification: true });
  }
}

(async () => {
  const JSDH = new JIRAServiceDeskHelper();
  JSDH.init();
})();
