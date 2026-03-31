import type { Metadata } from "next";
import SmartphonesClient from "./SmartphonesClient";

export const dynamic = "force-dynamic";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";
const SITE_URL = "https://www.pasmthatfee.com";

async function getCompany() {
  try {
    const r = await fetch(`${BACKEND}/api/admin/company`, { next: { revalidate: 3600 } });
    return r.ok ? r.json() : {};
  } catch {
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  const siteName = company.nameAr || "بصمة هاتفي المعتمد";
  return {
    title: `الهواتف الذكية | ${siteName}`,
    description: `تسوق أحدث الهواتف الذكية بأفضل الأسعار وبالأقساط في ${siteName}. آيفون، سامسونج وأكثر.`,
    alternates: { canonical: `${SITE_URL}/smartphones` },
  };
}

export default function SmartphonesPage() {
  return <SmartphonesClient />;
}
