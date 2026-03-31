import { NextRequest, NextResponse } from "next/server";
import { getBackend } from "../_lib";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const backendUrl = getBackend();

  let res: Response;
  try {
    res = await fetch(`${backendUrl}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ error: "تعذر الاتصال بالخادم" }, { status: 502 });
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 502 });
  }

  const data = await res.json();
  const response = NextResponse.json(data, { status: res.status });

  const setCookie = res.headers.get("set-cookie");
  if (setCookie) response.headers.set("set-cookie", setCookie);

  return response;
}
