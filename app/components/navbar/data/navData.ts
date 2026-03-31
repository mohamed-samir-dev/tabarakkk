export interface NavChild {
  label: string;
  href: string;
}

export interface NavGroup {
  groupLabel: string;
  items: NavChild[];
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
  groups?: NavGroup[];
}

export const navItems: NavItem[] = [
  {
    label: "الهواتف الذكية",
    href: "/smartphones",
    groups: [
      {
        groupLabel: "آيفون",
        items: [
          { label: "آيفون 17 برو ماكس", href: "/smartphones/iphone-17-pro-max" },
          { label: "آيفون 17 برو", href: "/smartphones/iphone-17-pro" },
          { label: "آيفون 17 Air", href: "/smartphones/iphone-17-air" },
          { label: "آيفون 17 عادي", href: "/smartphones/iphone-17" },
          { label: "آيفون 16 برو ماكس", href: "/smartphones/iphone-16-pro-max" },
          { label: "آيفون 16 برو", href: "/smartphones/iphone-16-pro" },
          { label: "آيفون 16 بلس", href: "/smartphones/iphone-16-plus" },
          { label: "آيفون 16 عادي", href: "/smartphones/iphone-16" },
          { label: "آيفون 15 برو ماكس", href: "/smartphones/iphone-15-pro-max" },
          { label: "آيفون 15 برو", href: "/smartphones/iphone-15-pro" },
          { label: "آيفون 15 بلس", href: "/smartphones/iphone-15-plus" },
          { label: "آيفون 15 عادي", href: "/smartphones/iphone-15" },
          { label: "آيفون 14 برو ماكس", href: "/smartphones/iphone-14-pro-max" },
          { label: "آيفون 14 برو", href: "/smartphones/iphone-14-pro" },
          { label: "آيفون 14 بلس", href: "/smartphones/iphone-14-plus" },
          { label: "آيفون 14 عادي", href: "/smartphones/iphone-14" },
          { label: "آيفون 13 برو ماكس", href: "/smartphones/iphone-13-pro-max" },
          { label: "فقط آبل", href: "/smartphones/apple-only" },
        ],
      },
      {
        groupLabel: "سامسونج",
        items: [
          { label: "سامسونج S26 الترا", href: "/smartphones/samsung-s26-ultra" },
          { label: "سامسونج S25 الترا", href: "/smartphones/samsung-s25-ultra" },
          { label: "سامسونج S24 الترا", href: "/smartphones/samsung-s24-ultra" },
          { label: "سامسونج S23 الترا", href: "/smartphones/samsung-s23-ultra" },
          { label: "سامسونج S22 الترا", href: "/smartphones/samsung-s22-ultra" },
        ],
      },
    ],
  },
  {
    label: "ساعات ابل",
    href: "/apple-watches/se",
  },
  {
    label: "أجهزة صوت و سماعات",
    href: "/audio",
  },
  {
    label: "أجهزة بلاي ستيشن وملحقاتها",
    href: "/playstation",
  },
  {
    label: "لابتوبات وشاشات",
    href: "/laptops",
    children: [
      { label: "لابتوبات أبل", href: "/laptops/macbook-pro" },
      { label: "ماك بوك اير", href: "/laptops/macbook-air" },
      { label: "شاشات سامسونج", href: "/laptops/samsung-monitors" },
    ],
  },
  {
    label: "الاجهزة اللوحية ايبادات",
    href: "/tablets",
    children: [
      { label: "أبل", href: "/tablets/ipad-pro" },
      { label: "ايبادات ابل", href: "/tablets/ipad-air" },
    ],
  },
  {
    label: "بطاريات متنقلة وكيابل",
    href: "/accessories",
    children: [
      { label: "بطاريات متنقلة", href: "/accessories/anker-batteries" },
    ],
  },
  {
    label: "ألعاب الفيديو",
    href: "/games",
    children: [
      { label: "ماوسات وكيبوردات ألعاب", href: "/games/mice-keyboards" },
      { label: "مايكروفونات", href: "/games/microphones" },
      { label: "مجسمات وفيقرز", href: "/games/figures" },
      { label: " اضاءات RGB", href: "/games/rgb-lighting" },
    ],
  },
];
