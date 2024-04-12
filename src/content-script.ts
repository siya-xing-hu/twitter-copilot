import {
  createElement,
  MessageData,
  ResponseData,
  retry,
  setInputText,
  templateReplace,
} from "./utils/common";
import template from "./constants/template";
import Dialog from "./Dialog.vue";
import { createApp, h } from "vue";
import "./main.css";

let translator: string = "google";

function addTranslatorButton(
  $timelineWrapper: HTMLElement,
  $translateButton: HTMLElement,
): void {
  let tweetWrapperList = [
    ...$timelineWrapper.querySelectorAll(
      `div[aria-label] article[role=article]
      div[lang]:not([data-has-translator=true]):not([lang^=zh])`,
    ),
  ];

  if (!tweetWrapperList.length) return;

  // 只有在单个状态页面时才执行的逻辑
  if (/twitter.com\/.+\/status\//.test(window.location.href)) {
    tweetWrapperList = tweetWrapperList.filter(($tweetWrapper) => {
      const $nextElement = $tweetWrapper.nextElementSibling;
      if (
        $nextElement?.getAttribute("role") === "button" ||
        $nextElement?.querySelector("div > span[aria-expanded]")
      ) {
        if ($tweetWrapper.getAttribute("lang") === "en") {
          return false; // 排除英语推文
        } else {
          $nextElement.remove(); // 移除已存在的按钮
        }
      }
      return true;
    });
  }

  tweetWrapperList.forEach(($tweetWrapper) => {
    $tweetWrapper.setAttribute("data-has-translator", "true");
    $tweetWrapper.textContent &&
      $tweetWrapper.appendChild($translateButton.cloneNode(true));
  });
}

async function init(): Promise<boolean> {
  const $timelineWrapper = document.querySelector(
    "main[role=main] div[data-testid=primaryColumn] section[role=region] div[aria-label] > div",
  ) as HTMLElement;
  if (!$timelineWrapper?.innerText) {
    throw new Error("time line is not loaded");
  }

  // 添加翻译按钮
  const $translateButton = createElement(template.translateButton);
  const queriedElement = document.querySelector(
    'header[role="banner"] a[href="/compose/tweet"]',
  ) as HTMLElement | null;
  const buttonColor = queriedElement
    ? (getComputedStyle(queriedElement) as CSSStyleDeclaration).backgroundColor
    : "rgb(29, 161, 242)";

  $translateButton.style.color = buttonColor;

  addTranslatorButton($timelineWrapper, $translateButton);
  const observer = new MutationObserver(() => {
    addTranslatorButton($timelineWrapper, $translateButton);
  });
  observer.observe($timelineWrapper, { childList: true });

  // 添加翻译按钮响应事件
  if ($timelineWrapper.getAttribute("data-is-event-ready") === "true") {
    return true;
  }
  let isLoading = false;
  $timelineWrapper.setAttribute("data-is-event-ready", "true");
  $timelineWrapper.addEventListener(
    "click",
    (e) => {
      if (isLoading) {
        return;
      }
      const target = e.target as HTMLElement; // 断言 e.target 为 HTMLElement

      if (
        ["tt-translator-content", "tt-translator-button"].includes(
          target.className,
        )
      ) {
        const $textContainer = target.closest(
          "div[data-has-translator=true]",
        ) as HTMLElement;
        const $button =
          $textContainer.getElementsByClassName("tt-translator-button")[0];
        const $loading = createElement(template.loading);

        const loadingBackground = $loading.getElementsByClassName(
          "tt-translator-loading-background",
        )[0] as HTMLElement;
        loadingBackground.style.stroke = buttonColor;
        const loadingFront = $loading.getElementsByClassName(
          "tt-translator-loading-front",
        )[0] as HTMLElement;
        loadingFront.style.stroke = buttonColor;

        const text: string =
          ($textContainer.textContent || "").split("翻译推文")[0];
        const localeAttribute = $textContainer.getAttribute("lang") || "und";
        const locale = { ja: "jp", und: "auto" }[localeAttribute] ??
          localeAttribute;
        const localeMap: Record<string, string> = { jp: "日语", en: "英语" };

        $textContainer.appendChild($loading);
        isLoading = true;
        const messageData: MessageData = {
          type: "translate",
          payload: {
            data: {
              text,
              locale,
            },
          },
        };
        chrome.runtime?.id &&
          chrome.runtime.sendMessage(messageData, (resp: MessageData) => {
            $loading.remove();
            isLoading = false;
            $button.classList.add("hide");

            const $translateContent = createElement(
              templateReplace(
                template.fromDiv,
                translator,
                localeMap[locale] || "自动检测",
                resp?.payload?.data,
              ),
            ) as HTMLElement;
            const $switch = $translateContent.getElementsByClassName(
              "tt-translator-result-switch",
            )[0] as HTMLElement;
            $switch.style.color = buttonColor;

            $switch.addEventListener("click", () => {
              $button.classList.remove("hide");
              $translateContent.remove();
            });
            $textContainer.appendChild($translateContent);
          });
      }
    },
    false,
  );

  return true;
}

