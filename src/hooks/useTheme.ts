import { useSyncExternalStore } from 'react';
const read = () => document.documentElement.dataset.theme === 'light';
const subscribe = (notify: () => void) => {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
};
export function useLightTheme() {
  return useSyncExternalStore(subscribe, read, () => false);
}
