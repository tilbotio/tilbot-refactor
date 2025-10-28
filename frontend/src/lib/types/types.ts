export type CurrentMessageType = "text" | "mc";

export type Message = {
  from: "bot" | "user" | "chatgpt";
  content: string;
};

export type NewBotMessageBlock = boolean;

export type ShowBarcodeScanner = boolean;

export type InputText = string;

export type McOption = { content: string };
