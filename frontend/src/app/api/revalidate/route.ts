import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const docTypeToPaths = (type: string | null, slug: string | null) => {
  switch (type) {
    case "siteSettings":
      return ["/ar", "/en", "/ar/about", "/en/about", "/ar/literature", "/en/literature", "/ar/resources", "/en/resources"];
    case "page":
      if (slug === "home") {
        return ["/ar", "/en"];
      }
      if (slug) {
        return [`/ar/${slug}`, `/en/${slug}`];
      }
      return ["/ar", "/en"];
    case "article":
      return ["/ar", "/en", "/ar/literature", "/en/literature"];
    case "faq":
      return ["/ar", "/en"];
    case "resourceContent":
      return ["/ar/resources", "/en/resources"];
    default:
      return ["/ar", "/en"];
  }
};

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-sanity-webhook-secret");
  const expected = process.env.SANITY_REVALIDATE_SECRET ?? "";

  if (!expected || secret !== expected) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { _type?: string; slug?: { current?: string } | string };
  const slug = typeof body.slug === "string" ? body.slug : body.slug?.current ?? null;
  const paths = docTypeToPaths(body._type ?? null, slug);

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ ok: true, revalidated: paths });
}