// 创建和显示弹框
function createDialog(
  text: string,
  onConfirm: () => void,
  onCancel: () => void,
): void {
  const dialogContainer = document.createElement("div");
  document.body.appendChild(dialogContainer);

  const app = createApp({
    render() {
      return h(Dialog, {
        text,
        onConfirm: () => {
          onConfirm();
          app.unmount();
          document.body.removeChild(dialogContainer);
        },
        onCancel: () => {
          onCancel();
          app.unmount();
          document.body.appendChild(dialogContainer);
        },
      });
    },
  });
  app.mount(dialogContainer);
}

async function post(
  toolBarParentWrapper: HTMLElement,
  tweetTextareaWrapper: HTMLElement,
): Promise<boolean> {
  let isLoading = false;
  toolBarParentWrapper.addEventListener(
    "click",
    (e) => {
      if (isLoading) {
        return;
      }
      const target = e.target as HTMLElement;
      if ("tt-post-btn-style" === target.className) {
        const targetText = target.innerText;

        const optionTag = {
          "✨ Create": "根据内容摘要丰富内容",
          "🍭 Polish": "根据内容进行优化排版，纠错",
        }[targetText] ?? "Create";

        const userTweetText = tweetTextareaWrapper.innerText;

        if (!userTweetText || "" === userTweetText) {
          return;
        }

        isLoading = true;
        const messageData: MessageData = {
          type: "ai-post",
          payload: {
            data: {
              optionTag,
              userTweetText,
            },
          },
        };
        chrome.runtime?.id &&
          chrome.runtime.sendMessage(messageData, (resp: ResponseData) => {
            isLoading = false;

            // 如果 resp.type == post-error, 抛出异常
            if (resp?.type === "post-error") {
              throw new Error(`Post error occurred, ${resp?.payload?.data}`);
            }

            // 设计一个弹框写入 resp?.payload?.aiPostResult 内容，同时给弹框添加确认和取消按钮和触发事件，取消 - 直接删除弹框，确认 - 先把弹框内容获取出来后删除弹框
            // 显示弹框
            createDialog(
              resp?.payload?.data,
              () => {
                // 确认按钮的回调
                setInputText(tweetTextareaWrapper, resp?.payload?.data);
              },
              () => {
                // 取消按钮的回调
                console.log("Operation cancelled.");
              },
            );
          });
      }
    },
    false,
  );
  return true;
}

async function reply(
  toolBarParentWrapper: HTMLElement,
  tweetTextareaWrapper: HTMLElement,
  replayTweetTextWrapper: HTMLElement,
): Promise<boolean> {
  let isLoading = false;
  toolBarParentWrapper.addEventListener(
    "click",
    (e) => {
      if (isLoading) {
        return;
      }

      const target = e.target as HTMLElement;
      if ("tt-post-btn-style" === target.className) {
        const targetText = target.innerText;
        console.log(`hx ================ ${targetText}`);

        const replyStyle = {
          "👍": "Express approval",
          "👎": "Express disapproval",
          "🫶 Support": "Express support",
          "🔥 Joke": "Humor style",
          "💡 Idea": "Give a good opinion",
          "❓ Question": "Ask a question",
          "◑ Translate": "Translate",
        }[targetText] ?? "Express approval";

        const replyTweetText = replayTweetTextWrapper.innerText;

        if (!replyTweetText || "" === replyTweetText) {
          return;
        }

        const userTweetText = tweetTextareaWrapper.innerText;

        isLoading = true;

        if (replyStyle == "Translate") {
          if (!userTweetText || "" === userTweetText) {
            return;
          }
          const optionTag = "Translate";
          const messageData: MessageData = {
            type: "ai-post",
            payload: {
              data: {
                optionTag,
                userTweetText,
              },
            },
          };
          chrome.runtime?.id &&
            chrome.runtime.sendMessage(messageData, (resp: ResponseData) => {
              isLoading = false;

              // 如果 resp.type == post-error, 抛出异常
              if (resp?.type === "post-error") {
                throw new Error(`Post error occurred, ${resp?.payload?.data}`);
              }

              // 设计一个弹框写入 resp?.payload?.aiPostResult 内容，同时给弹框添加确认和取消按钮和触发事件，取消 - 直接删除弹框，确认 - 先把弹框内容获取出来后删除弹框
              // 显示弹框
              createDialog(
                resp?.payload?.data,
                () => {
                  // 确认按钮的回调
                  setInputText(tweetTextareaWrapper, resp?.payload?.data);
                },
                () => {
                  // 取消按钮的回调
                  console.log("Operation cancelled.");
                },
              );
            });
        } else {
          const messageData: MessageData = {
            type: "ai-reply",
            payload: {
              data: {
                replyStyle,
                replyTweetText,
              },
            },
          };
          chrome.runtime?.id &&
            chrome.runtime.sendMessage(messageData, (resp: ResponseData) => {
              isLoading = false;

              // 如果 resp.type == post-error, 抛出异常
              if (resp?.type === "reply-error") {
                throw new Error(`Reply error occurred, ${resp?.payload?.data}`);
              }

              setInputText(tweetTextareaWrapper, resp?.payload?.data);
            });
        }
      }
    },
    false,
  );
  return true;
}

