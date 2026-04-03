"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
  specs: { screen: "", processor: "", ram: "", storage: "", rearCamera: "", frontCamera: "", battery: "", batteryLife: "", charging: "", os: "", extras: "" },
};

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);

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

  function set(key: keyof ProductForm, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setSpec(key: keyof ProductForm["specs"], value: string) {
    setForm((prev) => ({ ...prev, specs: { ...prev.specs, [key]: value } }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
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

      (Object.keys(form.specs) as (keyof ProductForm["specs"])[]).forEach((k) =>
        fd.append(`specs.${k}`, form.specs[k])
      );

      if (imageFile) fd.append("image", imageFile);

      const res = await fetch("/api/admin/products", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الإضافة");
      toast.success("تم إضافة المنتج بنجاح ✅");
      router.push("/admin/products");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">إضافة صنف جديد</h1>
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
            {saving ? "جاري الحفظ..." : "إضافة المنتج"}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 border-b pb-2">المعلومات الأساسية</h2>

          <Field label="الاسم">
            <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} required />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="السعر الأصلي (المشطوب عليه)">
              <input type="number" value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} className={inputCls} required min="0" step="0.01" placeholder="0.00" />
            </Field>
            <Field label="سعر البيع (بعد الخصم)">
              <input type="number" value={form.salePrice} onChange={(e) => set("salePrice", e.target.value)} className={inputCls} min="0" step="0.01" placeholder="0.00" />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="التصنيف">
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
                <option value="">-- اختر تصنيف --</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="التصنيف الفرعي">
              <select value={form.subCategory} onChange={(e) => set("subCategory", e.target.value)} className={inputCls}>
                <option value="">-- اختر تصنيف فرعي --</option>
                {subCategories.map((s) => <option key={s} value={s}>{s}</option>)}
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
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} className={inputCls + " resize-none"} rows={3} />
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
            {imagePreview ? (
              <div className="w-32 h-32 rounded-xl overflow-hidden border border-gray-200 shrink-0 flex items-center justify-center bg-gray-50">
                <img src={imagePreview} alt="صورة المنتج" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs shrink-0">
                لا توجد صورة
              </div>
            )}
            <div className="flex flex-col gap-2">
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              <button type="button" onClick={() => imageInputRef.current?.click()} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                {imagePreview ? "تغيير الصورة" : "رفع صورة"}
              </button>
              {imageFile && <p className="text-xs text-green-600">✓ {imageFile.name}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Save */}
      <div className="flex justify-end gap-2 mt-6">
        <button type="button" onClick={() => router.push("/admin/products")} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
          إلغاء
        </button>
        <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-60">
          {saving ? "جاري الحفظ..." : "إضافة المنتج"}
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
      <div onClick={() => onChange(!checked)} className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-gray-300"}`}>
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? "right-0.5" : "left-0.5"}`} />
      </div>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  );
}

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
