export type CurrentMessageType = "Auto" | "MC" | "Text" | "Update";

export type Message = {
  from: "bot" | "user";
  content: string;
  params?: any;
  type?: CurrentMessageType;
  audio?: Blob;
};

export type NewBotMessageBlock = boolean;

export type ShowBarcodeScanner = boolean;

export type InputText = string;

export type McOption = { content: string };
