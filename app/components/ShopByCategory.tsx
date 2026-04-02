import CategorySlider from "./CategorySlider";
import { slugConfigs } from "../lib/categoryConfig";

const BACKEND = process.env.BACKEND_URL || "https://tabaraktech.com/api/tabarak";

// بنبني الـ map تلقائياً من slugConfigs عشان يكون دايماً متزامن
const categoryPageMap: Record<string, string> = {};
for (const [slug, config] of Object.entries(slugConfigs)) {
  const catFilter = config.filters.category;
  if (catFilter && !categoryPageMap[catFilter]) {
    // نحدد الـ parent path من parentHref
    const parent = config.parentHref.replace(/^\//, "").split("/")[0];
    categoryPageMap[catFilter] = `/${parent}/${slug}`;
  }
}

type Category = { name: string; count: number; image: string };
type Setting = { category: string; subCategory: string; showInHome: boolean; order: number };

async function getCategories(): Promise<Category[]> {
  try {
    const [catRes, settingsRes] = await Promise.all([
      fetch(`${BACKEND}/api/admin/sub-categories/public`, { cache: "no-store" }),
      fetch(`${BACKEND}/api/admin/sub-categories/home-settings`, { cache: "no-store" }),
    ]);
    const allCats: Category[] = catRes.ok ? await catRes.json() : [];
    const settings: Setting[] = settingsRes.ok ? await settingsRes.json() : [];

    const visibleSet = new Map(
      settings.filter((s) => s.showInHome).map((s) => [s.category, s.order])
    );

    return allCats
      .filter((c) => visibleSet.has(c.name))
      .sort((a, b) => (visibleSet.get(a.name) ?? 0) - (visibleSet.get(b.name) ?? 0));
  } catch {
    return [];
  }
}

export default async function ShopByCategory() {
  const categories = await getCategories();
  if (!categories.length) return null;

  const categoriesWithHref = categories.map((cat) => {
    const name = cat.name?.trim();
    const href = categoryPageMap[name] ?? categoryPageMap[name?.toLowerCase()] ?? `/search?q=${encodeURIComponent(name)}`;
    return { ...cat, href };
  });

  return (
    <div className="w-full px-3 sm:px-6 py-4" dir="rtl">
    <section className="max-w-6xl mx-auto rounded-2xl py-10 shadow-md overflow-hidden bg-white" dir="rtl">
      <div className="px-3 sm:px-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-[#7CC043]" />
          <h2 className="text-lg sm:text-xl font-bold text-[#0F4C6E] whitespace-nowrap">تسوق حسب الأقسام</h2>
          <div className="flex-1 h-px bg-[#7CC043]" />
        </div>
        <CategorySlider categories={categoriesWithHref} />
      </div>
    </section>
    </div>
  );
}
