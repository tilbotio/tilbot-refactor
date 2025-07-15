import type {
    ProjectControllerInterface,
    ProjectControllerOutputInterface,
} from './types';

class RemoteProjectController implements ProjectControllerInterface<ProjectControllerOutputInterface> {
    private _output: ProjectControllerOutputInterface;
    private _pending: string[] = [];
    private _socket: any = null;

    constructor(output: ProjectControllerOutputInterface) {
        this._output = output;
    }

    emit(...message: any[]) {
        this._pending.push(JSON.stringify(message));
        this.flushSocket();
    }

    flushSocket() {
        const socket = this._socket;
        if (socket != null) {
            const pending = this._pending;
            for (const p of this._pending) {
                socket.send(p);
            }
            pending.length = 0;
        }
    }

    get socket() {
        return this._socket;
    }

    get output() {
        return this._output;
    }

    set socket(socket: any) {
        if (socket == null) {
            this._socket = null;
            return;
        }

        socket.addEventListener('open', () => {
            if (this.socket) {
                // We're late to the party.
                socket.close();
            } else {
                this.flushSocket();
            }
        });

        socket.addEventListener('close', () => {
            if (this._socket === socket) {
                this._socket = null;
            }
        });

        socket.addEventListener('message', (e: MessageEvent) => {
            const [command, ...args] = JSON.parse(e.data);
            switch (command) {
                case 'bot message':
                    this._output.botMessage(...(args as [any]));
                    break;

                case 'window message':
                    this._output.windowMessage(...(args as [any]));
                    break;

                case 'settings':
                    this._output.settings(...(args as [any, string]));
                    break;

                case 'typing indicator':
                    this._output.typingIndicator();
                    break;
            }
        });
    }

    message_sent_event() {
        this.emit('message sent');
    }

    receive_message(str: string) {
        this.emit('user_message', str);
    }

    log(str: string) {
        this.emit('log', str);
    }

    set_participant_id(pid: string) {
        this.emit('pid', pid);
    }
}


export { RemoteProjectController };
