import type {
  ProjectControllerInterface,
  ProjectControllerOutputInterface,
  ProjectControllerLookupInterface,
  ProjectControllerLoggerInterface,
} from "./types";

// RegExp.escape() is a bit new
const regexEscape: (str: string) => string =
  (RegExp as any).escape ||
  function (str: string): string {
    return str.replace(/[\\^$*+?.()|\[\]{}]/g, "\\$&");
  };

export class LocalProjectController<
  ProjectControllerOutputType extends ProjectControllerOutputInterface
> implements ProjectControllerInterface<ProjectControllerOutputType>
{
  private _lookup: ProjectControllerLookupInterface;
  private _output: ProjectControllerOutputType;
  private _logger: ProjectControllerLoggerInterface;
  private _project: any;
  private _current_block_id: number;
  private _client_vars: any;

  constructor(
    lookup: ProjectControllerLookupInterface,
    output: ProjectControllerOutputType,
    logger: ProjectControllerLoggerInterface,
    project: any
  ) {
    this._lookup = lookup;
    this._output = output;
    this._logger = logger;
    this._project = project;
    this._current_block_id = project.starting_block_id;
    this._client_vars = {};

    output.settings(
      project.settings ?? {
        typing_style: "fixed",
        typing_time: 2,
        typing_charpsec: 40,
        show_avatar: true,
        name: "Tilbot",
      }
    );

    const starting_block_id = project.starting_block_id ?? -1;
    if (starting_block_id !== -1) {
      this.send_message(this._project.blocks[starting_block_id.toString()]);
    }
  }

  get output(): ProjectControllerOutputType {
    return this._output;
  }

  async send_events(
    connector: any,
    connector_output: string = "",
    input_str: string = ""
  ) {
    const events = connector.events;
    if (events == null) {
      return;
    }

    for (const event of events) {
      const type = event.type;
      if (type == "message") {
        // Convert parameters
        let p = {};

        if (event.params !== undefined) {
          for (let param of event.params) {
            if (param.type == "text") {
              p[param.name] = param.content;
            } else if (param.type == "connector") {
              p[param.name] = input_str;
            } else if (
              param.type == "variable" &&
              param.variable !== undefined
            ) {
              p[param.name] = await this._getVariable(param.variable);
              if (Array.isArray(p[param.name]) && p[param.name].length == 1) {
                p[param.name] = p[param.name][0];
              }
            }
          }
        }

        this._output.windowMessage(event.content, p);
      } else if (type == "variable") {
        if (event.var_name !== undefined && event.var_value !== undefined) {
          // @TODO: implement more complex combinations, e.g., other variable + 1

          if (event.var_value.type !== undefined) {
            if (event.var_value.type == "variable") {
              if (event.var_value.variable !== undefined) {
                this._client_vars[event.var_name] = await this._getVariable(
                  event.var_value
                );
                // @TODO: add way to look up concrete cell + maybe generalise this kind of analysis in a function?
              }
            } else if (event.var_value.type == "text") {
              this._client_vars[event.var_name] = event.var_value.text;
            } else if (event.var_value.type == "connector") {
              this._client_vars[event.var_name] = connector_output;
            }
          }
        }
      }
    }

    console.log(this._client_vars);
  }

  async send_message(
    block: any,
    matchedConnector: string = "",
    input: string = ""
  ) {
    const params: any = {};
    const content = await this.check_variables(
      block.content,
      matchedConnector,
      input
    );
    const type = block.type;

    if (type == "MC") {
      params.options = [];

      for (const connector of block.connectors) {
        let labelText: string[] = [];

        for (const label_part of connector.label) {
          if (label_part.type == "text" && labelText.length == 0) {
            labelText.push(label_part.content);
          } else if (
            label_part.type == "variable" &&
            label_part.variable !== undefined &&
            labelText.length == 0
          ) {
            let options: any[] | null = null;

            // Check if we need to retrieve a column or random row
            if (
              label_part.isRandomRow !== undefined &&
              label_part.isRandomRow
            ) {
              options = await this._lookup.random(label_part.variable);
            } else if (
              label_part.column !== undefined &&
              label_part.column !== ""
            ) {
              options = await this._lookup.column(
                label_part.variable,
                label_part.column
              );
            }

            if (options !== null) {
              for (const o of options) {
                labelText.push(o);
              }
            }
          }
        }

        for (const txt of labelText) {
          if (!params.options.includes(txt)) {
            params.options.push(txt);
          }
        }
      }

      this._output.botMessage({ type, content, params });
    } else if (type == "Compute") {
      this.message_sent_event();
      this.receive_message(input);
    } else {
      const has_targets = block.connectors[0].targets.length > 0;

      this._output.botMessage({ type, content, params, has_targets });
    }
  }

  async message_sent_event() {
    if (this._current_block_id !== undefined) {
      const current_block =
        this._project.blocks[this._current_block_id.toString()];
      if (current_block.type === "Auto") {
        const connector = current_block.connectors[0];
        await this.send_events(connector, "");
        this._current_block_id = connector.targets[0];
        this._send_current_message();
      }
    }
  }

  _send_current_message(
    matchedConnector: string = "",
    input: string = ""
  ): void {
    const current_block_id = this._current_block_id ?? -1;
    if (current_block_id == -1) {
      return;
    }

    let block = this._project.blocks[current_block_id.toString()];

    setTimeout(() => {
      console.log(
        `sending message '${input}' for block ${JSON.stringify(block)}`
      );
      this.send_message(block, matchedConnector, input);
    }, (block.delay ?? 0) * 1000);
  }

  async check_variables(
    content: any[],
    matchedConnector: string = "",
    input: string = ""
  ): Promise<string> {
    let txt = "";

    for (let c of content) {
      if (c.text !== undefined) {
        txt += c.text;
      } else if (c.type == "prevTurnText") {
        txt += input;
      } else if (c.type == "prevConnectorLabel") {
        txt += matchedConnector;
      } else if (c.type == "variable") {
        if (c.variable !== undefined) {
          if (c.variableType !== undefined && c.variableType == "dataset") {
            let res: any[] | null = null;

            // Check if we need to retrieve a column or random row
            if (c.isRandomRow !== undefined && c.isRandomRow) {
              res = await this._lookup.random(c.variable);
            } else if (c.column !== undefined && c.column !== "") {
              if (
                c.filter !== undefined &&
                c.filter.match !== undefined &&
                c.filter.match.type !== undefined
              ) {
                if (c.filter.match.type == "text") {
                  res = await this._lookup.column(
                    c.variable,
                    c.column,
                    c.filter.colName,
                    c.filter.match.text
                  );
                } else if (c.filter.match.type == "variable") {
                  res = await this._lookup.column(
                    c.variable,
                    c.column,
                    c.filter.colName,
                    this._client_vars[c.filter.match.varName]
                  );
                }
              } else {
                res = await this._lookup.column(c.variable, c.column);
              }
            }

            if (res !== null) {
              txt += res.join(", ");
            }
          } else if (
            c.variableType !== undefined &&
            c.variableType == "session"
          ) {
            if (c.column !== undefined && c.column !== "") {
              txt += this._client_vars[c.variable][c.column];
            } else {
              txt += this._client_vars[c.variable];
            }
          }
        }
      }
    }

    return txt;
  }

  _findElseConnector(block: any, userInput: string) {
    for (const connector of block.connectors) {
      for (const label_part of connector.label) {
        if (label_part.type == "else") {
          return {
            found: true,
            connector: connector,
            output: [userInput],
            isElseConnector: true,
          };
        }
      }
    }

    return null;
  }

  async find_best_connector(block: any, userInput: string) {
    let else_connector = null;

    let userInputStripped = userInput;

    // Remove punctuation marks
    if (block.type !== "MC") {
      userInputStripped = userInput
        .replace("?", "")
        .replace("!", "")
        .replace(".", "")
        .replace(",", "");
    }

    for (const connector of block.connectors) {
      let meetsCriteria = true;
      let found_output: string[] = [];

      if (connector.targets.length == 0) {
        meetsCriteria = false;
      } else {
        for (const label_part of connector.label) {
          if (label_part.type == "else") {
            else_connector = connector;
            meetsCriteria = false;
          } else if (label_part.type == "text") {
            if (
              userInput
                .toLowerCase()
                .indexOf(label_part.content.toLowerCase()) == -1
            ) {
              meetsCriteria = false;
            } else {
              found_output.push(label_part.content.toLowerCase());
            }
          } else if (label_part.type == "variable") {
            // For variables we do a word-by-word match since there can be complex entries in the dataset.
            let foundAWord = false;
            let words = userInputStripped.split(" ");
            for (const word of words) {
              let lookup: any[] | null = null;

              if (label_part.variableType == "dataset") {
                lookup = await this._lookup.cell(
                  label_part.variable,
                  label_part.column,
                  word.toLowerCase()
                );
              } else if (label_part.variableType == "session") {
                let check = "";
                if (
                  label_part.column !== undefined &&
                  label_part.column != ""
                ) {
                  check =
                    this._client_vars[label_part.variable][label_part.column];
                } else {
                  check = this._client_vars[label_part.variable];
                }
                if (
                  check !== null &&
                  (word.toLowerCase() == check.toLowerCase() ||
                    new RegExp("\\b" + word.toLowerCase() + "\\b").test(
                      check.toLowerCase()
                    ))
                ) {
                  lookup = [word];
                }
              }
              if (lookup !== null) {
                foundAWord = true;
                found_output.push(word);
              }
            }

            if (!foundAWord) {
              meetsCriteria = false;
            }
          }
        }
      }

      if (meetsCriteria) {
        return {
          found: true,
          connector: connector,
          output: found_output,
          isElseConnector: false,
        };
      }
    }

    if (else_connector === null) {
      return {
        found: false,
        connector: null,
        output: [],
        isElseConnector: false,
      };
    } else {
      return {
        found: true,
        connector: else_connector,
        output: [userInput],
        isElseConnector: true,
      };
    }
  }

  _checkTriggerRelatedToCurrent(trigger: any, currentBlockID: number) {
    for (const connector of trigger.connectors) {
      if (connector.targets.length > 0) {
        if (connector.targets[0] == currentBlockID) {
          return true;
        }
      }
    }

    return false;
  }

  async receive_message(str: string) {
    console.log("receive!" + str);

    let best: {
      found: boolean;
      connector: any;
      output: string[];
      isElseConnector: boolean;
    } = { found: false, connector: null, output: [], isElseConnector: false };

    const blocks = this._project.blocks;
    let current_block = null;
    let currentBlockExists = false;

    if (this._current_block_id !== undefined && this._current_block_id !== -1) {
      currentBlockExists = true;

      current_block = blocks[this._current_block_id.toString()];
      if (current_block.type == "Compute" && current_block.use_external_link) {
        let res = null;

        let external_link = this._getExternalLinkFromName(
          current_block.external_link
        );

        if (external_link !== null) {
          if (external_link.send_user_input) {
            console.log(current_block.external_link);
            if (external_link.send_connectors) {
              res = await this._lookup.apiCall(
                external_link,
                str,
                await this._getConnectors(current_block)
              );
            } else if (external_link.send_connectors) {
              res = await this._lookup.apiCall(
                external_link,
                "",
                await this._getConnectors(current_block)
              );
            } else {
              res = await this._lookup.apiCall(external_link, str);
            }
          } else {
            res = await this._lookup.apiCall(external_link);
          }

          if (res !== undefined) {
            // @TODO: see if this is a good long-term solution
            best = await this.find_best_connector(current_block, res.intent);
            if (res.connector_label !== undefined) {
              best.output = [res.connector_label];
            }
          } else {
            // Try to find the "else" connector to fall back on.
            let potentialElse = this._findElseConnector(current_block, str);
            if (potentialElse !== null) {
              best = potentialElse;
            }
          }
        }
      } else if (current_block.type !== "Auto") {
        best = await this.find_best_connector(current_block, str.toString());
      }
    }

    if (!best.found || best.isElseConnector) {
      // Check if we need to fire a trigger -- after checking responses to query by the bot!
      for (const block of Object.values(blocks) as any[]) {
        if (block.type === "Trigger") {
          // Check if we're not in a compute block that just came from this trigger
          if (
            !currentBlockExists ||
            current_block.type !== "Compute" ||
            !this._checkTriggerRelatedToCurrent(block, this._current_block_id)
          ) {
            let best_trigger = await this.find_best_connector(
              block,
              str.toString()
            );

            if (best_trigger.found) {
              best = best_trigger;
              break;
            }
          }
        }
      }
    }

    if (best.found) {
      for (let i = 0; i < best.connector.targets.length; i++) {
        this._current_block_id = best.connector.targets[i];
        await this.send_events(best.connector, best.output.join(" "), str);
        this._send_current_message(best.output.join(" "), str);
      }
    }
  }

  _getExternalLinkFromName(name: string) {
    for (const link of this._project.settings.external_links) {
      if (link.name == name) {
        return link;
      }
    }

    return null;
  }

  async _getVariable(variable: any): Promise<any> {
    // @TODO: support non-dataset variables!
    // @TODO: Like _getConnectors, this function might also be useful throughout this class (like in _getConnectors, actually).
    if (variable.isRandomRow !== undefined && variable.isRandomRow) {
      return this._lookup.random(variable.variable);
    } else if (variable.column !== undefined && variable.column !== "") {
      if (
        variable.filter !== undefined &&
        variable.filter.match !== undefined &&
        variable.filter.match.type !== undefined
      ) {
        if (variable.filter.match.type == "variable") {
          return this._lookup.column(
            variable.variable,
            variable.column,
            variable.filter.colName,
            this._client_vars[variable.filter.match.varName]
          );
        } else if (variable.filter.match.type == "text") {
          return this._lookup.column(
            variable.variable,
            variable.column,
            variable.filter.colName,
            variable.filter.text
          );
        }
      } else {
        return this._lookup.column(
          variable.variable,
          variable.column,
          null,
          null
        );
      }
    }
  }

  async _getConnectors(current_block: any) {
    // @TODO: It might be possible to call this function from find_best_connector in the future to avoid duplicate code.
    let connectors: string[] = [];

    for (const connector of current_block.connectors) {
      let connectorText = "";

      for (const label_part of connector.label) {
        // For now we ignore the "else" label, not sure if we should send it along
        if (label_part.type == "text") {
          connectorText += label_part.content;
        } else if (label_part.type == "variable") {
          // It is currently not possible to mix different types within one label, so we can
          // directly add all entries of the dataset or the entire variable as a connector text.
          if (label_part.variableType == "dataset") {
            let lookup = null;

            if (
              label_part.filter !== undefined &&
              label_part.filter.match !== undefined &&
              label_part.filter.match.type !== undefined
            ) {
              if (label_part.filter.match.type == "variable") {
                lookup = await this._lookup.column(
                  label_part.variable,
                  label_part.column,
                  label_part.filter.colName,
                  this._client_vars[label_part.filter.match.varName]
                );
              } else if (label_part.filter.match.type == "text") {
                lookup = await this._lookup.column(
                  label_part.variable,
                  label_part.column,
                  label_part.filter.colName,
                  label_part.filter.text
                );
              }
            } else {
              lookup = await this._lookup.column(
                label_part.variable,
                label_part.column,
                null,
                null
              );
            }

            if (lookup !== null) {
              for (const colItem of lookup) {
                connectors.push(colItem[0]);
              }
            }
          } else if (label_part.variableType == "session") {
            if (label_part.column !== undefined && label_part.column != "") {
              connectors.push(
                this._client_vars[label_part.variable][label_part.column]
              );
            } else {
              connectors.push(this._client_vars[label_part.variable]);
            }
          }
        }
      }

      if (connectorText !== "") {
        connectors.push(connectorText);
      }
    }

    return connectors;
  }

  set_participant_id(pid: string) {
    this._logger.set_participant_id(pid);
  }

  log(message: string) {
    this._logger.log("projectcontroller", message);
  }
}
