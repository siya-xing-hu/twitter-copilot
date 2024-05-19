import { initOpenAI } from "../config/openai-config";
import { MessageData, MessageType, ResponseData, retry } from "../utils/common";
import { translate } from "../utils/translate";
import { execGptPrompt } from "./gptPrompt";
import { addTabListener } from "./listener";

export async function init(): Promise<void> {
  await initOpenAI();

  chrome.runtime.onMessage.addListener(
    (
      message: MessageData,
      sender,
      sendResponse: (response?: ResponseData) => void,
    ): boolean => {
      console.log("message", message);

      switch (message.type) {
        case MessageType.Translate:
          const { text, locale = "auto" } = message?.payload?.data || {};
          retry(
            async () => {
              return Promise.resolve(
                await translate(text, locale),
              );
            },
            1,
            5,
          ).then((resp) => {
            sendResponse({ type: "translate-result", payload: { data: resp } });
          }).catch((error) => {
            sendResponse({
              type: "translate-error",
              payload: { data: "error: " + error.toString() },
            });
          });
          break;
        case MessageType.ConfigUpdate:
          initOpenAI().then(() => {
            chrome.tabs.query({ url: "*://*.twitter.com/*" }, (tabs) => {
              tabs.forEach((tab) => {
                if (typeof tab.id === "number") { // 确保 tab.id 是一个数字
                  chrome.tabs.sendMessage(tab.id, {
                    type: "config-update",
                  });
                }
              });
            });
            chrome.tabs.query({ url: "*://*.x.com/*" }, (tabs) => {
              tabs.forEach((tab) => {
                if (typeof tab.id === "number") { // 确保 tab.id 是一个数字
                  chrome.tabs.sendMessage(tab.id, {
                    type: "config-update",
                  });
                }
              });
            });
          });
          break;
        case MessageType.AIGenerate:
          const { tag, content } = message?.payload?.data || {};
          retry(
            async () => {
              return Promise.resolve(await execGptPrompt(tag, content));
            },
            1,
            5,
          ).then((resp) => {
            sendResponse({
              type: "ai-genarate-result",
              payload: {
                data: resp,
              },
            });
          }).catch((error) => {
            sendResponse({
              type: "ai-genarate-error",
              payload: {
                data: "发生错误，错误信息为" + error.toString(),
              },
            });
          });
          break;
      }
      return true;
    },
  );

  await addTabListener();
}
