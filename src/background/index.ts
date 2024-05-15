import config from "../constants/config";
import { MessageData, ResponseData, retry } from "../utils/common";
import { openaiCreate } from "../utils/openai";
import { translate } from "../utils/translate";

const { googleTranslatorAPI } = config;

interface Config {
  openaiApiKey?: string;
  openaiOrganization?: string;
  openaiChatModel: string;
}

declare global {
  var config: Config;
}

async function initConfig() {
  const { openaiApiKey, openaiOrganization, openaiChatModel } =
    (await chrome.storage.local.get()) ?? {};
  globalThis.config = {
    openaiApiKey,
    openaiOrganization,
    openaiChatModel: openaiChatModel ? openaiChatModel : "gpt-3.5-turbo",
  };
}

export async function init(): Promise<void> {
  await initConfig();

  chrome.runtime.onMessage.addListener(
    (
      message: MessageData,
      sender,
      sendResponse: (response?: ResponseData) => void,
    ): boolean => {
      console.log("message", message);

      switch (message.type) {
        case "translate":
          const { text, locale = "auto" } = message?.payload?.data || {};
          retry(
            async () => {
              const res = await translate(googleTranslatorAPI, text, locale);
              return Promise.resolve(res);
            },
            1,
            5,
          ).then((resp) => {
            sendResponse({
              type: "translate-result",
              payload: {
                data: resp,
              },
            });
          }).catch((error) => {
            sendResponse({
              type: "translate-error",
              payload: {
                data: "发生错误，错误信息为" + error.toString(),
              },
            });
          });
          break;
        case "config-update":
          initConfig();
          chrome.tabs.query({ url: "*://*.twitter.com/*" }, (tabs) => {
            tabs.forEach((tab) => {
              if (typeof tab.id === "number") { // 确保 tab.id 是一个数字
                chrome.tabs.sendMessage(tab.id, {
                  type: "url-change",
                });
              }
            });
          });
          break;
        case "ai-post":
          const { optionTag, userTweetText } = message?.payload?.data || {};
          retry(
            async () => {
              let messageData = [
                {
                  "role": "system",
                  "content":
                    '你是一个 twitter 内容生成者，我需要你按照用户的需求生成一条推文，用英文输出，JSON 格式输出，输出格式： {"result": ""}',
                },
                {
                  "role": "user",
                  "content":
                    `Keywords or content: '${userTweetText}', Controls: '${optionTag}'`,
                },
              ];
              if ("Translate" == optionTag) {
                messageData = [
                  {
                    "role": "system",
                    "content":
                      '你是一个内容翻译器，请将我给你的内容翻译成美式本地英文，JSON 格式输出，输出格式： {"result": ""}',
                  },
                  {
                    "role": "user",
                    "content": `${userTweetText}`,
                  },
                ];
              }
              const res = await openaiCreate(messageData);
              const result_json = JSON.parse(res);
              return Promise.resolve(result_json.result);
            },
            1,
            5,
          ).then((resp) => {
            sendResponse({
              type: "post-result",
              payload: {
                data: resp,
              },
            });
          }).catch((error) => {
            sendResponse({
              type: "post-error",
              payload: {
                data: "发生错误，错误信息为" + error.toString(),
              },
            });
          });
          break;
        case "ai-reply":
          const { replyStyle, replyTweetText } = message?.payload?.data || {};
          retry(
            async () => {
              const messageData = [
                {
                  "role": "system",
                  "content":
                    '你是一个 twitter 内容回复者，我需要你按照用户的回复要求，结合待回复的原文，生成一条回复内容，用英文输出，JSON 格式输出，输出格式： {"result": ""}',
                },
                {
                  "role": "user",
                  "content":
                    `Replies to tweet: '${replyTweetText}', Reply style: '${replyStyle}'`,
                },
              ];
              const res = await openaiCreate(messageData);
              const result_json = JSON.parse(res);
              return Promise.resolve(result_json.result);
            },
            1,
            5,
          ).then((resp) => {
            sendResponse({
              type: "reply-result",
              payload: {
                data: resp,
              },
            });
          }).catch((error) => {
            sendResponse({
              type: "reply-error",
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

  chrome.tabs.onUpdated.addListener(
    (tabId: number, changeInfo: any, tab: chrome.tabs.Tab) => {
      if (
        changeInfo.status === "complete" && tab.url &&
        (tab.url.startsWith("https://twitter.com/") ||
          tab.url.startsWith("https://x.com/"))
      ) {
        chrome.tabs.sendMessage(tabId, {
          type: "twitter-url",
        });
      }
    },
  );

  chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.query({ url: "*://*.twitter.com/*" }, (tabs) => {
      tabs.forEach((tab) => {
        if (typeof tab.id === "number") { // 确保 tab.id 是一个数字
          chrome.tabs.sendMessage(tab.id, {
            type: "twitter-url",
          });
        }
      });
    });
  });
}