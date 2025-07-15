const CsvData = require('./csvdata.cjs');

// RegExp.escape() is a bit new
const regexEscape = RegExp.escape || function (str) {
  return str.replace(/[\\^$*+?.()|\[\]{}]/g, '\\$&');
};

class ProjectController {
  constructor(project, p, llm) {
    this.project = project;
    this.socket = null;
    this.pending = [];
    this.llm = llm;
    this.current_block_id = this.project.starting_block_id;
    this.logger = undefined;

    // FIXME: logger should be a constructor parameter
    if (process.versions.hasOwnProperty('electron')) {
      let Logger = require('./logger.cjs');
      this.logger = new Logger(p);
      if (this.current_block_id !== -1) {
        this._send_current_message();
      }
    }
    else {
      import('../backend/logger.js').then((mod) => {
        this.logger = new mod.Logger(project.id);
        if (this.current_block_id !== -1) {
          this._send_current_message();
        }
      });
    }

    this.client_vars = {};

    this.csv_datas = {};

    this.chatgpt_var_mem = undefined;

    // Set up the data files
    for (let v in this.project.variables) {
      if (this.project.variables[v].type == 'csv') {
        if (process.versions.hasOwnProperty('electron')) {
          // FIXME: '/currentproject/' should be a constructor parameter
          this.csv_datas[this.project.variables[v].name] = new CsvData(this.project.variables[v].csvfile, p + '/currentproject/');
        }
        else {
          this.csv_datas[this.project.variables[v].name] = new CsvData(this.project.variables[v].csvfile, p);
        }
      }
    }

    // FIXME: this should be part of the mongoose schema definition
    if (this.project.settings === undefined) {
      this.project.settings = {
        'typing_style': 'fixed',
        'typing_time': 2,
        'typing_charpsec': 40,
        'show_avatar': 'yes',
        'avatar_file': '',
        'name': 'Tilbot'
      };
    }
  }

  emit(...message) {
    const socket = this.socket;
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

  get_path() {
    var path = [];

    for (var b in this.selected_group_blocks) {
      path.push(this.selected_group_blocks[b].id);
    }

    return path;
  }

  async _send_current_message(input = '') {
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

      // Send a typing indicator enabling message to the client
      this.emit('typing indicator');

      let resp = null;

      let cur_time = Date.now();

      resp = await this.llm.get_variation(content, prompt, block.chatgpt_memory, this.chatgpt_var_mem);

      let after_time = Date.now();

      this.chatgpt_var_mem = resp[0];
      resp = resp[1];

      console.log(resp);

      let block_copy = JSON.parse(JSON.stringify(block));
      block_copy.content = resp;

      let new_delay = block_copy.delay * 1000 - (after_time - cur_time);

      if (new_delay < 0) {
        self.send_message(block_copy);
      }
      else {
        setTimeout(function () {
          self.send_message(block_copy);
        }, new_delay);
      }
    }
    else {
      setTimeout(function () {
        self.send_message(block, input);
      }, block.delay * 1000);
    }
  }

