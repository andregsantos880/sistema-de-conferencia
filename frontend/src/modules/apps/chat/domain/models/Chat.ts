export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface ChatMessage {
  id: string;
  convId: string;
  fromMe: boolean;
  text: string;
  at: string; // ISO timestamp
  status: MessageStatus;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'link' | 'voice';
  url: string;
  name?: string;
  size?: number;
  thumbnail?: string;
}

export interface Conversation {
  id: string;
  title: string;
  avatar?: string;
  unread: number;
  lastAt: string; // ISO timestamp
  lastMessage?: string;
  online?: boolean;
  typing?: boolean;
  favorite?: boolean;
  muted?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  email?: string;
  about?: string;
  online?: boolean;
  media: MediaItem[];
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'link' | 'doc';
  url: string;
  thumbnail?: string;
  title?: string;
  date: string;
}

export interface SendMessageDto {
  convId: string;
  text: string;
  attachments?: Attachment[];
}

export interface ConversationFilters {
  q?: string;
  filter?: 'all' | 'unread' | 'favorites' | 'groups';
}

export interface MessagesQuery {
  convId: string;
  cursor?: string;
  limit?: number;
}

export interface MessagesResponse {
  messages: ChatMessage[];
  nextCursor?: string;
  hasMore: boolean;
}
