import { ref } from "vue";
import { debounce } from "./utils/common";

export const fields = ref([
  {
    label: "OPENAI_API_KEY",
    name: "openaiApiKey",
    type: "password",
    value: "",
    isLoading: false,
    isSuccess: false,
  },
  {
    label: "OPENAI_ORGANIZATION",
    name: "openaiOrganization",
    type: "password",
    value: "",
    isLoading: false,
    isSuccess: false,
  },
  {
    label: "OPENAI_CHAT_MODEL",
    name: "openaiChatModel",
    type: "select",
    value: "",
    isLoading: false,
    isSuccess: false,
    options: [
      { value: "gpt-3.5-turbo", label: "gpt-3.5", select: true },
      { value: "gpt-4-turbo", label: "gpt-4.0" },
    ],
  },
  {
    label: "X_TRANSLATE",
    name: "xTranslate",
    type: "select",
    value: "",
    isLoading: false,
    isSuccess: false,
    options: [
      { value: "TRUE", label: "TRUE", select: true },
      { value: "FALSE", label: "FALSE" },
    ],
  },
]);

export async function initConfig() {
  const storage = await chrome.storage.local.get();
  fields.value.forEach((field) => {
    field.value = storage[field.name] ?? "";
  });
}

export const onInput = debounce(async (fieldName: string, value: string) => {
  const updates: Record<string, any> = {};
  switch (fieldName) {
    case "openaiApiKey":
      updates.openaiApiKey = value;
      break;
    case "openaiOrganization":
      updates.openaiOrganization = value;
      break;
    case "openaiChatModel":
      updates.openaiChatModel = value;
      break;
    case "xTranslate":
      updates.xTranslate = value;
      break;
    default:
      break;
  }
  await chrome.storage.local.set(updates);
  if (chrome.runtime?.id) {
    chrome.runtime.sendMessage({ type: "config-update" });
  }
}, 400);
