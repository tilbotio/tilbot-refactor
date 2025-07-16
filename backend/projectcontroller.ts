// Helper classes to wire up the common ProjectController for use in the
// server.

import type {
    ProjectControllerLookupInterface,
    ProjectControllerOutputInterface,
} from '../common/projectcontroller/types';

export class ServerControllerLookup implements ProjectControllerLookupInterface {
  private csv_datas: { [key: string]: any };
  private llm: any;

  constructor(csv_datas: { [key: string]: any }, llm: any) {
    this.csv_datas = csv_datas;
    this.llm = llm;
  }

  async cell(db: string, col: string, val: string): Promise<Object[] | null> {
    const csv = this.csv_datas[db];
    if (csv === undefined) {
      return null;
    }
    return await csv.get(col, val);
  }

  async random(db: string): Promise<Object | null> {
    const csv = this.csv_datas[db];
    if (csv === undefined) {
      return null;
    }
    return await csv.get_random_line();
  }

  async variation(
    content: string,
    prompt: string,
    memory?: any
  ): Promise<string> {
    return await this.llm.get_variation(
      content,
      prompt,
      memory != undefined,
      memory
    );
  }
}

export class ServerControllerOutput implements ProjectControllerOutputInterface {
    private _socket: WebSocket | null = null;
    private pending: any[] = [];

    emit(...message: any[]) {
        this.pending.push(JSON.stringify(message));
        this.flushSocket();
    }

    flushSocket() {
        const socket = this._socket;
        if (socket != null) {
            const pending = this.pending;
            for (const p of this.pending) {
                socket.send(p);
            }
            pending.length = 0;
        }
    }

    get socket() {
        return this._socket;
    }

    set socket(socket: WebSocket | null) {
        this._socket = socket;
        if (socket == null) {
            return;
        }

        this.flushSocket();

        socket.addEventListener('close', () => {
            if (this._socket === socket) {
                this._socket = null;
            }
        });
    }

    typingIndicator(): void {
        this.emit('typing indicator');
    }

    windowMessage(text: string): void {
        this.emit('window message', { content: text });
    }

    botMessage(block: { type: string, content: string, params: any; has_targets?: boolean; }): void {
        this.emit('bot message', block);
    }

    settings(settings: any, path?: string): void {
        this.emit('settings', settings, path);
    }
}
