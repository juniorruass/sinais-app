// Cache em memória (1 processo). Evita ir ao Supabase a cada clique; o admin limpa tudo ao salvar.
const store = new Map<string, { exp: number; v: unknown }>();
export async function memo<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.exp > Date.now()) return hit.v as T;
  const v = await fn();
  store.set(key, { exp: Date.now() + ttlMs, v });
  return v;
}
export const clearMemo = () => store.clear();
