import css from 'dom-css';
import {
  getElementsByText, isFulfilled, notEmpty, waitForElement,
} from './helpers';
import Logger from './logger';
import {
  Issue, Nullable, SiteType,
} from './types/types';

class JIRAServiceDeskHelper {
  private currentIssues: Issue[] = [];

  private internalIssues: Issue[] = [];

  /**
   * Get details of JIRA issue
   * @param issueKey string
   * @returns Promise<Record<string, string>>
   */
  private async getIssueData(issueKey: Nullable<string>): Promise<Issue | null> {
    const storageData: Record<string, string> = await chrome.storage.sync.get(['auth']);
    if (!storageData || issueKey === null) {
      return null;
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

  /**
   * Get current type of site for different DOM operations
   * @returns {SiteType}
   */
  private getSiteType(): SiteType {
    const url = window.location.href;
    if (/queues/.test(url)) {
      return SiteType.QUEUE;
    }
    return SiteType.FILTER;
  }

  /**
   * Get keys of issues from table, ex. (TASUP-12345)
   */
  private getIssueKeys(): string[] {
    const keyTableCells = Array.from(document.querySelectorAll('.issuekey a')) as HTMLElement[];

    if (!keyTableCells.length) {
      return [];
    }

    return keyTableCells
      .map((cell) => cell.dataset.issueKey)
      .filter(notEmpty);
  }

  /**
   * Get and save details of issues to currentIssues array
   * @returns {Promise<void>}
   */
  private async getIssuesData(): Promise<void> {
    const keys = this.getIssueKeys();
    Logger.info('Found keys:', keys);

    const promises: Promise<Issue | null>[] = keys.map((key) => this.getIssueData(key));

    const result = await Promise.allSettled(promises);

    this.currentIssues = result
      .filter(isFulfilled)
      .map((promise) => promise.value)
      .filter(notEmpty);

    Logger.info('Current issues are saved', this.currentIssues);
  }

  /**
   * Get and save all details of linked internal issues to internalIssues array
   * @returns {Promise<void>}
   */
  private async getInternalIssuesData(): Promise<void> {
    const internalKeys: string[] = [];

    this.currentIssues.forEach((issue: Issue) => {
      if (!issue.fields.issuelinks.length) {
        return;
      }

      // Exclude project links, take only area clones
      const projectRegExp = /KLER|TERG4|MSO|AMI|ENPSUP|TASUP/g;

      const issueKeys: string[] = this.getChildKeys(issue)
        .filter(notEmpty)
        .filter((key) => !projectRegExp.test(key));

      internalKeys.push(...issueKeys);
    });

    const promises: Promise<any>[] = internalKeys.map((key) => this.getIssueData(key));

    const result = await Promise.allSettled(promises);

    this.internalIssues = result
      .filter(isFulfilled)
      .map((promise) => promise.value)
      .filter(notEmpty);

    Logger.info('Internal issues are saved', this.internalIssues);
  }

  /**
   * Returns 'Status' table header element basing on site type
   * @returns {Element | null}
   */
  private getStatusTableHeader(): Nullable<Element> {
    const siteType = this.getSiteType();
    if (siteType === SiteType.FILTER) {
      return document.querySelector('.headerrow-status');
    }
    if (siteType === SiteType.QUEUE) {
      return getElementsByText('Status', 'div')[0];
    }
    return null;
  }

  /**
   * Create header for internal status cell
   * @returns {void}
   */
  private createInternalStatusHeader(): void {
    // Find status header
    const statusHeader = this.getStatusTableHeader();
    Logger.info('Found table header:', statusHeader);

    let header;
    let span;

    const siteType = this.getSiteType();
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
    span.id = 'internal-status';
    span.innerText = 'Internal status';

    header.appendChild(span);
    statusHeader?.after(header);

    Logger.info("Creating 'Internal status' header:", header);
  }

  /**
   * Wait for tables to load so script can retrieve issue keys
   * @returns {Promise<void>}
   */
  private async waitForLoad(): Promise<void> {
    const siteType = this.getSiteType();
    if (siteType === SiteType.FILTER) {
      await waitForElement('.headerrow-status');
    }
    if (siteType === SiteType.QUEUE) {
      await waitForElement('.virtual-table-row');
    }
    Logger.info('Table content is loaded');
  }

  /**
   * Create containers for internal issue status
   * Different pages have different styles and types of containers
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
   * Returns 'Status' table cell of given issue basing on site type
   * @param {string} issueKey
   * @returns {Element | null}
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
   * Create internal status cell in each current issue
   * @returns void
   */
  private createInternalStatusCells(): void {
    this.currentIssues.forEach((issue) => {
      const internalRegExp = /MAR|PROD|EDI|CRM/g;
      const keys = this.getChildKeys(issue);
      const childIssue = keys
        .filter(notEmpty)
        .filter((key) => internalRegExp.test(key))
        .at(0);

      const statusCell = this.getStatusTableCell(issue.key ?? '');

      const cellContainer = this.getCellContainer() as HTMLElement;

      if (!cellContainer) {
        return;
      }

      if (childIssue) {
        const internal = this.internalIssues
          .find((internalIssue) => internalIssue.key === childIssue);
        cellContainer.innerText = internal?.fields.status.name ?? '';
      } else {
        cellContainer.innerHTML = '<i>Brak w??tku</i>';
      }

      statusCell?.after(cellContainer);
    });
  }

  /**
   * Get all issue keys from child issues connected to parent issue
   * @param parentIssue Issue
   * @returns {(string | null)[]}
   */
  private getChildKeys(parentIssue: Issue): (string | null)[] {
    return parentIssue.fields.issuelinks
      .map((link) => link.inwardIssue?.key ?? link.outwardIssue?.key ?? null);
  }

  /**
   * Function used to check if user provided credentials in extension popup
   */
  private async checkCredentials(): Promise<boolean> {
    const result: Record<string, string> = await chrome.storage.sync.get(['auth']);
    const authData = result.auth;
    return JSON.stringify(authData ?? {}) !== '{}';
  }

  /**
   * Mount observer that initializes header when user changes filter or something with table
   */
  private mountObserver(): void {
    const siteType = this.getSiteType();
    let container;
    if (siteType === SiteType.FILTER) {
      container = document.querySelector('.navigator-content')!;
    } else {
      container = document.querySelector('div[data-test-id="servicedesk-queues-agent-view.layout.layout"')!;
    }
    const observer = new MutationObserver(async (mutations) => {
      Logger.info('Table changed!', mutations);
      if (document.querySelector('#internal-status')) {
        return;
      }
      // If DOM changed and there's no internal status header, create new one
      await this.waitForLoad();
      await this.getIssuesData();
      await this.getInternalIssuesData();
      this.createInternalStatusHeader();
      this.createInternalStatusCells();
    });

    observer.observe(container, { subtree: true, childList: true });
  }

  public async init(): Promise<void> {
    // Stop extension when user doesn't provided authentication
    if (!await this.checkCredentials()) {
      return;
    }
    Logger.info('Logged in!');
    await this.waitForLoad();
    await this.getIssuesData();
    await this.getInternalIssuesData();
    this.createInternalStatusHeader();
    this.createInternalStatusCells();
    this.mountObserver();
  }
}

(() => {
  new JIRAServiceDeskHelper().init();
})();
