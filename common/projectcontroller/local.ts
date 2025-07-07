import type {
    ProjectControllerInterface,
    ProjectControllerOutputInterface,
    ProjectControllerLookupInterface,
    ProjectControllerLoggerInterface,
} from './types';

// RegExp.escape() is a bit new
const regexEscape: (str: string) => string = (RegExp as any).escape ||
    function (str: string): string {
        return str.replace(/[\\^$*+?.()|\[\]{}]/g, '\\$&');
    };

export class LocalProjectController<ProjectControllerOutputType extends ProjectControllerOutputInterface> implements ProjectControllerInterface<ProjectControllerOutputType> {
    private _lookup: ProjectControllerLookupInterface;
    private _output: ProjectControllerOutputType;
    private _logger: ProjectControllerLoggerInterface;
    private _project: any;
    private _current_block_id: number;
    private _selected_group_blocks: any[] = [];
    private _client_vars: any;

    constructor(
        lookup: ProjectControllerLookupInterface,
        output: ProjectControllerOutputType,
        logger: ProjectControllerLoggerInterface,
        project: any,
    ) {
        this._lookup = lookup;
        this._output = output;
        this._logger = logger;
        this._project = project;
        this._current_block_id = project.starting_block_id;
        this._client_vars = {};

        output.settings(project.settings ?? {
            'typing_style': 'fixed',
            'typing_time': 2,
            'typing_charpsec': 40,
            'show_avatar': 'yes',
            'name': 'Tilbot'
        });

        const starting_block_id = project.starting_block_id ?? -1;
        if (starting_block_id !== -1) {
            this.send_message(this._project.blocks[starting_block_id.toString()]);
        }
    }

    get output(): ProjectControllerOutputType {
        return this._output;
    }

    get_path() {
        // console.log(this._selected_group_blocks);

        const path = this._selected_group_blocks.map(block => block.id);

        // console.log(path);

        return path;
    }

    move_to_group(params: any) {
        this._selected_group_blocks.push(params);
    }

    move_level_up() {
        this._selected_group_blocks.pop();
    }

    move_to_root() {
        this._selected_group_blocks = [];
    }

