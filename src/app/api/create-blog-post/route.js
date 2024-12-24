import { createBlogPostAction } from "@/actions/blog";
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();
  const headers = req.headers;

  const result = await createBlogPostAction(body, headers);

  return NextResponse.json(result);
}
