export interface IssueLinkType {
    id: string;
    name: string;
    inward: string;
    outward: string;
}

export interface IssueOutwardIssue {
    id: string;
    key: string;
    self: string;
}

export interface IssueLink {
    id: string;
    outwardIssue?: IssueOutwardIssue;
    inwardIssue?: IssueOutwardIssue;
    self: string;
    type: IssueLinkType;
}

export interface IssueStatus {
    description: string;
    iconUrl: string;
    id: string;
    name: string;
    self: string;
}

export interface IssueFields {
    issuelinks: IssueLink[];
    status: IssueStatus;
}

export interface Issue {
    expand: string;
    fields: IssueFields;
    id: string;
    key: string;
    self: string;
}

export interface JQLSearch {
    expand: string;
    issues: Issue[];
    maxResults: number;
    startAt: number;
    total: number;
}

export enum SiteType {
    QUEUE, FILTER
}

export type Nullable<T> = T | null;