  check_variables(content, input = '') {

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

  async send_events(connector, input_str) {
    if (connector.events !== undefined) {
      for (let c = 0; c < connector.events.length; c++) {
        if (connector.events[c].type == 'message') {

          if (typeof input_str == 'object') {
            // Check for tags / special commands
            let regExp = /\[([^\]]+)\]/g;
            let matches = regExp.exec(connector.events[c].content);

            if (matches !== null) {
              // If it's a column from a CSV table, there should be a period.
              // Element 1 of the match contains the string without the brackets.
              let csv_parts = matches[1].split('.');

              if (csv_parts.length == 2) {
                let db = csv_parts[0];
                let col = csv_parts[1];

                this.emit('window message', { content: connector.events[c].content.replace('[' + db + '.' + col + ']', input_str[col]) });
              }

            }
          }
          else {
            // Check for tags / special commands
            let regExp = /\[([^\]]+)\]/g;
            let matches = regExp.exec(connector.events[c].content);

            if (matches !== null) {
              // If it's a column from a CSV table, there should be a period.
              // Element 1 of the match contains the string without the brackets.
              let csv_parts = matches[1].split('.');

              if (csv_parts.length == 2) {
                let db = csv_parts[0];
                let col = csv_parts[1];

                this.emit('window message', { content: connector.events[c].content.replace('[' + matches[1] + ']', this.client_vars[db][col]) });
              }
              else {
                this.emit('window message', { content: connector.events[c].content.replace('[input]', input_str) });
              }
            }
            else {
              this.emit('window message', { content: connector.events[c].content });
            }
          }

        }

        else if (connector.events[c].type == 'variable') {
          let regExp = /\[([^\]]+)\]/g;
          let matches = regExp.exec(connector.events[c].var_value);

          if (matches !== null) {
            // @TODO: support more elaborate DB look-ups, now hard-coded to do random line
            if (matches[1].toLowerCase().startsWith('random')) {
              let db = matches[1].substring(7, matches[1].indexOf(')'));
              let res = await this.csv_datas[db].get_random_line();

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

  send_message(block, input = '') {
    this.message_processed = false;

    var params = {};

    let content = this.check_variables(block.content, input);

    if (block.type == 'MC') {
      params.options = [];

      console.log(block.connectors);
      for (var c in block.connectors) {
        // Remove any additional variables/checks from the connector
        let label_cleaned = block.connectors[c].label.replace(/\[([^\]]+)\]/g, "");
        if (!params.options.includes(label_cleaned)) {
          params.options.push(label_cleaned);
        }
      }

      console.log(params);

      this.emit('bot message', { type: block.type, content: content, params: params });
      this.logger.log('message_bot', block.content);
    }
    else if (block.type == 'List') {
      params.options = block.items;
      params.text_input = block.text_input;
      params.number_input = block.number_input;

      this.emit('bot message', { type: block.type, content: content, params: params });
      this.logger.log('message_bot', block.content);
    }
    else if (block.type == 'Group') {
      this.move_to_group({ id: this.current_block_id, model: block });
      this.current_block_id = block.starting_block_id;
      this.send_message(block.blocks[block.starting_block_id]);
    }
    else if (block.type == 'AutoComplete') {
      params.options = block.options;

      this.emit('bot message', { type: block.type, content: content, params: params });
      this.logger.log('message_bot', block.content);
    }
    else if (block.type == 'Auto') {
      if (block.connectors[0].targets.length == 0) {
        // This one must rely on triggers, so we should accept input -- especially useful for triggering voice input to listen.
        params.expect_input = true;
      }
      this.emit('bot message', { type: block.type, content: content, params: params });
      this.logger.log('message_bot', block.content);
    }
    else {
      this.emit('bot message', { type: block.type, content: content, params: params });
      this.logger.log('message_bot', block.content);
    }
  }

  message_sent_event() {
    var path = this.get_path();

    if (path.length == 0) {
      if (this.project.blocks[this.current_block_id.toString()].type == 'Auto' && this.project.blocks[this.current_block_id.toString()].connectors[0].targets.length > 0) {
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

      if (block.blocks[this.current_block_id.toString()].type == 'Auto' && block.blocks[this.current_block_id.toString()].connectors[0].targets.length > 0) {
        //var new_id = block.blocks[this.current_block_id.toString()].connectors[0].targets[0];
        //this.check_group_exit(new_id);
      }
    }
  }

  async check_labeled_connector(connector, str) {
    // Check for tags / special commands
    let regExp = /\[([^\]]+)\]/g;
    let matches = regExp.exec(connector);

    if (matches) {
      const bracketedText = matches[1].strip();

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
            const res = await this.csv_datas[db].get(col, cleanedPart);
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

  async find_best_connector(block, str, else_output) {
    let else_connector = null;

    for (const connector of block.connectors) {
      const label = parseBrackets(connector.label);
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

  async receive_message(str) {
    console.log('receive!' + str);

    let best = { found: false, connector: null, output: null };

    const blocks = this.project.blocks;
    if (this.current_block_id !== undefined && this.current_block_id !== -1) {
      const current_block = blocks[this.current_block_id.toString()];
      if (current_block.type !== 'Auto') {
        best = this.find_best_connector(current_block, str, str);
      }
    }

    if (!best.found) {
      let else_connector = null;
      // Check if we need to fire a trigger -- after checking responses to query by the bot!
      for (const block of blocks) {
        if (block.type === 'Trigger') {
          const candidate = this.find_best_connector(block, str, str);
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
      this.send_events(connector, output);
      this._send_current_message(output);
    }
  }

  log(str) {
    this.logger.log(str);
  }

  set_participant_id(pid) {
    this.logger.set_participant_id(pid);
  }
}

module.exports = ProjectController;
