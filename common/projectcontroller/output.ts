interface ProjectControllerOutputInterface {
    typingIndicator(): void;
    windowMessage(text: string): void;
    botMessage(text: string): void;
    variation(text: string): void;
    settings(settings: any, path?: string): void;
}
