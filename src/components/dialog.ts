import { createApp } from "vue";
import Dialog from "./Dialog.vue";

// 创建和显示弹框
function createContainer(
  text: string,
  onConfirm: () => void,
  onCancel: () => void,
): void {
  const dialogContainer = document.createElement("div");
  document.body.appendChild(dialogContainer);

  const app = createApp({
    render() {
      return createApp(Dialog, {
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
}
