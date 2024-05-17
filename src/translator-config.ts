import { debounce } from "./utils/common";

export async function init(fields: any[]) {
  const { openaiApiKey, openaiOrganization, openaiChatModel, xTranslate } =
    (await chrome.storage.local.get()) ?? {};
  fields.forEach((field) => {
    switch (field.name) {
      case "openaiApiKey":
        field.value = openaiApiKey ?? "";
        break;
      case "openaiOrganization":
        field.value = openaiOrganization ?? "";
        break;
      case "openaiChatModel":
        field.value = openaiChatModel ?? "";
        break;
      case "xTranslate":
        field.value = xTranslate ?? "";
        break;
      default:
        break;
    }
  });
}

export const onInput = debounce(async (fieldName: string, value: string) => {
  switch (fieldName) {
    case "openaiApiKey":
      chrome.storage.local.set({ openaiApiKey: value });
      break;
    case "openaiOrganization":
      chrome.storage.local.set({ openaiOrganization: value });
      break;
    case "openaiChatModel":
      chrome.storage.local.set({ openaiChatModel: value });
      break;
    case "xTranslate":
      chrome.storage.local.set({ xTranslate: value });
      break;
    default:
      break;
  }
  chrome.runtime?.id && chrome.runtime.sendMessage({ type: "config-update" });
}, 400);
