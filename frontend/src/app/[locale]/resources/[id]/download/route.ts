import { NextResponse } from "next/server";

import { resourcesService } from "@/services/resources.service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const result = await resourcesService.getDownloadUrl(id);

  return NextResponse.redirect(result.url);
}
