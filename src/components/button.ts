import { createApp } from "vue";
import Button from "./Button.vue";

export interface ButtonData {
  tag: string;
  text: string;
  handler: () => void;
}

// 创建按钮区域
export function createButtonContainer(
  $toolBarParentWrapper: HTMLElement,
  buttonList: ButtonData[],
): void {
  const div = document.createElement("div");
  div.style.textOverflow = "unset";

  const app = createApp(Button, {
    buttonList,
  });
  app.mount(div);

  if ($toolBarParentWrapper.firstChild) {
    $toolBarParentWrapper.insertBefore(
      div,
      $toolBarParentWrapper.firstChild,
    );
  } else {
    $toolBarParentWrapper.appendChild(div);
  }
  $toolBarParentWrapper.setAttribute("tt-button-is-done", "true");
}
