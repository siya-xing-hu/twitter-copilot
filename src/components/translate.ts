import {
  isContent,
  MessageData,
  MessageType,
  randomString,
} from "../utils/common";
import { createApp } from "vue";
import Translate from "./Translate.vue";

interface TranslateData {
  id?: string;
  text: string;
  show: boolean;
}

const translateDataList: TranslateData[] = [];

export async function translateContent(text: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const messageData: MessageData = {
      type: MessageType.Translate,
      payload: {
        data: {
          text,
          locale: "auto",
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

export async function execTranslate(
  clientX: number,
  clientY: number,
): Promise<void> {
  const targetDiv = findNearestDivAndText(clientX, clientY);

  if (targetDiv) {
    // 如果是翻译元素，直接隐藏翻译元素 text-is-translate-text
    if (targetDiv.getAttribute("text-is-translate-text")) {
      const translateId = targetDiv.getAttribute("text-is-translate-text");
      const translateData = translateDataList.find(
        (item) => item.id === translateId,
      );
      if (translateData) {
        if (translateData.show) {
          translateData.show = false;
          // 直接删除当前的 targetDiv
          targetDiv.remove();
        } else {
          translateData.show = true;
          // 显示翻译元素
          createContainer(targetDiv, {
            id: translateData.id,
            text: translateData.text,
            show: true,
          });
        }
      }
      return;
    }

    // 判断是否已经翻译
    if (targetDiv.getAttribute("text-is-translated")) {
      const translateId = targetDiv.getAttribute("text-is-translated");
      const translateData = translateDataList.find(
        (item) => item.id === translateId,
      );
      if (translateData) {
        if (translateData.show) {
          translateData.show = false;
          // 删除翻译元素
          const translateElement = document.querySelector(
            `[text-is-translate-text="${translateId}"]`,
          );
          translateElement && translateElement.remove();
        } else {
          translateData.show = true;
          // 显示翻译元素
          createContainer(targetDiv, {
            id: translateData.id,
            text: translateData.text,
            show: true,
          });
        }
      }
    } else {
      // 翻译
      const textContent = targetDiv.textContent;
      if (!textContent || !isContent(textContent)) {
        return;
      }
      const translatedText = await translateContent(textContent);
      if (!translatedText) {
        console.log("No translated text.");
        return;
      }
      createContainer(targetDiv, {
        text: translatedText,
        show: true,
      });
    }
  }
}

export async function execNotionTranslate(
  clientX: number,
  clientY: number,
): Promise<void> {
  const targetDiv = findNearestDivAndText(clientX, clientY);

  if (targetDiv) {
    // 翻译
    const textContent = targetDiv.textContent;
    if (!textContent || !isContent(textContent)) {
      console.log("textContent: ", textContent);
      return;
    }
    if (textContent.includes("\u200D\n")) {
      targetDiv.textContent = textContent.split("\u200D\n")[0];
      return;
    }
    const translatedText = await translateContent(textContent);
    if (!translatedText) {
      console.log("No translated text.");
      return;
    }

    targetDiv.textContent = textContent + "\u200D\n" + translatedText;
  }
}

function findNearestDivAndText(
  clientX: number,
  clientY: number,
): HTMLElement | null {
  const targetElement: HTMLElement | null = document.elementFromPoint(
    clientX,
    clientY,
  ) as HTMLElement;

  let targetDiv: HTMLElement | null = null;

  // Traverse parent chain to find the nearest bottom-level div
  if (targetElement) {
    for (
      let element: HTMLElement | null = targetElement;
      element;
      element = element.parentElement
    ) {
      // 如果是 div 元素、 H 元素、span 元素、p 元素、a 元素
      if (
        element.tagName === "DIV" || element.tagName.match(/H\d/) ||
        element.tagName === "SPAN" || element.tagName === "P" ||
        element.tagName === "A"
      ) {
        targetDiv = element as HTMLElement;
        break;
      }
    }
  }

  return targetDiv;
}

function createContainer(
  targetDiv: HTMLElement,
  translateData: TranslateData,
): void {
  if (!translateData.id) {
    // 生成一个 uuid
    translateData.id = randomString(10);
    translateDataList.push(translateData);
  }

  const div = document.createElement("div");

  div.setAttribute("text-is-translate-text", translateData.id);
  div.style.textOverflow = "unset";

  const app = createApp(Translate, {
    translatedText: translateData.text,
  });
  app.mount(div);

  // 获取 tweetWrapper 的父元素
  const parentElement = targetDiv.parentNode;
  // 确保存在父元素
  if (parentElement) {
    // 将新创建的容器添加到父元素中
    parentElement.insertBefore(div, targetDiv.nextSibling);
  } else {
    targetDiv.appendChild(div);
  }
  targetDiv.setAttribute("text-is-translated", translateData.id);
}
