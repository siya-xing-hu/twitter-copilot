import { MessageData } from "../../utils/common";

export async function generateContent(
  text: string,
  optionTag: string,
  type: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const messageData: MessageData = {
      type,
      payload: {
        data: {
          optionTag,
          userTweetText: text,
        },
      },
    };

    chrome.runtime?.id &&
      chrome.runtime.sendMessage(messageData, (resp: MessageData) => {
        const result = resp?.payload?.data;
        resolve(result);
      });
  });
}
