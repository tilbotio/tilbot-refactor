import type { ProjectControllerLookupInterface } from "../../../../common/projectcontroller/types";

export class ChatLookup implements ProjectControllerLookupInterface {
    async cell(db: string, col: string, val: string): Promise<Object[] | null> {
        return await null;        
    }

    async random(db: string): Promise<Object | null> {
        return await null;
    }

    async variation(content: string, prompt: string, memory: any): Promise<string> {
        return await "null"
    }
}