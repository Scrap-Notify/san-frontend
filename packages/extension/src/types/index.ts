import type { SourceType } from '@san/shared';

export interface PendingScrap {
  source_type: SourceType;
  source_url: string | null;
  raw_content: string | null;
  image_url: string | null;
  title: string;
  domain: string;
  favicon: string | null;
}

export interface SavedInsight extends PendingScrap {
  id: string;
  created_at: string;
}

export type MessageType =
  | 'REQUEST_METADATA'
  | 'SCRAP_SELECTION'
  | 'PUSH_TO_SIDEPANEL';

export interface ExtensionMessage {
  type: MessageType;
  payload?: PendingScrap;
}
