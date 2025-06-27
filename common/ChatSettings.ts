export interface ChatSettings {
  settings: {
    typingStyle: string;
    typingTime: integer;
    typingCharPSec: integer;
    showAvatar: boolean;
    avatarFile: string | null;
    name: string;
  };
}
