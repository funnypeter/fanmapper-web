import { NextRequest, NextResponse } from "next/server";
import { searchAndFetchPage } from "@/lib/services/fandom";

export async function GET(request: NextRequest) {
  const wiki = request.nextUrl.searchParams.get("wiki");
  const title = request.nextUrl.searchParams.get("title");

  if (!wiki || !title) {
    return NextResponse.json({ html: null });
  }

  const page = await searchAndFetchPage(wiki, title);
  if (!page?.html) {
    return NextResponse.json({ html: null });
  }

  return NextResponse.json({
    title: page.title,
    html: page.html,
  });
}
