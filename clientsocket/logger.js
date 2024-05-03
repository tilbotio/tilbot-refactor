import { LogSchema } from '../db/log.js';
import { MessageSchema } from '../db/message.js';
import { mongoose } from 'mongoose';

export class Logger {

    static LogDetails = mongoose.model('logschemas', LogSchema);
    static MessageDetails = mongoose.model('messageschemas', MessageSchema);

    constructor(project_id) {
        this._log = new Logger.LogDetails();
        this._log.project_id = project_id;
        this._log.save((err) => {
            if (err) {
                console.log('Logging error initial_save');
            }
        });
    }


    log(event, detail = '') {
        if (event == 'message_bot' || event == 'message_user') {

            let msg = new Logger.MessageDetails();
            msg.source = 'bot';
            if (event == 'message_user') {
                msg.source = 'user';
            }
            msg.message = detail;
            this._log.messages.push(msg);
            this._log.save((err) => {
                if (err) {
                    console.log('Logging error message');
                }
            });
        }
        else if (event == 'session_end') {
            this._log.session_closed = new Date;
            this._log.save((err) => {
                if (err) {
                    console.log('Logging error session_end');
                }
            });
        }
    }

    set_participant_id(pid) {
        this._log.participant_id = pid;
        this._log.save((err) => {
            if (err) {
                console.log('Logging error participant_id');
            }
        });
    }
}

//export { Logger }