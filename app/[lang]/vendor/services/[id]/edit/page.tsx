"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Service } from "../../types";
import Typography from "../../../../components/atoms/Typography";
import Button from "../../../../components/atoms/Button";
import Textarea from "../../../../components/atoms/Textarea";
import Input from "../../../../components/atoms/Input";
import { getServiceById, updateService, getCategories, getSubcategories } from "@/services/catalogService";
import { toApiUiError } from "@/utils/apiErrors";
import Loading from "@/app/loading";

type Tab = "details" | "location" | "pricing" | "description";
type Category = { id: number; name: string };

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params?.id as string;

  const [service, setService] = useState<Service | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "error" | "ready">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("details");

  // Editable fields, seeded from the loaded service.
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(1);
  const [description, setDescription] = useState("");
  const [weekdayPrice, setWeekdayPrice] = useState("");
  const [weekendPrice, setWeekendPrice] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
  const [subcategoryName, setSubcategoryName] = useState<string | null>(null);

  // Category/subcategory picker — only fetched if the vendor opens it to change category.
  const [changingCategory, setChangingCategory] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!serviceId) return;
    setLoadState("loading");
    setLoadError(null);
    try {
      const data = await getServiceById(serviceId);
      setService(data);
      setName(data.name || "");
      setCapacity(data.capacity || 1);
      setDescription(data.description || "");
      setIsAvailable(data.isAvailable ?? true);
      setSubcategoryId(data.subcategory?.id ?? null);
      setSubcategoryName(data.subcategory?.name ?? null);
      const primaryAddress = data.addresses?.find((a: any) => a.isPrimary) || data.addresses?.[0];
      setStreet(primaryAddress?.street || "");
      setCity(primaryAddress?.city || "");
      setState(primaryAddress?.state || "");
      setPostalCode(primaryAddress?.postalCode || "");
      const weekday = data.prices?.find((p: any) => p.dayType === "weekday" || p.dayType === "both");
      const weekend = data.prices?.find((p: any) => p.dayType === "weekend");
      setWeekdayPrice(weekday ? String(weekday.price) : "");
      setWeekendPrice(weekend ? String(weekend.price) : "");
      setLoadState("ready");
    } catch (err) {
      setLoadError(toApiUiError(err, "We could not load this service.").message);
      setLoadState("error");
    }
  }, [serviceId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!changingCategory || categories.length > 0) return;
    getCategories().then((cats) => setCategories(Array.isArray(cats) ? cats : [])).catch(() => setCategories([]));
  }, [changingCategory, categories.length]);

  useEffect(() => {
    if (!categoryId) { setSubcategories([]); return; }
    getSubcategories(categoryId).then((subs) => setSubcategories(Array.isArray(subs) ? subs : [])).catch(() => setSubcategories([]));
  }, [categoryId]);

  const isFormValid = name.trim().length >= 3 && Number(weekdayPrice) > 0 && description.trim().length >= 10;

  const handleSave = async () => {
    if (!service) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateService(service.id, {
        name: name.trim(),
        description: description.trim(),
        capacity: Number(capacity),
        isAvailable,
        ...(subcategoryId ? { subcategoryId } : {}),
        // Only send addresses if location was actually filled in — CreateAddressDto
        // requires city/state/street/postalCode, so a half-empty address would fail.
        ...(city.trim() && state.trim() && street.trim() && postalCode.trim()
          ? { addresses: [{ street: street.trim(), city: city.trim(), state: state.trim(), postalCode: postalCode.trim(), country: "India", isPrimary: true }] }
          : {}),
        prices: [
          { price: Number(weekdayPrice), dayType: "weekday" },
          ...(weekendPrice ? [{ price: Number(weekendPrice), dayType: "weekend" }] : []),
        ],
      });
      router.push(`/${params.lang}/vendor/services`);
    } catch (err) {
      setSaveError(toApiUiError(err, "We could not save these changes.").message);
    } finally {
      setSaving(false);
    }
  };

  if (loadState === "loading") return <Loading />;

  if (loadState === "error") {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <p className="text-sm text-red-600 mb-4">{loadError}</p>
        <Button onClick={load} variant="outline" className="h-11 px-6 rounded-xl text-xs font-bold">Try again</Button>
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="min-h-screen bg-white pb-32">
      <main className="max-w-2xl mx-auto px-6">
        <button onClick={() => router.back()} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-6">
          ← Back
        </button>

        {/* Sticky (not fixed) so it never fights the global site header's stacking. */}
        <div className="sticky top-0 z-10 -mx-6 px-6 py-3 mb-6 bg-white/90 backdrop-blur-xl border-b border-slate-50">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {(["details", "location", "pricing", "description"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold capitalize transition-all border-2 ${
                  tab === t ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-100 text-slate-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-3">{service.name}</h1>
          <div className="flex flex-wrap gap-2">
            {subcategoryName && (
              <span className="px-3 py-1.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">{subcategoryName}</span>
            )}
            <button
              onClick={() => setIsAvailable((v) => !v)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${
                isAvailable ? "bg-emerald-500 text-white" : "bg-slate-900 text-white"
              }`}
            >
              {isAvailable ? "Active — tap to deactivate" : "Inactive — tap to activate"}
            </button>
          </div>
        </div>

        {saveError && <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 mb-6">{saveError}</p>}

        <div className="space-y-8">
          {tab === "details" && (
            <div className="space-y-8 animate-fade-in">
              <Input label="Service name" name="name" value={name} onChange={(e) => setName(e.target.value)} />
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Capacity (guests)</label>
                <div className="flex flex-wrap gap-3">
                  {[1, 2, 4, 6, 8, 12].map((num) => (
                    <button
                      key={num}
                      onClick={() => setCapacity(num)}
                      className={`w-14 h-14 rounded-2xl text-base font-black transition-all active:scale-95 ${
                        capacity === num ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Category</label>
                {!changingCategory ? (
                  <button
                    type="button"
                    onClick={() => setChangingCategory(true)}
                    className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    {subcategoryName ? `${subcategoryName} — change` : "Choose a category"}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategoryId(cat.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                            categoryId === cat.id ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                    {subcategories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {subcategories.map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => { setSubcategoryId(sub.id); setSubcategoryName(sub.name); setChangingCategory(false); }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                              subcategoryId === sub.id ? "bg-emerald-500 text-white" : "bg-white border-2 border-slate-100 text-slate-500 hover:border-emerald-300"
                            }`}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "location" && (
            <div className="space-y-6 animate-fade-in">
              <Input label="Street / area" name="street" value={street} onChange={(e) => setStreet(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" name="city" value={city} onChange={(e) => setCity(e.target.value)} />
                <Input label="State" name="state" value={state} onChange={(e) => setState(e.target.value)} />
              </div>
              <Input label="Postal code" name="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            </div>
          )}

          {tab === "pricing" && (
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
              <Input label="Weekday price (₹)" name="weekdayPrice" type="number" value={weekdayPrice} onChange={(e) => setWeekdayPrice(e.target.value)} />
              <Input label="Weekend price (₹)" name="weekendPrice" type="number" value={weekendPrice} onChange={(e) => setWeekendPrice(e.target.value)} placeholder="Same as weekday" />
            </div>
          )}

          {tab === "description" && (
            <Textarea
              label="Description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              className="min-h-[300px]"
            />
          )}

          {saveError && <p role="alert" className="text-xs text-red-500 font-semibold mb-4">{saveError}</p>}

          {!isFormValid && (
            <p role="alert" className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-3.5 py-2 rounded-xl mb-4">
              ⚠️ Service name (min 3 chars), description (min 10 chars), and base weekday price are required.
            </p>
          )}

          <div className="pt-6 border-t border-slate-100 flex gap-4">
            <Button
              onClick={handleSave}
              disabled={saving || !isFormValid}
              className="flex-[2] h-16 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex-1 h-16 rounded-2xl border-2 border-slate-100 text-slate-400 font-bold text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
