import type { Metadata } from "next";
import ReturnPolicyClient from "./ReturnPolicyClient";

export const metadata: Metadata = {
  title: "سياسة الاستبدال والاسترجاع",
  description: "الشروط المنظمة لطلبات الإلغاء والاستبدال والاسترجاع داخل مؤسسة تبارك التقنية الذكية",
};

export default function ReturnPolicyPage() {
  return <ReturnPolicyClient />;
}
