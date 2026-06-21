export type GeneralSettings = {
  user_id?: string;
};

export const defaultGeneralSettings: GeneralSettings = {};

export type ProjectSettings = {
  name: string; // bot name
  project_name: string;
  typing_style: "fixed" | "variable";
  typing_time: number;
  typing_charpsec: number;
  show_avatar?: boolean;
  avatar_file?: string;
  show_avatar_sm?: boolean;
  avatar_file_sm?: string;
  external_links: ExternalLink[];
};

export type ExternalLink = {
  name: string;
  url: string;
  url_editor: string | null;
  send_user_input: boolean;
  send_connectors: boolean;
};

export const defaultProjectSettings: ProjectSettings = {
  project_name: "New project",
  typing_style: "fixed",
  typing_time: 2,
  typing_charpsec: 40,
  show_avatar: true,
  avatar_file: "",
  show_avatar_sm: false,
  avatar_file_sm: "",
  name: "Tilbot",
  external_links: [],
};

export type ProjectVariable = {
  name: string;
  type: string;
  csvfile?: string;
};

export type ProjectEventType = "message" | "variable";

export type ProjectEvent = {
  type: ProjectEventType;
  content?: string;
  var_name?: string;
  var_value?: any;
  params?: any[];
};

export type ProjectConnectorType = "Basic" | "Labeled";

export type ProjectConnector = {
  type: ProjectConnectorType;
  label?: any[];
  targets: number[];
  events?: ProjectEvent[];
  method?: "contains";
};

export type ProjectBlockType = "Auto" | "MC" | "Text" | "Trigger" | "Compute";

export type ProjectBlock = {
  type: ProjectBlockType;
  name: string;
  content: any[];
  x?: number;
  y?: number;
  connectors: ProjectConnector[];
};

export type ProjectBlockCompute = ProjectBlock & {
  use_external_link: boolean;
  external_link: ExternalLink | null;
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

export const defaultProject: Project = {
  name: "New project",
  current_block_id: 1,
  blocks: {},
  starting_block_id: -1,
  canvas_width: 2240,
  canvas_height: 1480,
  bot_name: "Tilbot",
  variables: [],
  settings: defaultProjectSettings,
};
