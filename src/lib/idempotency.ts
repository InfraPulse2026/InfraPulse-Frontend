// One key for one logical payload, including an explicit retry after a lost response.
export function idempotencySlot() {
  let previous = '';
  let key = '';
  return (payload: unknown) => {
    const next = JSON.stringify(payload);
    if (next !== previous || !key) {
      previous = next;
      key = crypto.randomUUID();
    }
    return key;
  };
}