    async send_events(connector: any, input_str: string) {
        const events = connector.events;
        if (events == null) {
            return;
        }

        for (const event of events) {
            const type = event.type;
            if (type == 'message') {
                // Do nothing for now (simulator)
            } else if (type == 'variable') {
                const var_name = event.var_name;
                const var_value = event.var_value;
                const client_vars = this._client_vars;

                const regExp = /\[([^\]]+)\]/g;
                const matches = regExp.exec(var_value);

                if (matches === null) {
                    if (var_value.startsWith('+') || var_value.startsWith('-')) {
                        const rawValue = parseInt(var_value.replaceAll(' ', ''));
                        client_vars[var_name] = parseInt(client_vars[var_name] ?? '0') + rawValue;
                    } else {
                        client_vars[var_name] = var_value;
                    }
                } else {
                    const bracketedText = matches[1];
                    // @TODO: support more elaborate DB look-ups, now hard-coded to do random line
                    if (bracketedText.toLowerCase().startsWith('random(')) {
                        const db = bracketedText.substring(7, bracketedText.indexOf(')'));
                        const res = await this._lookup.random(db);
                        if (res !== null) {
                            client_vars[var_name] = res;
                        }
                    } else if (bracketedText == 'input') {
                        client_vars[var_name] = var_value.replace('[input]', input_str);
                    }
                }
            }
        }

    }

    send_message(block: any, input: string = '') {
        const params: any = {};
        const content = this.check_variables(block.content, input);
        const type = block.type;

        if (type == 'MC') {
            params.options = [];
            for (const connector of block.connectors) {
                // Remove any additional variables/checks from the connector
                const cleanedLabel = connector.label.replace(/\[([^\]]+)\]/g, "");
                if (!params.options.includes(cleanedLabel)) {
                    params.options.push(cleanedLabel);
                }
            }

            this._output.botMessage({ type, content, params });
        } else if (type == 'List') {
            params.options = block.items;
            params.text_input = block.text_input;
            params.number_input = block.number_input;

            this._output.botMessage({ type, content, params });
        } else if (type == 'Group') {
            this.move_to_group({ id: this._current_block_id, model: block });
            this._current_block_id = block.starting_block_id;
            this.send_message(block.blocks[block.starting_block_id]);
        } else {
            const has_targets = block.connectors[0].targets.length > 0;

            this._output.botMessage({ type, content, params, has_targets });
        }
    }

    check_group_exit(id: number) {
        var path = this.get_path();

        if (id == -1) {
            const group_block_id = path[path.length - 1];
            this.move_level_up();

            let block = this._project;
            for (const step of path) {
                block = block.blocks[step];
            }

            for (const connector of block.blocks[group_block_id.toString()].connectors) {
                if (connector.from_id == this._current_block_id) {
                    var new_id = connector.targets[0];
                    this._current_block_id = group_block_id;
                    this.check_group_exit(new_id);
                    break;
                }
            }
        } else {
            this._current_block_id = id;
            this._send_current_message();
        }
    }

    message_sent_event(): void {
        const path = this.get_path();
        if (path.length == 0) {
            const current_block = this._project.blocks[this._current_block_id.toString()];
            if (current_block.type === 'Auto') {
                const connector = current_block.connectors[0];
                this.send_events(connector, '');
                this._current_block_id = connector.targets[0];
                this._send_current_message();
            }
        } else {
            let block = this._project;
            for (const step of path) {
                block = block.blocks[step];
            }

            const current_block = block.blocks[this._current_block_id.toString()];
            if (current_block.type == 'Auto') {
                const new_id = current_block.connectors[0].targets[0];
                this.check_group_exit(new_id);
            }
        }
    }

    _send_current_message(input: string = ''): void {
        const current_block_id = this._current_block_id ?? -1;
        if (current_block_id == -1) {
            return;
        }

        let block = this._project;
        for (const step of this.get_path()) {
            block = block.blocks[step];
        }
        block = block.blocks[current_block_id.toString()];

        if (block.chatgpt_variation) {
            const content = this.check_variables(block.content, input);
            const prompt = this.check_variables(block.variation_prompt);

            // Keep track of time because it may take the LLM time to generate a response.
            // We subtract this response time from the (artificial) typing delay since it has already passed.
            const cur_time = Date.now();

            (async () => {
                const variation = await this._lookup.variation(content, prompt, block.chatgpt_memory);

                const variationBlock = { ...block, content: variation };

                const delay = variationBlock.delay * 1000 - (Date.now() - cur_time);
                if (delay > 0) {
                    setTimeout(() => { this.send_message(variationBlock); }, delay);
                } else {
                    this.send_message(variationBlock);
                }
            })();
        } else {
            setTimeout(() => {
                console.log(`sending message '${input}' for block ${JSON.stringify(block)}`)
                this.send_message(block, input);
            }, (block.delay ?? 0) * 1000);
        }
    }

    check_variables(content: string, input: string = ''): string {
        return content.replaceAll(/\[([^\]]+)\]/g, (_, bracketedText) => {
            if (bracketedText === 'input') {
                return input;
            } else {
                // If it's a column from a CSV table, there should be a period.
                // Element 1 of the match contains the string without the brackets.
                const csv_parts = bracketedText.split('.');
                if (csv_parts.length == 2) {
                    const [db, col] = csv_parts;
                    const client_db = this._client_vars[db] ?? {};
                    return this.check_variables(client_db[col] ?? "", input);
                } else {
                    return this.check_variables(this._client_vars[bracketedText] ?? "", input);
                }
            }
        });
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
            const csv_parts = bracketedText.split('.');

            if (csv_parts.length == 2) {
                let [db, col] = csv_parts;

                if (db.startsWith('!')) {
                    shouldMatch = false;
                    db = db.substring(1);
                }

                // Check if local variable
                if (db in this._client_vars) {
                    const varOptions = this._client_vars[db][col].split('|');

                    for (const option of varOptions) {
                        const escapedOption = regexEscape(option);
                        if (str.match(new RegExp("\\b" + escapedOption + "\\b", "i")) != null) {
                            return shouldMatch ? option : null;
                        }
                    }

                    return shouldMatch ? null : '';
                } else {
                    const parts = str.split(' ');
                    const matchedParts: string[] = [];

                    for (const part of parts) {
                        const cleanedPart = part.replace('barcode:', '').replace('?', '').replace('!', '').replace('.', '');
                        const res = await this._lookup.cell(db, col, cleanedPart);
                        if (Boolean(res && res.length) === shouldMatch) {
                            matchedParts.push(part);
                        }
                    }

                    return matchedParts.length ? matchedParts.join(' ') : null;
                }
            } else {
                if (bracketedText in this._client_vars && this._client_vars[bracketedText] == str) {
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
                let last_found_output: string | null = null;

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

        const blocks = this._project.blocks;
        if (this._current_block_id !== undefined && this._current_block_id !== -1) {
            const current_block = blocks[this._current_block_id.toString()];
            if (current_block.type !== 'Auto') {
                best = await this.find_best_connector(current_block, str, str);
            }
        }

        if (!best.found) {
            // Check if we need to fire a trigger -- after checking responses to query by the bot!
            for (const block of Object.values(blocks) as any[]) {
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
            this._current_block_id = connector.targets[0];
            this.send_events(connector, output as string);
            this._send_current_message(output as string);
        }
    }

    set_participant_id(pid: string) {
        this._logger.set_participant_id(pid);
    }

    log(message: string) {
        this._logger.log("projectcontroller", message);
    }
}
