import { generateContent } from "./util/sendBackground";
import {
  ButtonData,
  ButtonLocationEnum,
  createButtonContainer,
  HandlerParams,
} from "./button";
import { createDialogContainer } from "./dialog";
import { execObserver } from "./util/mutationObserver";
import { ButtonTag, MessageType } from "../utils/common";

export async function ttProductHuntInit(): Promise<void> {
  execObserver(document.body, async () => {
    return await ttProductHuntReply();
  });
}

async function ttProductHuntReply(): Promise<boolean> {
  const formWrapper = document.querySelector(
    "main form[data-test=comment-form]",
  );
  const submitButtonWrapper = formWrapper?.querySelector(
    "button[data-test=form-submit-button]",
  ) as HTMLElement | null;
  if (!formWrapper || !submitButtonWrapper) {
    return false;
  }

  const targetWrapper = submitButtonWrapper.parentElement?.parentElement;
  if (!targetWrapper) {
    return false;
  }

  if (targetWrapper.getAttribute("tt-button-is-done") === "true") {
    return false;
  }
  const textareaWrapper = targetWrapper.parentElement?.querySelector(
    "textarea",
  );

  const buttonList: ButtonData[] = [
    {
      disabled: false,
      tag: ButtonTag.Translate,
      text: "🌎 Translate",
      params: { data: { textareaWrapper } },
      handler: replyHandle,
    },
  ];

  createButtonContainer(
    formWrapper as HTMLElement,
    ButtonLocationEnum.Next,
    buttonList,
  );
  return true;
}

async function replyHandle(
  tag: ButtonTag,
  params: HandlerParams,
): Promise<void> {
  const { textareaWrapper } = params.data;

  if (!textareaWrapper || textareaWrapper.textContent == "") {
    return;
  }

  const generateText = await generateContent(
    textareaWrapper.textContent,
    tag,
    MessageType.AIGenerate,
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
