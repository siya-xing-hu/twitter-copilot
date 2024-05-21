// 定义回调函数类型
type MutationObserverCallback = (
  mutations: MutationRecord[],
) => Promise<boolean>;

// 添加一个执行器参数，用于执行回调函数
export function execObserver(
  wrapper: HTMLElement,
  callback: MutationObserverCallback,
) {
  const observer = new MutationObserver(function (mutations) {
    // 在每次 DOM 变化时执行回调函数
    // 防抖处理
    let timeoutId: number | undefined;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(async () => {
      const finished = await callback(mutations);
      if (finished) {
        observer.disconnect();
      }
    }, 1000);
  });

  observer.observe(wrapper, { childList: true, subtree: true });
}
