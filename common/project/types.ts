export type GeneralSettings = {
  llm_setting: "chatgpt" | "";
  llm_api_address: "";
  chatgpt_api_key?: string;
  chatgpt_version?: string;
  chatgpt_sim_version?: string;
  user_id?: string;
};

export const defaultGeneralSettings: GeneralSettings = {
  llm_setting: "chatgpt",
  llm_api_address: "",
  chatgpt_sim_version: "gpt-3.5-turbo",
};

export type ProjectSettings = {
  name: string; // bot name
  project_name: string;
  typing_style?: "fixed" | "variable";
  typing_time?: number;
  typing_charpsec?: number;
  llm_prompt?: string;
  llm_prompt_data?: string;
  temperature?: number;
  show_avatar?: boolean;
  avatar_file?: string;
  show_avatar_sm?: boolean;
  avatar_file_sm?: string;
};

const defaultPrompt = `Act as a user of my chatbot. I will send you the output from the chatbot and then I would like you to provide responses that a user would create.
You should keep talking to the chatbot until you feel like you have reached your goal, or feel like the conversation is not progressing anymore.

Whenever my messages contain curly brackets {}, the phrases between the curly brackets are the options for your output, separated by a semicolon ; . In this case, you can *only* reply with one of these options, no other text.
For example, if my message contains {Yes;No}, you can only reply with either Yes or No. Do not add any other words.
You cannot provide answer options with curly brackets for the chatbot.`;

export const defaultProjectSettings: ProjectSettings = {
  project_name: "New project",
  typing_style: "fixed",
  typing_time: 2,
  typing_charpsec: 40,
  llm_prompt: defaultPrompt,
  llm_prompt_data: "",
  temperature: 0.5,
  show_avatar: true,
  avatar_file: "",
  show_avatar_sm: false,
  avatar_file_sm: "",
  name: "Tilbot",
};

export type ProjectVariable = {
  name: string;
  type: string;
  csvfile?: string;
};

export type ProjectEventType = "message" | "variable";

export type ProjectEvent = {
  type: ProjectEventType;
  content: string;
  var_name?: string;
  var_value?: string;
};

export type ProjectConnectorType = "Basic" | "Labeled";

export type ProjectConnector = {
  type: ProjectConnectorType;
  label?: string;
  targets: number[];
  events?: ProjectEvent[];
  method?: "contains";
};

export type ProjectBlockType = "Auto" | "MC" | "Text" | "Trigger";

export type ProjectBlock = {
  type: ProjectBlockType;
  name: string;
  content: string;
  x?: number;
  y?: number;
  connectors: ProjectConnector[];
  chatgpt_variation?: boolean;
  variation_prompt?: string;
};

export type Project = {
  name?: string;
  current_block_id: number;
  blocks: { [key: string]: ProjectBlock };
  starting_block_id: number;
  canvas_width: number;
  canvas_height: number;
  bot_name: string;
  avatar_image?: string;
  variables: ProjectVariable[];
  settings: ProjectSettings;
};
