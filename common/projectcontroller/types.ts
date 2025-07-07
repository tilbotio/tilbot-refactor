
export interface ProjectControllerInterface<ProjectControllerOutputType extends ProjectControllerOutputInterface> {
    readonly output: ProjectControllerOutputType;
    message_sent_event(): void;
    receive_message(str: string): void;
    log(str: string): void;
    set_participant_id(pid: string): void;
}

export interface ProjectControllerLookupInterface {
    cell(db: string, col: string, val: string): Promise<Object[] | null>;
    random(db: string): Promise<Object | null>;
    variation(content: string, prompt: string, memory: any): Promise<string>;
}

export interface ProjectControllerLoggerInterface {
    log(event: string, detail: string): void;
    set_participant_id(pid: string): void;
}

export interface ProjectControllerOutputInterface {
    typingIndicator(): void;
    windowMessage(text: string): void;
    botMessage(block: { type: string, content: string, params: any; has_targets?: boolean; }): void;
    settings(settings: any, path?: string): void;
}
