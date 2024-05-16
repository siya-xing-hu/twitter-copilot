import { createApp, h } from "vue";
import Dialog from "./Dialog.vue";

// 创建和显示弹框
export function createDialogContainer(
  text: string,
  onConfirm: () => void,
  onCancel: () => void,
): void {
  const dialogContainer = document.createElement("div");
  dialogContainer.setAttribute("id", "dialog-container");

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
          document.body.removeChild(dialogContainer);
        },
      });
    },
  });
  app.mount(dialogContainer);

  document.body.appendChild(dialogContainer);
}
