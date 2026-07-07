import { type ExternalLink } from "../project/types";

export interface ProjectControllerInterface<
  ProjectControllerOutputType extends ProjectControllerOutputInterface
> {
  readonly output: ProjectControllerOutputType;
  message_sent_event(): void;
  receive_message(str: string): void;
  log(str: string): void;
  set_participant_id(pid: string): void;
}

export interface ProjectControllerLookupInterface {
  cell(db: string, col: string, val: string): Promise<Object[] | null>;
  column(
    table: string,
    col: string,
    filterCol: string | null,
    filterVal: string | null
  ): Promise<any[] | null>;
  random(table: string): Promise<any | null>;
  apiCall(
    external_link: ExternalLink,
    user_input: string,
    connectors: string[]
  ): Promise<any | null>;
}

export interface ProjectControllerLoggerInterface {
  log(event: string, detail: string): void;
  set_participant_id(pid: string): void;
}

export interface ProjectControllerOutputInterface {
  typingIndicator(): void;
  windowMessage(text: string, params: []): void;
  botMessage(block: {
    type: string;
    content: string;
    params: any;
    has_targets?: boolean;
    timeExpired?: number;
  }): void;
  settings(settings: any, path?: string): void;
}
