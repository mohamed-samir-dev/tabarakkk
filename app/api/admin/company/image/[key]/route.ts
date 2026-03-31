import { NextRequest, NextResponse } from "next/server";

const ALLOWED_BACKENDS = ["http://localhost:5000", "https://pasmthatfee.com", "https://backend-for-bsmastore-public-production.up.railway.app"];

function getBackend(): string {
  const url = process.env.BACKEND_URL || "http://localhost:5000";
  return ALLOWED_BACKENDS.includes(url) ? url : "http://localhost:5000";
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const cookie = req.headers.get("cookie") || "";
  const res = await fetch(`${getBackend()}/api/admin/company/image/${key}`, {
    method: "DELETE",
    headers: { cookie },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
