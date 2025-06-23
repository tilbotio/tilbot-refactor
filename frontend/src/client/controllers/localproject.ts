import { BasicProjectController } from '../../shared/controllers/basicproject';

// RegExp.escape() is a bit new
const regexEscape: (str: string) => string = (RegExp as any).escape ||
    function (str: string): string {
        return str.replace(/[\\^$*+?.()|\[\]{}]/g, '\\$&');
    };

export class LocalProjectController extends BasicProjectController {

    private current_block_id: number;
    private chatbot_message_callback: Function;
    private chatbot_settings_callback: Function;
    private variation_request_callback: Function;
    private client_vars: any;

    // Keep track of time because it may take the LLM time to generate a response.
    // We subtract this response time from the (artificial) typing delay since it has already passed.
    private cur_time: number;

    constructor(json_str: string, chatbot_message_callback: Function, chatbot_settings_callback: Function, variation_request_callback: Function) {
        super();

        this.chatbot_message_callback = chatbot_message_callback;
        this.chatbot_settings_callback = chatbot_settings_callback;
        this.variation_request_callback = variation_request_callback;
        this.project = JSON.parse(json_str);
        this.current_block_id = this.project.starting_block_id;
        this.client_vars = {};

        if (this.project.settings === undefined) {
            this.project.settings = {
                'typing_style': 'fixed',
                'typing_time': 2,
                'typing_charpsec': 40,
                'show_avatar': 'yes',
                'name': 'Tilbot'
            };
        }

        this.chatbot_settings_callback(this.project.settings);
        if (this.project.starting_block_id !== undefined && this.project.starting_block_id !== -1) {
            this.send_message(this.project.blocks[this.project.starting_block_id.toString()]);
        }
    }

