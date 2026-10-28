import { revalidatePath } from "next/cache";
import { approve, reject, remove } from "@/lib/gallery/store";
import { isAdmin } from "@/lib/server/admin";
import { isSameOrigin, json } from "@/lib/server/request";

type Context = { params: Promise<{ id: string }> };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function guard(req: Request) {
  if (!isSameOrigin(req)) return json({ error: "Forbidden" }, 403);
  if (!(await isAdmin())) return json({ error: "Sign in again." }, 401);
  return null;
}

export async function PATCH(req: Request, { params }: Context) {
  const denied = await guard(req);
  if (denied) return denied;
  const { id } = await params;
  if (!UUID.test(id)) return json({ error: "Not found." }, 404);
  const { action } = (await req.json().catch(() => ({}))) as { action?: string };
  if (action !== "approve" && action !== "reject") return json({ error: "Unknown action." }, 400);
  try {
    await (action === "approve" ? approve(id) : reject(id));
  } catch (error) {
    console.error("moderation", error instanceof Error ? error.message : error);
    return json({ error: "Couldn't update that drawing." }, 500);
  }
  revalidatePath("/");
  return json({ ok: true });
}

export async function DELETE(req: Request, { params }: Context) {
  const denied = await guard(req);
  if (denied) return denied;
  const { id } = await params;
  if (!UUID.test(id)) return json({ error: "Not found." }, 404);
  try {
    await remove(id);
  } catch (error) {
    console.error("moderation", error instanceof Error ? error.message : error);
    return json({ error: "Couldn't delete that drawing." }, 500);
  }
  revalidatePath("/");
  return json({ ok: true });
}
