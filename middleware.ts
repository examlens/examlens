import { NextResponse } from "next/server";

export function middleware(req: any) {
  const url = req.nextUrl.clone();

  // Example simple protection (can improve later)
  // You can also check cookies / session here

  return NextResponse.next();
}