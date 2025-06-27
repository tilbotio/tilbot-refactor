export interface RuntimeContext {
  path: string;
  conversationId: string | null;
  projectId: string | null;
  participantId: string | null;
}
