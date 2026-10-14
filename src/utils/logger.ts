/**
 * 开发日志：只在开发模式 (__DEV__) 下输出，生产包中不打印
 */
export const debugLog = (...args: unknown[]): void => {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};
