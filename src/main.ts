// const API_TOKEN = '2rtWbyPo7CP7v1Fmrelr9C55';
// const EMAIL = 'sebastian.zborowski@enp.pl';

import { Issue } from './types';

class JIRAServiceDeskHelper {
  private API_TOKEN: string = '2rtWbyPo7CP7v1Fmrelr9C55';

  private EMAIL: string = 'sebastian.zborowski@enp.pl';

  private AREA: string = 'MAR';

  private currentIssues: any[] = [];

  private internalIssues: Issue[] = [];

  /**
   * Get details of JIRA issue
   * @param issueKey string
   * @returns Promise<Record<string, string>>
   */
  private async getIssueData(issueKey: string): Promise<Record<string, string>> {
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
   * Get keys of issues from table, ex. (TASUP-12345|null)
   * @returns (string|null)[]
   */
  private getTableIssueKeys(): (string|null)[] {
    if (!document.querySelector('#issuetable tr.issuerow')) {
      return [];
    }

    const issues = Array.from(document.querySelectorAll('#issuetable tr.issuerow')) as HTMLElement[];
    return issues.map((issue) => issue.dataset.issuekey ?? null);
  }

  /**
   * Get data of issues from current
   */
  private async getCurrentDetails(): Promise<void> {
    const keys = this.getTableIssueKeys();

    const promises: Promise<any>[] = [];
    keys.forEach((key) => {
      if (key) {
        promises.push(this.getIssueData(key));
      }
    });
    const result = await Promise.allSettled(promises);
    this.currentIssues = result.map((promise) => {
      if (promise.status === 'fulfilled') {
        return promise.value as Issue;
      }
      return null;
    }).filter((promise) => promise);
  }

  /**
   * ds
   */
  private async getInternalIssuesData() {
    const internalKeys = this.currentIssues.map((issue: Issue) => {
      if (!issue.fields.issuelinks.length) {
        return null;
      }

      const areaIssue = issue.fields.issuelinks
        ?.filter((link) => new RegExp(this.AREA).test(link.outwardIssue.key));
      return areaIssue[0] ? areaIssue[0].outwardIssue.key : null;
    });
    const promises: Promise<any>[] = [];
    internalKeys.forEach((key) => {
      if (key) {
        promises.push(this.getIssueData(key));
      }
    });
    const result = await Promise.allSettled(promises);
    this.internalIssues = result
      .filter(((promise) => promise.status === 'fulfilled'))
      .map((promise) => {
        const promiseResult = promise as PromiseFulfilledResult<Issue>;
        return promiseResult.value;
      });
  }

  private addHeader(title: string, positionAfter: string): void {
    const rowHeader = document.querySelector(positionAfter) as HTMLElement;
    if (rowHeader) {
      const newHeader = document.createElement('th');
      newHeader.classList.add('colHeaderLink', 'sortable');
      newHeader.innerHTML = title;
      rowHeader.after(newHeader);
    }
  }

  private createInternalStatusCell(): void {
    this.internalIssues.forEach((issue) => {
      console.log(issue.fields.issuelinks);

      const parentKey = issue.fields.issuelinks[0].inwardIssue.key;
      console.log('key', parentKey);

      const parentRow = document.querySelector(`#issuetable tr.issuerow[data-issuekey="${parentKey}"] .status`);
      const classes = 'jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-yellow jira-issue-status-lozenge-indeterminate aui-lozenge-subtle jira-issue-status-lozenge-max-width-medium'
        .split(' ');
      const statusElement = document.createElement('span');
      const cell = document.createElement('td');
      cell.appendChild(statusElement);
      statusElement.classList.add(...classes);
      statusElement.innerHTML = issue.fields.status.name;
      console.log(statusElement);
      console.log(parentRow, `#issuetable tr.issuerow[data-issuekey="${parentKey}] .status"`);

      parentRow?.after(cell);
    });
    // const issues = Array.from(doc
    // ument.querySelectorAll('#issuetable tr.issuerow')) as HTMLElement[];
    // issues.forEach(issue => {
    //   const issueKey = issue.dataset.issuekey;

    // })
  }

  public async init(): Promise<void> {
    await this.getCurrentDetails();
    await this.getInternalIssuesData();
    this.addHeader('Internal Status', '.headerrow-status');
    this.createInternalStatusCell();
  }
}

(async () => {
  const JSDH = new JIRAServiceDeskHelper();
  JSDH.init();
})();
