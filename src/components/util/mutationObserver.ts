// 定义回调函数类型
type MutationObserverCallback = (mutations: MutationRecord[]) => void;

// 添加一个执行器参数，用于执行回调函数
export function execObserver(callback: MutationObserverCallback) {
  const observer = new MutationObserver(function (mutations) {
    // 在每次 DOM 变化时执行回调函数
    callback(mutations);
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
