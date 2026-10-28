import type { Metadata } from "next";
import { listForAdmin, type ArtCommit } from "@/lib/gallery/store";
import { isAdmin } from "@/lib/server/admin";
import { Container } from "@/components/ui";
import { AdminBoard, AdminLogin } from "./admin-board";

export const metadata: Metadata = { title: "Moderate art", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  if (!(await isAdmin())) {
    return (
      <Container className="flex max-w-[480px] flex-col gap-6 py-24">
        <h1 className="section-title">Moderate art</h1>
        <AdminLogin />
      </Container>
    );
  }

  let items: ArtCommit[] = [];
  let error = "";
  try {
    items = await listForAdmin();
  } catch {
    error = "Couldn't load submissions. Check the Supabase settings.";
  }

  return (
    <Container className="flex flex-col gap-8 py-16">
      <h1 className="section-title">Moderate art</h1>
      {error ? <p className="text-danger">{error}</p> : <AdminBoard initial={items} />}
    </Container>
  );
}
