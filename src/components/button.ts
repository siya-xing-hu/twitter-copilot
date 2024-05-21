import { createApp } from "vue";
import Button from "./Button.vue";
import { ButtonTag } from "../utils/common";

export interface HandlerParams {
  data: any;
}

export interface ButtonData {
  disabled: boolean;
  tag: ButtonTag;
  text: string;
  params: HandlerParams;
  handler: (tag: ButtonTag, params: HandlerParams) => void | Promise<void>;
}

export enum ButtonLocationEnum {
  // 上一个
  Previous = "previous",
  // 下一个
  Next = "next",
}

// 创建按钮区域
export function createButtonContainer(
  targetWrapper: HTMLElement,
  buttonLocation: ButtonLocationEnum,
  buttonList: ButtonData[],
): void {
  const div = document.createElement("div");
  div.style.textOverflow = "unset";
  div.setAttribute("tt-button-is-done", "true");

  const app = createApp(Button, {
    buttonList,
  });
  app.mount(div);

  switch (buttonLocation) {
    case ButtonLocationEnum.Previous:
      // 获取 tweetWrapper 的父元素
      const parentElement = targetWrapper.parentNode;
      // 确保存在父元素
      if (parentElement) {
        // 将新创建的容器添加到父元素中
        parentElement.insertBefore(div, targetWrapper);
      } else {
        targetWrapper.appendChild(div);
      }
      break;
    case ButtonLocationEnum.Next:
      // 获取 tweetWrapper 的下一个兄弟元素
      const nextElement = targetWrapper.nextElementSibling;
      // 确保存在下一个兄弟元素
      if (nextElement) {
        // 将新创建的容器添加到下一个兄弟元素之前
        targetWrapper.parentElement?.insertBefore(div, nextElement);
      } else {
        targetWrapper.parentElement?.appendChild(div);
      }
      break;
    default:
      targetWrapper.appendChild(div);
      break;
  }
  targetWrapper.setAttribute("tt-button-is-done", "true");
}
