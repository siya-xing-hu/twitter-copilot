// 定义重试函数的类型
type RetryFunction = () => Promise<any>;

export function retry(
  fn: RetryFunction,
  interval = 5,
  maxLimit = 5,
  intervalStep = 0,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      fn().then(resolve).catch((error) => {
        if (maxLimit <= 0) {
          console.error("Retry failed", error);
        } else {
          setTimeout(attempt, interval * 1000);
          maxLimit--;
          interval += intervalStep;
        }
      });
    };
    attempt();
  });
}

export function createElement(innerHtml: string): HTMLElement {
  const $Wrapper = document.createElement("div");
  $Wrapper.innerHTML = innerHtml;
  return $Wrapper.firstElementChild as HTMLElement;
}

export function randomString(len: number): string {
  return Math.random().toString(36).substr(2).substr(0, len);
}

export function stringifyQueryParameter(data: Record<string, any>): string {
  const ret = Object.keys(data).map(
    (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`,
  );
  return ret.join("&");
}

export function templateReplace(
  template: string = "",
  ...args: string[]
): string {
  let templateString = template.trim();
  templateString = templateString.replace(/\n/g, "");

  if (Array.isArray(args)) {
    args.forEach((param, i) => {
      templateString = templateString.replace(`{${i}}`, param.trim());
    });
    return templateString;
  }

  return templateString;
}

export function debounce(
  fn: (this: void, ...args: any[]) => void,
  wait = 1,
): (...args: any[]) => void {
  let timeout: number | undefined;
  return function (this: void, ...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.call(this, ...args), wait);
  };
}

export function setInputText(inputEl: HTMLElement | null, text: string): void {
  try {
    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/plain", text); // Prepare the text to be pasted
    inputEl?.dispatchEvent(
      new ClipboardEvent("paste", { // Simulate a paste event
        bubbles: true,
        clipboardData: dataTransfer,
        cancelable: true,
      }),
    );
  } catch (e) {
    console.error(e);
  }
}

export function isContent(text: string): boolean {
  const specialCharsRegex = /^[\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~「」]*$/;
  // 如果匹配正则表达式，则不进行翻译
  if (specialCharsRegex.test(text)) {
    return false;
  }
  return true; // 如果不匹配，则需要翻译
}

// 定义消息的类型
export interface MessageData {
  type: MessageType;
  payload: {
    data: any;
  };
}

// 定义响应的类型
export interface ResponseData {
  type: string;
  payload: {
    data: any;
  };
}

export enum MessageType {
  Translate = "translate",
  ConfigUpdate = "config-update",
  AIGenerate = "ai-genarate",
}

export enum ButtonTag {
  Translate = "translate",
  Generate = "generate",
  Approval = "approval",
  Disapproval = "disapproval",
  Support = "support",
  Joke = "joke",
  Idea = "idea",
  Question = "question",
}
