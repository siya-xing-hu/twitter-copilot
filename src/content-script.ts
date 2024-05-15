import {
  createElement,
  MessageData,
  ResponseData,
  retry,
  setInputText,
} from "./utils/common";
import template from "./constants/template";
import Dialog from "./Dialog.vue";
import { createApp, h } from "vue";
import "./main.css";
import { execTranslate } from "./utils/translate";

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

chrome.runtime.onMessage.addListener((request, _sender) => {
  if (request.type === "twitter-url") {
    retry(xersMainInit, 0.5, 15);
    retry(xersDialogInit, 0.5, 15);
  }
});

let currentClientX = 0;
let currentClientY = 0;
let isTranslating = false;

// 监听鼠标悬停事件
document.addEventListener("mouseover", (event) => {
  currentClientX = event.clientX;
  currentClientY = event.clientY;
});

// 监听 Shift 键的按下事件
document.addEventListener("keydown", async (event) => {
  if (event.shiftKey && currentClientX && currentClientY) {
    if (isTranslating) {
      return;
    }
    try {
      await execTranslate(currentClientX, currentClientY);
    } catch (error) {
      console.error(error);
    } finally {
      isTranslating = false;
    }
  }
});
