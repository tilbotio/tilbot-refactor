export type GeneralSettings = {
    llm_setting: "chatgpt" | "";
    llm_api_address: "";
    chatgpt_api_key?: string;
    chatgpt_version?: string;
    user_id?: string;
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
