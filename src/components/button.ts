import { createApp } from "vue";
import Button from "./Button.vue";

export interface HandlerParams {
  data: any;
}

export interface ButtonData {
  tag: string;
  text: string;
  params: HandlerParams;
  handler: (params: HandlerParams) => void | Promise<void>;
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
    default:
      targetWrapper.appendChild(div);
      break;
  }
  targetWrapper.setAttribute("tt-button-is-done", "true");
}
