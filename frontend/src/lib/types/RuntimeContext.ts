export interface RuntimeContext {
  path: string;
  conversationId: string | null;
  isTilbotEditor: boolean;
  showHeader: boolean;
  projectId: string | null;
  participantId: string | null;
}
