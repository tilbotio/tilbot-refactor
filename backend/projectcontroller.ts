// Helper classes to wire up the common ProjectController for use in the
// server.

import type {
    ProjectControllerLookupInterface,
    ProjectControllerLoggerInterface,
    ProjectControllerOutputInterface,
} from '../common/projectcontroller/types';

class ServerControllerLookup implements ProjectControllerLookupInterface {
    private csv_datas: { [key: string]: any; };
    private llm: any;

    constructor(csv_datas: { [key: string]: any; }, llm: any) {
        this.csv_datas = csv_datas;
        this.llm = llm;
    }

    async cell(db: string, col: string, val: string): Promise<string> {
        return await this.csv_datas[db].get(col, val);
    }

    async random(db: string): Promise<string> {
        return await this.csv_datas[db].get_random_line();
    }

    async variation(content: string, prompt: string, memory?: any): Promise<string> {
        return await this.llm.get_variation(content, prompt, memory != undefined, memory);
    }
}

class ServerControllerLogger implements ProjectControllerLoggerInterface {
    log(event: string, detail: string): void {
        // FIXME
    }

    set_participant_id(pid: string): void {
        // FIXME
    }
}
class ServerControllerOutput implements ProjectControllerOutputInterface {
    typingIndicator(): void {
        // FIXME
    }

    windowMessage(text: string): void {
        // FIXME
    }

    botMessage(block: { type: string, content: string, params: any; has_targets?: boolean; }): void {
        // FIXME
    }

    settings(settings: any, path?: string): void {
        // FIXME
    }
}
