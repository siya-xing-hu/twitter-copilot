import { generateContent } from "./util/sendBackground";
import {
  ButtonData,
  ButtonLocationEnum,
  createButtonContainer,
  HandlerParams,
} from "./button";
import { createDialogContainer } from "./dialog";
import { execObserver } from "./util/mutationObserver";

export async function ttProductHuntInit(): Promise<void> {
  execObserver(async () => {
    await ttProductHuntReply();
  });
}

async function ttProductHuntReply(): Promise<void> {
  const formWrapper = document.querySelector(
    "main form[data-test=comment-form]",
  );
  const submitButtonWrapper = formWrapper?.querySelector(
    "button[data-test=form-submit-button]",
  ) as HTMLElement | null;
  if (!formWrapper || !submitButtonWrapper) {
    return;
  }

  const targetWrapper = submitButtonWrapper.parentElement?.parentElement;
  if (!targetWrapper) {
    return;
  }

  if (targetWrapper.getAttribute("tt-button-is-done") === "true") {
    return;
  }
  const textareaWrapper = targetWrapper.parentElement?.querySelector(
    "textarea",
  );

  const buttonList: ButtonData[] = [
    {
      tag: "Translate",
      text: "✨ Translate",
      params: { data: { textareaWrapper } },
      handler: replyHandle,
    },
  ];

  createButtonContainer(
    formWrapper as HTMLElement,
    ButtonLocationEnum.Next,
    buttonList,
  );
}

async function replyHandle(tag: string, params: HandlerParams): Promise<void> {
  console.log("tag: ", tag, "replyHandle: ", params);
  const { textareaWrapper } = params.data;

  if (!textareaWrapper || textareaWrapper.textContent == "") {
    return;
  }

  const generateText = await generateContent(
    textareaWrapper.textContent,
    tag,
    "ai-post",
  );

  createDialogContainer(
    generateText,
    () => {
      textareaWrapper.value = generateText;
      // 触发 input 事件以通知浏览器内容已更新
      const inputEvent = new Event("input", {
        bubbles: true,
        cancelable: true,
      });
      textareaWrapper.dispatchEvent(inputEvent);
    },
    () => {
      // 取消按钮的回调
      console.log("Operation cancelled.");
    },
  );
}
