// Test double for the Supabase client: every query-builder call is recorded and
// every awaited query resolves to `result`.

type Call = { method: string; args: unknown[] };

export function fakeSupabase(result: { data?: unknown; error?: unknown } = {}) {
  const calls: Call[] = [];
  const resolved = { data: null, error: null, ...result };
  const record = (method: string) => (...args: unknown[]) => {
    calls.push({ method, args });
    return chain;
  };
  const chain: object = new Proxy(
    {},
    {
      get: (_, prop) =>
        prop === "then" ? (resolve: (value: typeof resolved) => void) => resolve(resolved) : record(String(prop)),
    },
  );
  const client = { from: record("from"), rpc: record("rpc"), storage: { from: record("storage.from") } };
  return { client, args: (method: string) => calls.filter((call) => call.method === method).map((call) => call.args) };
}