    async send_events(connector: any, input_str: string) {
        if (connector.events !== undefined) {
            for (let c = 0; c < connector.events.length; c++) {
                if (connector.events[c].type == 'message') {
                    // Do nothing for now (simulator)
                }
                else if (connector.events[c].type == 'variable') {
                    let regExp = /\[([^\]]+)\]/g;
                    let matches = regExp.exec(connector.events[c].var_value);

                    if (matches !== null) {
                        // @TODO: support more elaborate DB look-ups, now hard-coded to do random line
                        if (matches[1].toLowerCase().startsWith('random')) {
                            let db = matches[1].substring(7, matches[1].indexOf(')'));
                            let res = await window.parent.api.invoke('query-db-random', { db: db });
                            if (res !== null) {
                                this.client_vars[connector.events[c].var_name] = res;
                            }
                        }
                        else if (matches[1] == 'input') {
                            this.client_vars[connector.events[c].var_name] = connector.events[c].var_value.replace('[input]', input_str);
                        }
                    }
                    else {
                        if (connector.events[c].var_value.startsWith('+')) {
                            if (this.client_vars[connector.events[c].var_name] === undefined) {
                                this.client_vars[connector.events[c].var_name] = parseInt(connector.events[c].var_value.substring(1).replace(' ', ''));
                            }
                            else {
                                this.client_vars[connector.events[c].var_name] = parseInt(this.client_vars[connector.events[c].var_name]) + parseInt(connector.events[c].var_value.substring(1).replace(' ', ''));
                            }
                        }
                        else if (connector.events[c].var_value.startsWith('-')) {
                            if (this.client_vars[connector.events[c].var_name] === undefined) {
                                this.client_vars[connector.events[c].var_name] = 0 - parseInt(connector.events[c].var_value.substring(1).replace(' ', ''));
                            }
                            else {
                                this.client_vars[connector.events[c].var_name] = parseInt(this.client_vars[connector.events[c].var_name]) - parseInt(connector.events[c].var_value.substring(1).replace(' ', ''));
                            }
                        }
                        else {
                            this.client_vars[connector.events[c].var_name] = connector.events[c].var_value;
                        }
                    }
                }
            }
        }
    }

    send_message(block: any, input: string = '') {
        let params: any = {};

        let content = this.check_variables(block.content, input);

        if (block.type == 'MC') {
            params.options = [];
            for (var c in block.connectors) {
                // Remove any additional variables/checks from the connector
                let label_cleaned = block.connectors[c].label.replace(/\[([^\]]+)\]/g, "");
                if (!params.options.includes(label_cleaned)) {
                    params.options.push(label_cleaned);
                }
            }

            this.chatbot_message_callback({ type: block.type, content: content, params: params });
        }
        else if (block.type == 'List') {
            params.options = block.items;
            params.text_input = block.text_input;
            params.number_input = block.number_input;

            this.chatbot_message_callback({ type: block.type, content: content, params: params });
        }
        else if (block.type == 'Group') {
            this.move_to_group({ id: this.current_block_id, model: block });
            this.current_block_id = block.starting_block_id;
            this.send_message(block.blocks[block.starting_block_id]);
        }
        else {
            let targets = true;

            if (block.connectors[0].targets.length == 0) {
                targets = false;
            }

            this.chatbot_message_callback({ type: block.type, content: content, params: params, has_targets: targets });
        }
    }

    check_group_exit(id: number) {
        var path = this.get_path();

        if (id == -1) {
            var group_block_id = path[path.length - 1];
            this.move_level_up();

            path = this.get_path();

            var block = this.project;

            if (path.length > 0) {
                for (var i = 0; i < path.length; i++) {
                    block = block.blocks[path[i]];
                }
            }

            for (var i = 0; i < block.blocks[group_block_id.toString()].connectors.length; i++) {
                if (block.blocks[group_block_id.toString()].connectors[i].from_id == this.current_block_id) {
                    var new_id = block.blocks[group_block_id.toString()].connectors[i].targets[0];
                    this.current_block_id = group_block_id;
                    this.check_group_exit(new_id);
                    break;
                }
            }
        }

        else {
            this.current_block_id = id;
            this._send_current_message();
        }
    }

    message_sent_event() {
        var path = this.get_path();

        if (path.length == 0) {
            if (this.project.blocks[this.current_block_id.toString()].type == 'Auto') {
                this.send_events(this.project.blocks[this.current_block_id.toString()].connectors[0], '');
                this.current_block_id = this.project.blocks[this.current_block_id.toString()].connectors[0].targets[0];
                this._send_current_message();
            }
        }

        else {
            var block = this.project.blocks[path[0]];

            for (var i = 1; i < path.length; i++) {
                block = block.blocks[path[i]];
            }

            if (block.blocks[this.current_block_id.toString()].type == 'Auto') {
                var new_id = block.blocks[this.current_block_id.toString()].connectors[0].targets[0];
                this.check_group_exit(new_id);
            }
        }
    }

    _send_current_message(input: string = '') {
        if (this.current_block_id == undefined || this.current_block_id == -1) {
            return;
        }

        var self = this;
        var path = this.get_path();
        var block = this.project;

        if (path.length > 0) {
            block = this.project.blocks[path[0]];

            for (var i = 1; i < path.length; i++) {
                block = block.blocks[path[i]];
            }
        }

        block = block.blocks[this.current_block_id.toString()];

        if (block.chatgpt_variation !== undefined && block.chatgpt_variation) {
            let content = this.check_variables(block.content, input);
            let prompt = this.check_variables(block.variation_prompt);

            this.cur_time = Date.now();
            this.variation_request_callback(content, prompt, block.chatgpt_memory);
        }
        else {
            setTimeout(function () {
                self.send_message(block, input);
            }, block.delay * 1000);
        }

    }

    check_variables(content: string, input: string = '') {

        let regExp = /\[([^\]]+)\]/g;
        let matches = regExp.exec(content);

        if (matches !== null) {
            if (matches[1].indexOf(' = ') !== -1) {
                let matches2 = regExp.exec(content);

                let parts = matches[1].split(' = ');
                if (parts[0] in this.client_vars && this.client_vars[parts[0]] == parts[1]) {
                    content = content.substring(matches2.index + 1, matches2.index + 1 + matches2[1].length) + content.substring(matches2.index + matches2[0].length);
                    return this.check_variables(content, input);
                }
                else {
                    content = content.replace(matches[0], '').replace(matches2[0], '');
                    return this.check_variables(content, input);
                }
            }
            else if (matches[1].indexOf(' != ') !== -1) {
                let matches2 = regExp.exec(content);

                let parts = matches[1].split(' != ');
                if (parts[0] in this.client_vars && this.client_vars[parts[0]] != parts[1]) {
                    content = content.substring(matches2.index + 1, matches2.index + 1 + matches2[1].length) + content.substring(matches2.index + matches2[0].length);
                    return this.check_variables(content, input);
                }
                else {
                    content = content.replace(matches[0], '').replace(matches2[0], '');
                    return this.check_variables(content, input);
                }
            }

            if (typeof input === 'object' && input !== null) {
                content = content.substring(0, matches.index) + input[matches[1]] + content.substring(matches.index + matches[1].length + 2);
            }
            else if (input !== '' && content.includes('[input]')) {
                content = content.replace('[input]', input);
            }
            else {
                // If it's a column from a CSV table, there should be a period.
                // Element 1 of the match contains the string without the brackets.
                let csv_parts = matches[1].split('.');

                if (csv_parts.length == 2) {
                    let db = csv_parts[0];
                    let col = csv_parts[1];

                    // The column can be yet another variable
                    if (col.startsWith('[')) {
                        col = this.client_vars[col.substring(1)];
                        matches[1] += ']';
                    }

                    // Check if local variable
                    if (db in this.client_vars) {
                        content = content.replace('[' + matches[1] + ']', this.client_vars[db][col]);
                    }
                }
                else {
                    content = content.replace('[' + matches[1] + ']', this.client_vars[matches[1]]);
                }
            }
        }

        if (regExp.lastIndex !== 0) {
            return this.check_variables(content, input);
        }

        return content;
    }

    receive_variation(str: string) {
        // @TODO: handle error messages in requesting variation from ChatGPT
        var self = this;
        var path = this.get_path();
        var block = this.project;

        if (path.length > 0) {
            block = this.project.blocks[path[0]];

            for (var i = 1; i < path.length; i++) {
                block = block.blocks[path[i]];
            }
        }

        block = JSON.parse(JSON.stringify(block.blocks[this.current_block_id.toString()]));
        block.content = str;

        let after_time = Date.now();

        let new_delay = block.delay * 1000 - (after_time - this.cur_time);

        if (new_delay < 0) {
            self.send_message(block);
        }
        else {
            setTimeout(function () {
                self.send_message(block);
            }, new_delay);
        }
    }

    async csvLookup(db: string, col: string, val: string): Promise<string | null> {
        const window_parent: any = window.parent;
        return await window_parent.api.invoke('query-db', { db, col, val });
        // return await this.csv_datas[db].get(col, val);
    }

    async check_labeled_connector(connector: string, str: string): Promise<string | null> {
        // Check for tags / special commands
        let regExp = /\[([^\]]+)\]/g;
        let matches = regExp.exec(connector);

        if (matches) {
            const bracketedText = matches[1].trim();

            // Match an = or != comparison operator, flanked by either whitespace or
            // word boundaries or the start/end of the string:
            const comparisonMatch = /(?:\s|\b|^)(!?=)(?:\s|\b|$)/.exec(bracketedText);
            if (comparisonMatch) {
                const comparisonIndex = comparisonMatch.index;
                const operator = comparisonMatch[1];

                const key = `[${bracketedText.substring(0, comparisonIndex).trim()}]`;
                const val = bracketedText.substring(comparisonIndex + comparisonMatch[0].length).trim();
                const res = await this.check_labeled_connector(key, val);

                const shouldBeEqual = operator === '=';
                const isEqual = res === val;

                return isEqual === shouldBeEqual ? val : null;
            }

            let shouldMatch = true;
            // @TODO: do something in case of multiple matches, and support [and] or [or]
            //let match = matches[0];

            // If it's a column from a CSV table, there should be a period.
            // Element 1 of the match contains the string without the brackets.
            let csv_parts = bracketedText.split('.');

            if (csv_parts.length == 2) {
                let db = csv_parts[0];
                let col = csv_parts[1];

                if (db.startsWith('!')) {
                    shouldMatch = false;
                    db = db.substring(1);
                }

                // Check if local variable
                if (db in this.client_vars) {
                    const varOptions = this.client_vars[db][col].split('|');

                    for (const option of varOptions) {
                        let escapedOption = regexEscape(option);
                        if (str.match(new RegExp("\\b" + escapedOption + "\\b", "i")) != null) {
                            return shouldMatch ? option : null;
                        }
                    }

                    return shouldMatch ? null : '';
                } else {
                    const parts = str.split(' ');
                    const matchedParts = [];

                    for (const part of parts) {
                        const cleanedPart = part.replace('barcode:', '').replace('?', '').replace('!', '').replace('.', '');
                        const res = await this.csvLookup(db, col, cleanedPart);
                        if (Boolean(res && res.length) === shouldMatch) {
                            matchedParts.push(part);
                        }
                    }

                    return matchedParts.length ? matchedParts.join(' ') : null;
                }
            } else {
                if (bracketedText in this.client_vars && this.client_vars[bracketedText] == str) {
                    return str;
                } else {
                    return '';
                }
            }
        } else {
            const candidate = connector.toLowerCase();
            const cleanedStr = str.replace('barcode:', '').toLowerCase();
            if (candidate === cleanedStr || cleanedStr.match(new RegExp("\\b" + regexEscape(candidate) + "\\b"))) {
                return str;
            }
        }

        return null;
    }

    async find_best_connector(block: any, str: string, else_output: string | null) {
        let else_connector = null;

        for (const connector of block.connectors) {
            const label = connector.label;
            const method = connector.method;

            if (label.trim() === '[else]') {
                else_connector = connector;
            } else if (method !== 'barcode' || str.startsWith('barcode:')) {
                // @TODO: distinguish between contains / exact match options
                const ands = label.split(/\s*\[and\]\s*/);
                let num_match = 0;
                let last_found_output = null;

                for (const and of ands) {
                    const output = await this.check_labeled_connector(and, str);
                    if (output !== null) {
                        num_match++;
                        last_found_output = output;
                    } else {
                        // break; // (or do we really need to evaluate all ANDs?)
                    }
                }

                if (num_match == ands.length) {
                    return { found: true, connector, output: last_found_output };
                }
            }
        }

        return { found: false, connector: else_connector, output: else_output };
    }

    async receive_message(str: string) {
        console.log('receive!' + str);

        let best: {
            found: boolean;
            connector: any;
            output: string | null;
        } = { found: false, connector: null, output: null };

        const blocks = this.project.blocks;
        if (this.current_block_id !== undefined && this.current_block_id !== -1) {
            const current_block = blocks[this.current_block_id.toString()];
            if (current_block.type !== 'Auto') {
                best = await this.find_best_connector(current_block, str, str);
            }
        }

        if (!best.found) {
            let else_connector = null;
            // Check if we need to fire a trigger -- after checking responses to query by the bot!
            for (const block of blocks) {
                if (block.type === 'Trigger') {
                    const candidate = await this.find_best_connector(block, str, str);
                    if (candidate.connector) {
                        // Might be a real match or just an [else] connector
                        best = candidate;
                    }
                    if (candidate.found) {
                        break;
                    }
                }
            }
        }

        if (best.connector) {
            const { connector, output } = best;
            this.current_block_id = connector.targets[0];
            this.send_events(connector, output as string);
            this._send_current_message(output as string);
        }
    }

    set_participant_id(pid: string) {
        // Not used right now
    }

}
