import { NextRequest, NextResponse } from "next/server";
import { getBackend } from "../_lib";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

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

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 502 });
  }

  const response = NextResponse.json(data, { status: res.status });

  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    try {
      response.headers.set("set-cookie", setCookie);
    } catch {
      // ignore header errors
    }
  }

  return response;
}
