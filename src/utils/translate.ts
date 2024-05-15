import { MessageData, stringifyQueryParameter } from "./common";
import { createApp } from "vue";
import Translate from "../Translate.vue";

export async function translate(
  googleTranslatorAPI: string,
  text: string,
  locale: string,
): Promise<any> {
  let url = googleTranslatorAPI +
    stringifyQueryParameter({
      q: text,
      tl: "zh_CN",
      sl: locale,
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

export async function translateContent(text: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const messageData: MessageData = {
      type: "translate",
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
    if (targetDiv.getAttribute("text-is-translate-text") === "true") {
      if (targetDiv.style.display === "none") {
        targetDiv.style.display = "block";
      } else {
        targetDiv.style.display = "none";
      }
      return;
    }

    // 判断是否已经翻译
    if (targetDiv.getAttribute("text-is-translated") === "true") {
      // 隐藏
      // 获取 targetDiv 的兄弟元素中的下一个元素
      const nextElement = targetDiv.nextSibling;
      if (nextElement) {
        // 隐藏 or 显示
        const translateDiv = nextElement as HTMLElement;
        if (translateDiv.getAttribute("text-is-translate-text") === "true") {
          if (translateDiv.style.display === "none") {
            translateDiv.style.display = "block";
          } else {
            translateDiv.style.display = "none";
          }
        }
      }
    } else {
      // 翻译
      const textContent = targetDiv.textContent;
      if (textContent) {
        const translatedText = await translateContent(textContent);
        if (!translatedText) {
          console.log("No translated text.");
          return;
        }
        createContainer(targetDiv, translatedText);
      }
    }
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
      // 如果是 div 元素、 H 元素、p 元素、span 元素
      if (element.tagName === "DIV") {
        targetDiv = element as HTMLElement;
        break;
      }
    }
  }

  return targetDiv;
}

function createContainer(
  targetDiv: HTMLElement,
  translatedText: string,
): void {
  const div = document.createElement("div");

  div.setAttribute("text-is-translate-text", "true");
  div.style.textOverflow = "unset";

  const app = createApp(Translate, {
    translatedText,
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
  targetDiv.setAttribute("text-is-translated", "true");
}