async function xersDialogInit(): Promise<boolean> {
  const $dialogWrapper = document.querySelector("div[role=dialog]");
  const $tweetTextareaWrapper = $dialogWrapper?.querySelector(
    "div[data-testid=tweetTextarea_0]",
  ) as HTMLElement | null;
  const $toolBarParentWrapper = $dialogWrapper?.querySelector(
    "div[data-testid=toolBar]",
  )?.parentElement;

  if (!$toolBarParentWrapper || !$tweetTextareaWrapper) {
    throw new Error("dialog is not loaded");
  }

  // 添加翻译按钮响应事件
  if ($toolBarParentWrapper.getAttribute("xers-button-is-done") === "true") {
    return true;
  }

  const $replayTweetTextWrapper = $dialogWrapper?.querySelector(
    "div[data-testid=tweetText",
  ) as HTMLElement;

  // 添加内容生成按钮
  const $xersButtons = createElement(
    $replayTweetTextWrapper ? template.replyButtons : template.postButtons,
  );

  if ($toolBarParentWrapper.firstChild) {
    $toolBarParentWrapper.insertBefore(
      $xersButtons.cloneNode(true),
      $toolBarParentWrapper.firstChild,
    );
  } else {
    $toolBarParentWrapper.appendChild($xersButtons.cloneNode(true));
  }
  $toolBarParentWrapper.setAttribute("xers-button-is-done", "true");

  if ($replayTweetTextWrapper) {
    // reply
    return await reply(
      $toolBarParentWrapper,
      $tweetTextareaWrapper,
      $replayTweetTextWrapper,
    );
  } else {
    // post
    return await post($toolBarParentWrapper, $tweetTextareaWrapper);
  }
}

async function xersMainInit(): Promise<boolean> {
  const $mainWrapper = document.querySelector(
    "main[role=main] div[data-testid=primaryColumn]",
  );
  const $tweetTextareaWrapper = $mainWrapper?.querySelector(
    "div[data-testid=tweetTextarea_0]",
  ) as HTMLElement | null;
  const $toolBarParentWrapper = $mainWrapper?.querySelector(
    "div[data-testid=toolBar]",
  )?.parentElement;

  if (!$toolBarParentWrapper || !$tweetTextareaWrapper) {
    throw new Error("main is not loaded");
  }

  // 添加翻译按钮响应事件
  if ($toolBarParentWrapper.getAttribute("xers-button-is-done") === "true") {
    return true;
  }
  // 添加内容生成按钮
  const $postButtons = createElement(template.postButtons);

  if ($toolBarParentWrapper.firstChild) {
    $toolBarParentWrapper.insertBefore(
      $postButtons.cloneNode(true),
      $toolBarParentWrapper.firstChild,
    );
  } else {
    $toolBarParentWrapper.appendChild($postButtons.cloneNode(true));
  }

  $toolBarParentWrapper.setAttribute("xers-button-is-done", "true");

  return await post($toolBarParentWrapper, $tweetTextareaWrapper);
}

chrome.runtime.onMessage.addListener((request: { type: string }, _sender) => {
  if (request.type === "url-change") {
    retry(init, 1, 15);

    retry(xersMainInit, 0.5, 15);
    retry(xersDialogInit, 0.5, 15);
  }
});

retry(init, 0.5, 15);

retry(xersMainInit, 0.5, 15);
retry(xersDialogInit, 0.5, 15);
