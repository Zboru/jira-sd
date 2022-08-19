// const API_TOKEN = '2rtWbyPo7CP7v1Fmrelr9C55';
// const EMAIL = 'sebastian.zborowski@enp.pl';

import css from 'dom-css';
import { getElementsByText, waitForElement } from './helpers';
import { Issue, Nullable, SiteType } from './types';

class JIRAServiceDeskHelper {
  private API_TOKEN: string = '2rtWbyPo7CP7v1Fmrelr9C55';

  private EMAIL: string = 'sebastian.zborowski@enp.pl';

  private currentIssues: any[] = [];

  private internalIssues: Issue[] = [];

  /**
   * Get details of JIRA issue
   * @param issueKey string
   * @returns Promise<Record<string, string>>
   */
  private async getIssueData(issueKey: Nullable<string>): Promise<Record<string, string>> {
    const response = await fetch(`https://enetproduction.atlassian.net/rest/api/3/issue/${issueKey}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${btoa(
          `${this.EMAIL}:${this.API_TOKEN}`,
        )}`,
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
    }).filter((promise) => promise);
  }

  /**
   * Save all linked internal issues details to internalIssues array
   * @TODO Jest problem kiedy ktoś źle sklonuje wątek i wątek wewnętrzny
   * znajduje się w inwardIssue, a nie w outwardIssue - trzeba znaleźć rozwiązanie
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

      const issueKeys: string[] = issue.fields.issuelinks
        .map((link) => link.outwardIssue?.key)
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

    // Create table header
    const header = document.createElement('th');
    const span = document.createElement('span');

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
    }
    if (siteType === SiteType.FILTER) {
      container = document.createElement('span');
    }
    css(container, {
      'font-family': "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,'Fira Sans','Droid Sans','Helvetica Neue',sans-serif",
      color: 'var(--ds-text,#5e6c84)',
      'font-style': 'normal',
      'font-size': '12px',
      'font-weight': '600',
      'line-height': '16px',
      'text-transform': 'uppercase',
      'margin-top': '0',
      padding: '2px 4px 3px',
      'background-color': '#deebff',
      'border-color': '#deebff',
      display: 'inline-block',
      'padding-bottom': 4,
      'padding-top': 4,
    });
    return container;
  }

  /**
   * Create internal status cell in each current issue
   * @returns void
   */
  private createInternalStatusCells(): void {
    this.internalIssues.forEach((issue) => {
      const bugRegExp = /TASUP|ENPSUP/g;
      const parentIssueLink = issue.fields.issuelinks
        .filter((link) => bugRegExp.test(link.inwardIssue?.key ?? ''))
        .at(0);

      if (!parentIssueLink) {
        return;
      }

      const statusCell = this.getStatusTableCell(parentIssueLink.inwardIssue?.key ?? '');

      const cellContainer = this.getCellContainer() as HTMLElement;
      cellContainer.innerText = issue.fields.status.name;
      statusCell?.after(cellContainer);
    });
  }

  public async init(): Promise<void> {
    await this.waitForLoad();
    await this.getIssuesData();
    await this.getInternalIssuesData();
    console.log(this.internalIssues);
    this.createInternalStatusHeader();
    this.createInternalStatusCells();
  }
}

(async () => {
  const JSDH = new JIRAServiceDeskHelper();
  JSDH.init();
})();
