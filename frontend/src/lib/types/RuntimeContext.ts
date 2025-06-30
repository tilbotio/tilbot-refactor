export interface RuntimeContext {
  path: string;
  conversationId: string | null;
  showHeader: boolean;
  projectId: string | null;
  participantId: string | null;
}
