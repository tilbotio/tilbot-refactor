export type CurrentMessageType = "Auto" | "MC" | "Text";

export type Message = {
  from: "bot" | "user" | "chatgpt";
  content: string;
  params?: any;
};

export type NewBotMessageBlock = boolean;

export type ShowBarcodeScanner = boolean;

export type InputText = string;

export type McOption = { content: string };
