import { createApp, h } from "vue";
import Dialog from "./Dialog.vue";

// 创建和显示弹框
export function createDialogContainer(
  text: string,
  confirm: () => void,
  cancel: () => void,
): void {
  const dialogContainer = document.createElement("div");
  dialogContainer.setAttribute("id", "dialog-container");

  const app = createApp({
    render() {
      return h(Dialog, {
        text,
        onConfirm: () => {
          confirm();
          app.unmount();
          document.body.removeChild(dialogContainer);
        },
        onCancel: () => {
          cancel();
          app.unmount();
          document.body.removeChild(dialogContainer);
        },
      });
    },
  });
  app.mount(dialogContainer);

  document.body.appendChild(dialogContainer);
}
