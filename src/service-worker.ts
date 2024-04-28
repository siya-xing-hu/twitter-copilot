import md5 from "blueimp-md5";
import config from "./constants/config";
import {
  MessageData,
  ResponseData,
  retry,
  stringifyQueryParameter,
} from "./utils/common";

const { googleTranslatorAPI } = config;

interface Config {
  openaiApiKey?: string;
  openaiOrganization?: string;
  openaiChatModel: string;
}

declare global {
  var config: Config;
}

async function init(): Promise<void> {
  const { openaiApiKey, openaiOrganization, openaiChatModel } =
    (await chrome.storage.local.get()) ?? {};
  globalThis.config = {
    openaiApiKey,
    openaiOrganization,
    openaiChatModel: openaiChatModel ? openaiChatModel : "gpt-3.5-turbo-1106",
  };
}

function generateSignature(
  { appid, q, salt }: { appid: any; q: string; salt: string },
  appkey: any,
): string {
  return md5(`${appid}${q}${salt}${appkey}`);
}

async function translate(text: string, locale: string): Promise<any> {
  let url = googleTranslatorAPI +
    stringifyQueryParameter({
      q: text,
      tl: "zh_CN",
      sl: "auto",
      client: "dict-chrome-ex",
    });

  const response = await fetch(url, {
    method: "GET",
  });

  const resp = await response.json();
  if (resp.error_code) {
    return Promise.reject(new Error("translate result error!"));
  }

  return resp[0]
    .map((item: any) => item[0])
    .filter((item: any) => typeof item === "string")
    .join("");
}

function updateAllTabsConfig(): void {
  chrome.tabs.query({ url: "*://*.twitter.com/*" }, (tabs) => {
    tabs.forEach((tab) => {
      if (typeof tab.id === "number") { // 确保 tab.id 是一个数字
        chrome.tabs.sendMessage(tab.id, {
          type: "url-change",
        });
      }
    });
  });
}

async function openaiCreate(
  messageData: any,
  jsonFormate: boolean = true,
): Promise<any> {
  const OPENAI_API_KEY = globalThis.config?.openaiApiKey;
  const OPENAI_ORGANIZATION = globalThis.config?.openaiOrganization;
  const OPENAI_CHAT_MODEL = globalThis.config?.openaiChatModel;

  if (!OPENAI_API_KEY || !OPENAI_ORGANIZATION || !OPENAI_CHAT_MODEL) {
    return "openai config error!";
  }

  console.log(`messages: ${messageData}`);
  const reqBody = {
    model: OPENAI_CHAT_MODEL,
    messages: messageData,
    response_format: {},
  };
  if (jsonFormate) {
    reqBody.response_format = { type: "json_object" };
  }
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "OpenAI-Organization": OPENAI_ORGANIZATION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reqBody),
  });
  const jsonData = await response.json();
  console.log(`openai result: ${JSON.stringify(jsonData)}`);
  return jsonData.choices[0].message.content;
}

init();

chrome.runtime.onMessage.addListener(
  (
    message: MessageData,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: ResponseData) => void,
  ): boolean => {
    switch (message.type) {
      case "translate":
        const { text, locale = "auto" } = message?.payload?.data || {};

        if (!text) {
          return false;
        }

        retry(
          async () => {
            const res = await translate(text, locale);
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
        })
          .catch((error) => {
            sendResponse({
              type: "translate-error",
              payload: {
                data: "发生错误，错误信息为" + error.toString(),
              },
            });
          });
        break;
      case "config-update":
        init();
        updateAllTabsConfig();
        break;
      case "ai-post":
        const { optionTag, userTweetText } = message?.payload?.data || {};

        if (!userTweetText) {
          return false;
        }
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

        if (!replyTweetText) {
          return false;
        }

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
    // 返回 true 表示响应将通过 sendResponse 异步发送
    return true;
  },
);

chrome.tabs.onUpdated.addListener(
  (tabId: number, changeInfo: any, tab: chrome.tabs.Tab) => {
    if (changeInfo.url) {
      chrome.tabs.sendMessage(tabId, {
        type: "url-change",
      });

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab.url && /.*twitter.com\/.*/.test(activeTab.url)) {
          chrome.action.setIcon({ path: "static/images/main_logo_enable.png" });
        } else {
          chrome.action.setIcon({
            path: "static/images/main_logo_disabled.png",
          });
        }
      });
    }
  },
);
chrome.runtime.onInstalled.addListener(() => {
  updateAllTabsConfig();
});

chrome.tabs.onActivated.addListener((activeInfo: any) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (activeTab.url && /.*twitter.com\/.*/.test(activeTab.url)) {
      chrome.action.setIcon({ path: "static/images/main_logo_enable.png" });
    } else {
      chrome.action.setIcon({ path: "static/images/main_logo_disabled.png" });
    }
  });
});
