import { ButtonTag, MessageData, MessageType } from "../../utils/common";

export async function generateContent(
  content: string,
  tag: ButtonTag,
  type: MessageType,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const messageData: MessageData = {
      type,
      payload: { data: { tag, content } },
    };

    chrome.runtime?.id &&
      chrome.runtime.sendMessage(messageData, (resp: MessageData) => {
        const result = resp?.payload?.data;
        resolve(result);
      });
  });
}
