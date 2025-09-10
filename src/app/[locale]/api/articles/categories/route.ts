// app/categories/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
  const data = await response.json();

  return NextResponse.json(data);
}