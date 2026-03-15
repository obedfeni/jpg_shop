const store = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowSeconds: number): boolean {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of store.entries()) {
    if (val.resetAt < now) store.delete(key);
  }
}, 60_000);
