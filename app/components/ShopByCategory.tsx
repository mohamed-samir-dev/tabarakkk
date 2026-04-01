import CategorySlider from "./CategorySlider";

const BACKEND = process.env.BACKEND_URL || "https://tabaraktech.com/api/tabarak";

const categoryPageMap: Record<string, string> = {
  // ─── Smartphones ───────────────────────────────────────────
  smartphone: "/smartphones",
  smartphones: "/smartphones",
  "الهواتف الذكية": "/smartphones",
  "ابل ايفون 13 برو ماكس": "/smartphones/iphone-13-pro-max",
  "ابل ايفون 14 برو ماكس": "/smartphones/iphone-14-pro-max",
  "ابل ايفون 14 برو": "/smartphones/iphone-14-pro",
  "ابل ايفون 14 بلس": "/smartphones/iphone-14-plus",
  "ابل ايفون 14": "/smartphones/iphone-14",
  "ابل ايفون 15 برو ماكس": "/smartphones/iphone-15-pro-max",
  "ابل ايفون 15 برو": "/smartphones/iphone-15-pro",
  "ابل ايفون 15 بلس": "/smartphones/iphone-15-plus",
  "ابل ايفون 15": "/smartphones/iphone-15",
  "ابل ايفون 16 برو ماكس": "/smartphones/iphone-16-pro-max",
  "ابل ايفون 16 برو": "/smartphones/iphone-16-pro",
  "ابل ايفون 16 بلس": "/smartphones/iphone-16-plus",
  "ابل ايفون 16 عادي": "/smartphones/iphone-16",
  "ابل ايفون 16": "/smartphones/iphone-16",
  "ابل ايفون 17 برو ماكس": "/smartphones/iphone-17-pro-max",
  "ابل ايفون 17برو ماكس": "/smartphones/iphone-17-pro-max",
  "ابل ايفون 17 برو": "/smartphones/iphone-17-pro",
  "ابل ايفون 17 اير": "/smartphones/iphone-17-air",
  "ابل ايفون 17": "/smartphones/iphone-17",
  "سامسونج جالكسي": "/smartphones/samsung-s25-ultra",
  "سامسونج جالكسي اس 22 الترا": "/smartphones/samsung-s22-ultra",
  "سامسونج جالكسي اس 23 الترا": "/smartphones/samsung-s23-ultra",
  "سامسونج جالكسي اس 24 الترا": "/smartphones/samsung-s24-ultra",
  "سامسونج جالكسي اس 25 الترا": "/smartphones/samsung-s25-ultra",
  "سامسونج جالكسي اس 26 الترا": "/smartphones/samsung-s26-ultra",

  // ─── Watches ───────────────────────────────────────────────
  watch: "/apple-watches/se",
  "smart-watch": "/smart-watches/smart-watches",
  smartwatch: "/smart-watches/smart-watches",
  "ساعات ذكية": "/smart-watches/smart-watches",
  "الساعات الذكية": "/smart-watches/smart-watches",
  "ساعات ابل": "/apple-watches/se",
  "ساعات أبل": "/apple-watches/se",

  // ─── Audio ─────────────────────────────────────────────────
  audio: "/audio/airpods-pro",
  "سماعات ابل": "/audio/airpods-pro",
  "سماعات أبل": "/audio/airpods-pro",
  speaker: "/audio/airpods-max",
  earbuds: "/audio/samsung-buds",

  // ─── PlayStation ───────────────────────────────────────────
  ps5: "/playstation/ps5",
  ps4: "/playstation/ps5-slim",
  xbox: "/playstation/xbox-one",
  controller: "/playstation/controllers",
  "gaming-accessories": "/playstation/ps-accessories",
  "بلاي ستيشن": "/playstation/ps5",

  // ─── Laptops & Monitors ────────────────────────────────────
  laptop: "/laptops/macbook-pro",
  monitor: "/laptops/samsung-monitors",
  "لابتوبات": "/laptops/macbook-pro",

  // ─── Tablets ───────────────────────────────────────────────
  tablet: "/tablets/ipad-pro",
  "ايبادات": "/tablets/ipad-pro",

  // ─── Accessories ───────────────────────────────────────────
  powerbank: "/accessories/anker-batteries",
  "ملحقات": "/accessories/anker-batteries",

  // ─── Games ─────────────────────────────────────────────────
  gaming: "/games/ps5-games",
  "mice-keyboards": "/games/mice-keyboards",
  microphone: "/games/microphones",
  figures: "/games/figures",
  rgb: "/games/rgb-lighting",
  "العاب": "/games/ps5-games",
};

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
    const href = categoryPageMap[name] ?? categoryPageMap[name?.toLowerCase()]
      ?? Object.entries(categoryPageMap).find(([k]) => name?.includes(k) || k.includes(name))?.[1]
      ?? "#";
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
