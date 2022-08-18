// const API_TOKEN = '2rtWbyPo7CP7v1Fmrelr9C55';
// const EMAIL = 'sebastian.zborowski@enp.pl';

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
   * @returns Promise<void>
   */
  private async getInternalIssuesData(): Promise<void> {
    const internalKeys: string[] = [];
    this.currentIssues.forEach((issue: Issue) => {
      if (!issue.fields.issuelinks.length) {
        return;
      }
      const issueKeys: string[] = issue.fields.issuelinks
        .map((link) => link.outwardIssue?.key)
        .filter((key) => typeof key === 'string') as string[];

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

  private createInternalStatusHeader(): void {
    // Find status header
    const statusHeader = document.querySelector('.headerrow-status');

    // Create table header
    const header = document.createElement('th');
    const span = document.createElement('span');

    span.innerText = 'Internal status';
    header.appendChild(span);
    statusHeader?.after(header);
  }

  // private addHeader(title: string, positionAfter: string): void {
  //   const rowHeader = document.querySelector(positionAfter) as HTMLElement;
  //   if (rowHeader) {
  //     const newHeader = document.createElement('th');
  //     newHeader.classList.add('colHeaderLink', 'sortable');
  //     newHeader.innerHTML = title;
  //     rowHeader.after(newHeader);
  //   }
  // }

  // private createInternalStatusCell(): void {
  //   this.internalIssues.forEach((issue) => {
  //     console.log(issue.fields.issuelinks);

  //     const parentKey = issue.fields.issuelinks[0].inwardIssue.key;
  //     console.log('key', parentKey);

  //     const parentRow = document.querySelector(`#issuetable tr.issuerow[data-issuekey="${parentKey}"] .status`);
  //     const classes = 'jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-yellow jira-issue-status-lozenge-indeterminate aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium'
  //       .split(' ');
  //     const statusElement = document.createElement('span');
  //     const cell = document.createElement('td');
  //     cell.appendChild(statusElement);
  //     statusElement.classList.add(...classes);
  //     statusElement.innerHTML = issue.fields.status.name;
  //     console.log(statusElement);
  //     console.log(parentRow, `#issuetable tr.issuerow[data-issuekey="${parentKey}] .status"`);

  //     parentRow?.after(cell);
  //   });
  //   // const issues = Array.from(doc
  //   // ument.querySelectorAll('#issuetable tr.issuerow')) as HTMLElement[];
  //   // issues.forEach(issue => {
  //   //   const issueKey = issue.dataset.issuekey;

  //   // })
  // }

  public async init(): Promise<void> {
    await this.getIssuesData();
    await this.getInternalIssuesData();
    console.log(this.internalIssues);
    this.createInternalStatusHeader();
    // this.addHeader('Internal Status', '.headerrow-status');
    // this.createInternalStatusCell();
  }
}

(async () => {
  const JSDH = new JIRAServiceDeskHelper();
  JSDH.init();
})();
