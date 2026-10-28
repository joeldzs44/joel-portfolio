import { randomUUID } from "node:crypto";
import { getSupabase } from "@/lib/server/supabase";
import type { Tag } from "./constants";

// Pending drawings live in the private "art" bucket; approval moves them to the
// public "art-public" bucket, so nothing is publicly reachable before Joel approves it.

const PRIVATE_BUCKET = "art";
const PUBLIC_BUCKET = "art-public";

type ArtStatus = "pending" | "approved" | "rejected";

export type ArtCommit = {
  id: string;
  createdAt: string;
  status: ArtStatus;
  tag: Tag;
  name: string;
  message: string;
  imageUrl: string;
};

type Row = { id: string; created_at: string; status: ArtStatus; tag: Tag; name: string; message: string; image_path: string };

const COLUMNS = "id, created_at, status, tag, name, message, image_path";

function toArt(row: Row, imageUrl: string): ArtCommit {
  return { id: row.id, createdAt: row.created_at, status: row.status, tag: row.tag, name: row.name, message: row.message, imageUrl };
}

function requireSupabase() {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Gallery storage is not configured");
  return supabase;
}

export async function getApprovedArt(): Promise<ArtCommit[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.from("art_commits").select(COLUMNS).eq("status", "approved").order("created_at", { ascending: false }).limit(60);
  if (error) {
    console.error("gallery", error.message);
    return [];
  }
  return (data as Row[]).map((row) => toArt(row, supabase.storage.from(PUBLIC_BUCKET).getPublicUrl(row.image_path).data.publicUrl));
}

export async function listForAdmin(): Promise<ArtCommit[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from("art_commits").select(COLUMNS).neq("status", "rejected").order("created_at", { ascending: false }).limit(200);
  if (error) throw new Error(error.message);
  const rows = data as Row[];
  const pending = rows.filter((row) => row.status === "pending");
  const signed = pending.length
    ? (await supabase.storage.from(PRIVATE_BUCKET).createSignedUrls(pending.map((row) => row.image_path), 600)).data ?? []
    : [];
  const signedByPath = new Map(signed.map((item) => [item.path, item.signedUrl]));
  return rows
    .map((row) =>
      toArt(
        row,
        row.status === "pending"
          ? signedByPath.get(row.image_path) ?? ""
          : supabase.storage.from(PUBLIC_BUCKET).getPublicUrl(row.image_path).data.publicUrl,
      ),
    )
    .sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending"));
}

export async function createPending({ png, tag, name, message, ipHash }: { png: Buffer; tag: Tag; name: string; message: string; ipHash: string }) {
  const supabase = requireSupabase();
  const id = randomUUID();
  const path = `pending/${id}.png`;
  const upload = await supabase.storage.from(PRIVATE_BUCKET).upload(path, png, { contentType: "image/png" });
  if (upload.error) throw new Error(upload.error.message);
  const insert = await supabase.from("art_commits").insert({ id, tag, name, message, image_path: path, ip_hash: ipHash });
  if (insert.error) {
    await supabase.storage.from(PRIVATE_BUCKET).remove([path]);
    throw new Error(insert.error.message);
  }
}

async function getRow(id: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from("art_commits").select(COLUMNS).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Not found");
  return { supabase, row: data as Row };
}

async function removeFile(supabase: ReturnType<typeof requireSupabase>, row: Row) {
  const bucket = row.status === "approved" ? PUBLIC_BUCKET : PRIVATE_BUCKET;
  await supabase.storage.from(bucket).remove([row.image_path]);
}

export async function approve(id: string) {
  const { supabase, row } = await getRow(id);
  if (row.status === "approved") return;
  const file = await supabase.storage.from(PRIVATE_BUCKET).download(row.image_path);
  if (file.error) throw new Error(file.error.message);
  const path = `approved/${id}.png`;
  const upload = await supabase.storage.from(PUBLIC_BUCKET).upload(path, file.data, { contentType: "image/png", upsert: true });
  if (upload.error) throw new Error(upload.error.message);
  const update = await supabase.from("art_commits").update({ status: "approved", image_path: path }).eq("id", id);
  if (update.error) throw new Error(update.error.message);
  await supabase.storage.from(PRIVATE_BUCKET).remove([row.image_path]);
}

export async function reject(id: string) {
  const { supabase, row } = await getRow(id);
  await removeFile(supabase, row);
  const update = await supabase.from("art_commits").update({ status: "rejected" }).eq("id", id);
  if (update.error) throw new Error(update.error.message);
}

export async function remove(id: string) {
  const { supabase, row } = await getRow(id);
  await removeFile(supabase, row);
  const result = await supabase.from("art_commits").delete().eq("id", id);
  if (result.error) throw new Error(result.error.message);
}
