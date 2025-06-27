import type {
    ProjectControllerInterface,
    ProjectControllerOutputInterface,
} from './types';

class RemoteProjectController implements ProjectControllerInterface {
    private output: ProjectControllerOutputInterface;
    private pending: string[] = [];
    private _socket: any = null;

    constructor(output: ProjectControllerOutputInterface) {
        this.output = output;
    }

    emit(...message: any[]) {
        const socket = this._socket;
        if (socket == null) {
            this.pending.push(JSON.stringify(message));
        } else {
            for (const p of this.pending) {
                socket.send(p);
            }
            this.pending.length = 0;
            socket.send(JSON.stringify(message));
        }
    }

    get socket() {
        return this._socket;
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
                this._socket = socket;
                for (const p of this.pending) {
                    socket.send(JSON.stringify(p));
                }
                this.pending.length = 0;
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
                    this.output.botMessage(...(args as [any]));
                    break;

                case 'window message':
                    this.output.windowMessage(...(args as [any]));
                    break;

                case 'settings':
                    this.output.settings(...(args as [any, string]));
                    break;

                case 'typing indicator':
                    this.output.typingIndicator();
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
