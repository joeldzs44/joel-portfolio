import { beforeEach, describe, expect, it, vi } from "vitest";

const store = vi.hoisted(() => ({ approve: vi.fn(), reject: vi.fn(), remove: vi.fn() }));
const cache = vi.hoisted(() => ({ revalidatePath: vi.fn() }));
const cookieJar = vi.hoisted(() => ({ value: undefined as string | undefined }));

vi.mock("@/lib/gallery/store", () => store);
vi.mock("next/cache", () => cache);
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => (cookieJar.value ? { value: cookieJar.value } : undefined) }),
}));

import { signToken } from "@/lib/server/signed-token";
import { DELETE, PATCH } from "./route";

const SECRET = "test-session-secret";
const ID = "4b1c6f0e-2a3d-4e5f-8a9b-0c1d2e3f4a5b";
const params = Promise.resolve({ id: ID });
const request = (method: string, body?: unknown) =>
  new Request("http://localhost/api/admin/art/art-1", {
    method,
    headers: { origin: "http://localhost", "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("SESSION_SECRET", SECRET);
  cookieJar.value = signToken("admin", 600, SECRET);
});

describe("admin art moderation", () => {
  it("approves, then refreshes the home page", async () => {
    const res = await PATCH(request("PATCH", { action: "approve" }), { params });
    expect(res.status).toBe(200);
    expect(store.approve).toHaveBeenCalledWith(ID);
    expect(cache.revalidatePath).toHaveBeenCalledWith("/");
  });

  it("rejects", async () => {
    await PATCH(request("PATCH", { action: "reject" }), { params });
    expect(store.reject).toHaveBeenCalledWith(ID);
  });

  it("deletes", async () => {
    await DELETE(request("DELETE"), { params });
    expect(store.remove).toHaveBeenCalledWith(ID);
  });

  it("returns 404 for an id that can't exist", async () => {
    const res = await DELETE(request("DELETE"), { params: Promise.resolve({ id: "not-a-uuid" }) });
    expect(res.status).toBe(404);
    expect(store.remove).not.toHaveBeenCalled();
  });

  it("refuses without a valid admin session", async () => {
    cookieJar.value = signToken("interview", 600, SECRET);
    const res = await PATCH(request("PATCH", { action: "approve" }), { params });
    expect(res.status).toBe(401);
    expect(store.approve).not.toHaveBeenCalled();
  });

  it("refuses requests from other sites", async () => {
    const req = new Request("http://localhost/api/admin/art/art-1", { method: "DELETE", headers: { origin: "https://evil.example" } });
    expect((await DELETE(req, { params })).status).toBe(403);
    expect(store.remove).not.toHaveBeenCalled();
  });
});
