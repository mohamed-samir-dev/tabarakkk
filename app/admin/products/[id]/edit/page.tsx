"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

type ColorVariant = { color: string; images: string[] };

type ProductForm = {
  name: string;
  originalPrice: string;
  salePrice: string;
  category: string;
  subCategory: string;
  brand: string;
  color: string;
  storage: string;
  network: string;
  screenSize: string;
  description: string;
  deliveryTime: string;
  warrantyYears: string;
  freeDelivery: boolean;
  taxIncluded: boolean;
  inStock: boolean;
  installmentAvailable: boolean;
  installmentDownPayment: string;
  installmentMonths: string;
  installmentNote: string;
  multiColor: boolean;
  showVariants: boolean;
  specs: {
    screen: string; processor: string; ram: string; storage: string;
    rearCamera: string; frontCamera: string; battery: string;
    batteryLife: string; charging: string; os: string; extras: string;
  };
};

const EMPTY_FORM: ProductForm = {
  name: "", originalPrice: "", salePrice: "", category: "", subCategory: "",
  brand: "", color: "", storage: "", network: "", screenSize: "",
  description: "", deliveryTime: "24 ساعة", warrantyYears: "2",
  freeDelivery: true, taxIncluded: true, inStock: true,
  installmentAvailable: false, installmentDownPayment: "", installmentMonths: "", installmentNote: "",
  multiColor: false, showVariants: false,
  specs: { screen: "", processor: "", ram: "", storage: "", rearCamera: "", frontCamera: "", battery: "", batteryLife: "", charging: "", os: "", extras: "" },
};

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string>("");
  const [colors, setColors] = useState<ColorVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageTs, setImageTs] = useState(() => Date.now());
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/admin/sub-categories/all", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { name: string }[]) => setSubCategories(data.map((s) => s.name).filter(Boolean)))
      .catch(() => {});
    fetch("/api/admin/categories", { credentials: "include" })
      .then((r) => r.json())
      .then((data: string[]) => setCategories(data.filter(Boolean).sort()))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/api/admin/products/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((p) => {
        setForm({
          name: p.name || "",
          originalPrice: p.originalPrice != null ? String(p.originalPrice) : "",
          salePrice: p.salePrice != null ? String(p.salePrice) : "",
          category: p.category || "",
          subCategory: p.subCategory || "",
          brand: p.brand || "",
          color: p.color || "",
          storage: p.storage || "",
          network: p.network || "",
          screenSize: p.screenSize || "",
          description: p.description || "",
          deliveryTime: p.deliveryTime || "24 ساعة",
          warrantyYears: p.warrantyYears != null ? String(p.warrantyYears) : "2",
          freeDelivery: p.freeDelivery ?? true,
          taxIncluded: p.taxIncluded ?? true,
          inStock: p.inStock ?? true,
          installmentAvailable: p.installment?.available ?? false,
          installmentDownPayment: p.installment?.downPayment != null ? String(p.installment.downPayment) : "",
          installmentMonths: p.installment?.months != null ? String(p.installment.months) : "",
          installmentNote: p.installment?.note || "",
          multiColor: Array.isArray(p.colors) && p.colors.length > 0,
          showVariants: Array.isArray(p.colors) && p.colors.length > 0,
          specs: {
            screen: p.specs?.screen || "", processor: p.specs?.processor || "",
            ram: p.specs?.ram || "", storage: p.specs?.storage || "",
            rearCamera: p.specs?.rearCamera || "", frontCamera: p.specs?.frontCamera || "",
            battery: p.specs?.battery || "", batteryLife: p.specs?.batteryLife || "",
            charging: p.specs?.charging || "", os: p.specs?.os || "", extras: p.specs?.extras || "",
          },
        });
        setCurrentImage(p.image || "");
        if (Array.isArray(p.colors)) setColors(p.colors);
      })
      .catch(() => toast.error("فشل تحميل المنتج"))
      .finally(() => setLoading(false));
  }, [id]);

  function set(key: keyof ProductForm, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setSpec(key: keyof ProductForm["specs"], value: string) {
    setForm((prev) => ({ ...prev, specs: { ...prev.specs, [key]: value } }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewImageFile(file);
    setNewImagePreview(URL.createObjectURL(file));
    // reset input so same file can be re-selected
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      const fields: (keyof ProductForm)[] = [
        "name", "originalPrice", "salePrice", "category", "subCategory", "brand",
        "color", "storage", "network", "screenSize", "description", "deliveryTime", "warrantyYears",
      ];
      fields.forEach((f) => fd.append(f, String(form[f])));
      fd.append("freeDelivery", String(form.freeDelivery));
      fd.append("taxIncluded", String(form.taxIncluded));
      fd.append("inStock", String(form.inStock));
      fd.append("installment.available", String(form.installmentAvailable));
      fd.append("installment.downPayment", form.installmentDownPayment);
      fd.append("installment.months", form.installmentMonths);
      fd.append("installment.note", form.installmentNote);

      const specKeys = Object.keys(form.specs) as (keyof ProductForm["specs"])[];
      specKeys.forEach((k) => fd.append(`specs.${k}`, form.specs[k]));

      if (form.multiColor) fd.append("colors", JSON.stringify(colors));

      if (newImageFile) fd.append("image", newImageFile);

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");
      // update displayed image from response and bust cache
      if (data.image) {
        setCurrentImage(data.image);
        setImageTs(Date.now());
        setNewImageFile(null);
        setNewImagePreview("");
      }
      toast.success("تم حفظ التعديلات بنجاح ✅");
      router.push("/admin/products");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayImage = newImagePreview || (currentImage ? `${currentImage}?t=${imageTs}` : "");

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">تعديل صنف</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-60"
          >
            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 border-b pb-2">المعلومات الأساسية</h2>

          <Field label="الاسم">
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputCls}
              required
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           
            <Field label="السعر الجديد (سعر البيع)">
              <input type="number" value={form.salePrice} onChange={(e) => set("salePrice", e.target.value)} className={inputCls} min="0" step="0.01" placeholder="0.00" />
            </Field>
            <Field label="السعر القديم (المشطوب عليه)">
              <input type="number" value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} className={inputCls} required min="0" step="0.01" />
            </Field>
          </div>
          {form.salePrice && form.originalPrice && Number(form.salePrice) >= Number(form.originalPrice) && (
            <p className="text-red-500 text-sm">⚠️ سعر البيع يجب أن يكون أقل من السعر الأصلي</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="التصنيف">
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
                <option value="">-- اختر تصنيف --</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                {form.category && !categories.includes(form.category) && (
                  <option value={form.category}>{form.category}</option>
                )}
              </select>
            </Field>
            <Field label="التصنيف الفرعي">
              <select value={form.subCategory} onChange={(e) => set("subCategory", e.target.value)} className={inputCls}>
                <option value="">-- اختر تصنيف فرعي --</option>
                {subCategories.map((s) => <option key={s} value={s}>{s}</option>)}
                {form.subCategory && !subCategories.includes(form.subCategory) && (
                  <option value={form.subCategory}>{form.subCategory}</option>
                )}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="الماركة">
              <input type="text" value={form.brand} onChange={(e) => set("brand", e.target.value)} className={inputCls} />
            </Field>
            <Field label="اللون">
              <input type="text" value={form.color} onChange={(e) => set("color", e.target.value)} className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="التخزين">
              <input type="text" value={form.storage} onChange={(e) => set("storage", e.target.value)} className={inputCls} placeholder="256GB" />
            </Field>
            <Field label="الشبكة">
              <input type="text" value={form.network} onChange={(e) => set("network", e.target.value)} className={inputCls} placeholder="5G" />
            </Field>
            <Field label="حجم الشاشة">
              <input type="text" value={form.screenSize} onChange={(e) => set("screenSize", e.target.value)} className={inputCls} placeholder='6.8"' />
            </Field>
          </div>

          <Field label="الوصف">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={inputCls + " resize-none"}
              rows={3}
            />
          </Field>
        </div>

        {/* Delivery & Stock */}
        <div className="bg-white rounded-xl shadow p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 border-b pb-2">التوصيل والمخزون</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="وقت التوصيل">
              <input type="text" value={form.deliveryTime} onChange={(e) => set("deliveryTime", e.target.value)} className={inputCls} />
            </Field>
            <Field label="سنوات الضمان">
              <input type="number" value={form.warrantyYears} onChange={(e) => set("warrantyYears", e.target.value)} className={inputCls} min="0" />
            </Field>
          </div>
          <div className="flex flex-wrap gap-5">
            <Toggle label="توصيل مجاني" checked={form.freeDelivery} onChange={(v) => set("freeDelivery", v)} />
            <Toggle label="السعر شامل الضريبة" checked={form.taxIncluded} onChange={(v) => set("taxIncluded", v)} />
            <Toggle label="متوفر في المخزون" checked={form.inStock} onChange={(v) => set("inStock", v)} />
          </div>
        </div>

        {/* Installment */}
        <div className="bg-white rounded-xl shadow p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="font-semibold text-gray-700">بيع بالتقسيط</h2>
            <Toggle label="" checked={form.installmentAvailable} onChange={(v) => set("installmentAvailable", v)} />
          </div>
          {form.installmentAvailable && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="الدفعة الأولى">
                <input type="number" value={form.installmentDownPayment} onChange={(e) => set("installmentDownPayment", e.target.value)} className={inputCls} min="0" />
              </Field>
              <Field label="عدد الأشهر">
                <input type="number" value={form.installmentMonths} onChange={(e) => set("installmentMonths", e.target.value)} className={inputCls} min="1" />
              </Field>
              <div className="col-span-2">
                <Field label="ملاحظة التقسيط">
                  <input type="text" value={form.installmentNote} onChange={(e) => set("installmentNote", e.target.value)} className={inputCls} />
                </Field>
              </div>
            </div>
          )}
        </div>

        {/* Colors / Variants */}
        <div className="bg-white rounded-xl shadow p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="font-semibold text-gray-700">متعدد الألوان</h2>
            <Toggle label="" checked={form.multiColor} onChange={(v) => { set("multiColor", v); if (!v) set("showVariants", false); }} />
          </div>
          {form.multiColor && (
            <>
              <Toggle label="إظهار النسخ" checked={form.showVariants} onChange={(v) => set("showVariants", v)} />
              <div className="space-y-3">
                {colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                    <input
                      type="text"
                      value={c.color}
                      onChange={(e) => setColors((prev) => prev.map((x, j) => j === i ? { ...x, color: e.target.value } : x))}
                      placeholder="اسم اللون"
                      className={inputCls + " flex-1"}
                    />
                    <button
                      type="button"
                      onClick={() => setColors((prev) => prev.filter((_, j) => j !== i))}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      حذف
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setColors((prev) => [...prev, { color: "", images: [] }])}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + إضافة لون
                </button>
              </div>
            </>
          )}
        </div>

        {/* Specs */}
        <div className="bg-white rounded-xl shadow p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 border-b pb-2">التفاصيل التقنية</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(
              [
                ["screen", "الشاشة"], ["processor", "المعالج"], ["ram", "الرام"],
                ["storage", "التخزين"], ["rearCamera", "الكاميرا الخلفية"], ["frontCamera", "الكاميرا الأمامية"],
                ["battery", "البطارية"], ["batteryLife", "عمر البطارية"], ["charging", "الشحن"],
                ["os", "نظام التشغيل"],
              ] as [keyof ProductForm["specs"], string][]
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <input type="text" value={form.specs[key]} onChange={(e) => setSpec(key, e.target.value)} className={inputCls} />
              </Field>
            ))}
            <div className="col-span-2">
              <Field label="مميزات إضافية">
                <textarea value={form.specs.extras} onChange={(e) => setSpec("extras", e.target.value)} className={inputCls + " resize-none"} rows={2} />
              </Field>
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="bg-white rounded-xl shadow p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 border-b pb-2">الصورة</h2>
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {displayImage ? (
              <div className="w-32 h-32 rounded-xl overflow-hidden border border-gray-200 shrink-0 flex items-center justify-center bg-gray-50">
                <img src={displayImage} alt="صورة المنتج" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs shrink-0">
                لا توجد صورة
              </div>
            )}
            <div className="flex flex-col gap-2">
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                {displayImage ? "تغيير الصورة" : "رفع صورة"}
              </button>
              {newImageFile && <p className="text-xs text-green-600">✓ {newImageFile.name}</p>}
              {!newImageFile && currentImage && <p className="text-xs text-gray-400">الصورة الحالية محفوظة</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Save */}
      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-60"
        >
          {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      {label && <label className="block text-sm text-gray-600 mb-1">{label}</label>}
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-gray-300"}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? "right-0.5" : "left-0.5"}`} />
      </div>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  );
}

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
