import { useSearchParams } from 'react-router-dom';
export function useFilters() {
  const [params, setParams] = useSearchParams();
  const update = (key: string, value: string | number) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value !== '') next.set(key, String(value));
      else next.delete(key);
      if (key !== 'offset' && key !== 'before_id' && key !== 'tab') {
        next.delete('offset');
        next.delete('before_id');
      }
      return next;
    });
  };
  return { params, update, offset: Math.max(0, Number(params.get('offset')) || 0) };
}
