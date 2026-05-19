export type MailTray = 'inbox' | 'starred' | 'drafts' | 'sent' | 'trash' | 'archive';

export interface EmailAddress {
  name: string;
  email: string;
}

export interface Attachment {
  id: string;
  name: string;
  sizeBytes: number;
  type: string;
  url?: string;
}

export interface Mail {
  id: string;
  tray: MailTray;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  snippet: string;
  body: string;
  dateISO: string;
  read: boolean;
  starred: boolean;
  labels: string[];
  attachments?: Attachment[];
  threadId?: string;
}

export interface MailFolder {
  id: MailTray;
  name: string;
  icon: string;
  unreadCount: number;
  totalCount: number;
}

export interface MailLabel {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface MailListQuery {
  tray: MailTray;
  q?: string;
  cursor?: string;
  limit?: number;
  filter?: 'unread' | 'starred' | 'attachments';
}

export interface MailListResponse {
  messages: Mail[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface UpdateMailDto {
  read?: boolean;
  starred?: boolean;
  tray?: MailTray;
  labels?: string[];
}

export interface ComposeDraftDto {
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  body: string;
  attachments?: Attachment[];
}

export interface SendReplyDto {
  replyToId: string;
  body: string;
}
