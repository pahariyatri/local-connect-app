"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import Typography from "../../../components/atoms/Typography";
import Button from "../../../components/atoms/Button";
import Input from "../../../components/atoms/Input";
import Textarea from "../../../components/atoms/Textarea";
import LocationAutocomplete from "../../../components/molecules/LocationAutocomplete";
import { getMyVendor } from "@/services/vendorService";
import { getCategories, getSubcategories, createService } from "@/services/catalogService";
import MediaManager, { type MediaItem } from "../../../components/molecules/MediaManager";
import { toApiUiError } from "@/utils/apiErrors";
import Loading from "@/app/loading";
import { useTouchedFields } from "@/hooks/useTouchedFields";
import FieldError from "../../../components/atoms/FieldError";

// ─── Icon system — standard inline SVG ───

type IconName = "check" | "map-pin" | "users" | "tag" | "upload" | "trash" | "image" | "info" | "shield";

const ICON_PATHS: Record<IconName, React.ReactNode> = {
  check: <path d="M20 6 9 17l-5-5" />,
  "map-pin": <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  tag: <><path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.42 0l8.58-8.58a1 1 0 0 0 0-1.42Z" /><circle cx="7" cy="7" r="1" /></>,
  upload: <><path d="M12 3v12" /><path d="m7 8 5-5 5 5" /><path d="M5 21h14" /></>,
  trash: <><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></>,
  image: <><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></>,
  info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></>,
  shield: <><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></>,
};

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">
      {ICON_PATHS[name]}
    </svg>
  );
}

type Category = { id: number; name: string };

type PricingUnit = "PER_ROOM_NIGHT" | "PER_PERSON_NIGHT" | "PER_VEHICLE_TRIP" | "PER_PERSON_ACTIVITY" | "FIXED";

const PRICING_UNIT_OPTIONS: { id: PricingUnit; label: string; hint: string }[] = [
  { id: "PER_ROOM_NIGHT", label: "Per room, per night", hint: "Stays — capacity is guests included per room." },
  { id: "PER_PERSON_NIGHT", label: "Per person, per night", hint: "Multi-night stays priced per head, e.g. dorm beds." },
  { id: "PER_VEHICLE_TRIP", label: "Per vehicle / per trip", hint: "Taxis and transfers — one price per trip." },
  { id: "PER_PERSON_ACTIVITY", label: "Per person", hint: "Treks, activities, guided experiences." },
  { id: "FIXED", label: "Fixed price", hint: "One flat price regardless of guests, e.g. a set meal." },
];

function defaultsForCategory(categoryName: string | undefined): { unit: PricingUnit; capacityLabel: string; capacityHint: string } {
  const n = (categoryName || "").toLowerCase();
  if (/taxi|transport|cab|vehicle|car|bike/.test(n)) {
    return { unit: "PER_VEHICLE_TRIP", capacityLabel: "Seats", capacityHint: "How many passengers fit per trip" };
  }
  if (/food|restaurant|dining|meal|cafe/.test(n)) {
    return { unit: "FIXED", capacityLabel: "Covers", capacityHint: "How many guests you can seat at once" };
  }
  if (/adventure|activity|trek|guide|experience|tour/.test(n)) {
    return { unit: "PER_PERSON_ACTIVITY", capacityLabel: "Group size", capacityHint: "Maximum people per group/session" };
  }
  return { unit: "PER_ROOM_NIGHT", capacityLabel: "Guests", capacityHint: "Guests included per room at the base price" };
}

const TOTAL_STEPS = 5;
const STEP_LABELS = ["Basics", "Location", "Pricing & Unit", "Photos", "Review & Publish"];

type FieldName = "name" | "subcategoryId" | "description" | "city" | "state" | "street" | "postalCode" | "weekdayPrice" | "capacity";

const STEP_FIELDS: Record<number, FieldName[]> = {
  1: ["name", "subcategoryId", "description"],
  2: ["city", "state", "street", "postalCode"],
  3: ["weekdayPrice", "capacity"],
  4: [],
  5: [],
};

export default function NewServicePage() {
  const router = useRouter();
  const { lang } = useParams();

  const [vendorId, setVendorId] = useState<string | null>(null);
  const [resolvingVendor, setResolvingVendor] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getMyVendor()
      .then((vendor) => {
        if (cancelled) return;
        if (vendor?.id) {
          setVendorId(vendor.id);
          try { window.localStorage.setItem("vendorId", vendor.id); } catch { /* non-fatal */ }
        } else {
          setVendorId(null);
          try { window.localStorage.removeItem("vendorId"); } catch { /* non-fatal */ }
        }
      })
      .catch(() => {
        if (!cancelled) setVendorId(null);
      })
      .finally(() => { if (!cancelled) setResolvingVendor(false); });
    return () => { cancelled = true; };
  }, []);

  const [step, setStep] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then((cats) => setCategories(Array.isArray(cats) ? cats : []))
      .catch(() => setCategoriesError("We could not load categories."));
  }, []);

  // Step 1 — basics
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");

  useEffect(() => {
    if (!categoryId) { setSubcategories([]); setSubcategoryId(null); return; }
    getSubcategories(categoryId)
      .then((subs) => setSubcategories(Array.isArray(subs) ? subs : []))
      .catch(() => setSubcategories([]));

    const selectedCategory = categories.find((c) => c.id === categoryId);
    if (selectedCategory) {
      setPricingUnit(defaultsForCategory(selectedCategory.name).unit);
    }
  }, [categoryId, categories]);

  // Step 2 — location
  const [city, setCity] = useState("");
  const [state, setState] = useState("Himachal Pradesh");
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();

  // Step 3 — pricing unit & details
  const [pricingUnit, setPricingUnit] = useState<PricingUnit>("PER_ROOM_NIGHT");
  const [weekdayPrice, setWeekdayPrice] = useState("");
  const [weekendPrice, setWeekendPrice] = useState("");
  const [capacity, setCapacity] = useState("2");
  const [inclusionsText, setInclusionsText] = useState("");
  const [exclusionsText, setExclusionsText] = useState("");
  const [cancellationPolicy, setCancellationPolicy] = useState("");

  // Step 4 — Media / Photos: store {url, key} pairs so deletion can use the key
  const [images, setImages] = useState<MediaItem[]>([]);

  // Submission & Validation
  const { touched, markTouched, markAllTouched } = useTouchedFields<FieldName>();

  useEffect(() => {
    if (categoryId && subcategories.length > 0) markTouched("subcategoryId");
  }, [categoryId, subcategories.length, markTouched]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);

  const errors = {
    name: name.trim().length < 3 ? "Give this service a clear name (at least 3 characters)." : undefined,
    subcategoryId: !subcategoryId ? "Choose a category and sub-category." : undefined,
    description: description.trim().length < 10 ? "Add a detailed description (at least 10 characters)." : undefined,
    city: city.trim().length < 1 ? "City is required." : undefined,
    state: state.trim().length < 1 ? "State is required." : undefined,
    street: street.trim().length < 1 ? "Street or area is required." : undefined,
    postalCode: postalCode.trim().length < 1 ? "Postal code is required." : undefined,
    weekdayPrice: !weekdayPrice || Number(weekdayPrice) <= 0 ? "Enter a base price." : undefined,
    capacity: !capacity || Number(capacity) <= 0 ? "Enter a valid capacity." : undefined,
  };

  const isStepValid = (s: number) => {
    switch (s) {
      case 1: return !errors.name && !errors.subcategoryId && !errors.description;
      case 2: return !errors.city && !errors.state && !errors.street && !errors.postalCode;
      case 3: return !errors.weekdayPrice && !errors.capacity;
      case 4: return true;
      case 5: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    markAllTouched(STEP_FIELDS[step] ?? []);
    if (!isStepValid(step)) return;
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmittingRef.current || !vendorId || !subcategoryId) return;
    isSubmittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const prices = [
        { price: Number(weekdayPrice), dayType: "weekday" as const },
        ...(weekendPrice ? [{ price: Number(weekendPrice), dayType: "weekend" as const }] : []),
      ];

      const inclusionsList = inclusionsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const exclusionsList = exclusionsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      await createService(vendorId, {
        name: name.trim(),
        description: description.trim(),
        ...(shortDescription.trim() ? { shortDescription: shortDescription.trim() } : {}),
        isAvailable: true,
        subcategoryId,
        capacity: Number(capacity),
        pricingUnit,
        ...(images.length > 0 ? { thumbnail: images[0].url, images: images.map((i) => i.url) } : {}),
        ...(inclusionsList.length > 0 ? { inclusions: inclusionsList } : {}),
        ...(exclusionsList.length > 0 ? { exclusions: exclusionsList } : {}),
        ...(cancellationPolicy.trim() ? { cancellationPolicy: cancellationPolicy.trim() } : {}),
        addresses: [{
          name: street.trim(),
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: "India",
          ...(latitude !== undefined ? { latitude } : {}),
          ...(longitude !== undefined ? { longitude } : {}),
          isPrimary: true,
        }],
        prices,
      });
      router.replace(`/${lang}/vendor/services`);
    } catch (err) {
      const ui = toApiUiError(err, "We could not save this service. Review the highlighted fields and try again.");
      setSubmitError(ui.message);
    } finally {
      isSubmittingRef.current = false;
      setSubmitting(false);
    }
  }, [vendorId, subcategoryId, name, description, shortDescription, capacity, pricingUnit, images, inclusionsText, exclusionsText, cancellationPolicy, city, state, street, postalCode, latitude, longitude, weekdayPrice, weekendPrice, lang, router]);

  if (resolvingVendor) return <Loading />;

  if (vendorId === null) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <Typography variant="h1" className="text-2xl font-black text-slate-900 mb-2">No vendor profile yet</Typography>
        <p className="text-slate-400 text-sm mb-8">Complete vendor onboarding before adding services.</p>
        <Button onClick={() => router.push(`/${lang}/vendor/onboarding`)} className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-bold text-sm">Start onboarding</Button>
      </div>
    );
  }

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const categoryConfig = defaultsForCategory(selectedCategory?.name);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div key={step} className="animate-fade-in space-y-5">
            <Input
              label="Service name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => markTouched("name")}
              placeholder="e.g. Deluxe Riverside Room / Solang Valley Paragliding"
              autoFocus
              error={touched.name ? errors.name : undefined}
            />

            <Input
              label="One-line summary (optional)"
              name="shortDescription"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="e.g. Cozy wooden room with private balcony & river view"
            />

            {categoriesError && <p className="text-xs text-red-500">{categoriesError}</p>}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2">Category</label>
              <div className="grid grid-cols-2 gap-3" role="group" aria-label="Category">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    aria-pressed={categoryId === cat.id}
                    className={`h-14 rounded-2xl border-2 text-sm font-bold transition-all active:scale-95 ${
                      categoryId === cat.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-100 bg-slate-50/50 text-slate-600 hover:border-slate-200"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {categoryId && subcategories.length > 0 && (
              <div className="animate-fade-in">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2">Sub-category</label>
                <div className="flex flex-wrap gap-2">
                  {subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSubcategoryId(sub.id)}
                      aria-pressed={subcategoryId === sub.id}
                      className={`px-5 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                        subcategoryId === sub.id ? "bg-emerald-500 text-white" : "bg-white border-2 border-slate-100 text-slate-500 hover:border-emerald-300"
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
                <div className="mt-2"><FieldError message={touched.subcategoryId ? errors.subcategoryId : undefined} /></div>
              </div>
            )}

            <Textarea
              label="Detailed description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => markTouched("description")}
              placeholder="Describe your service in detail (amenities, location highlights, experience)..."
              rows={4}
              error={touched.description ? errors.description : undefined}
            />
          </div>
        );
      case 2:
        return (
          <div key={step} className="animate-fade-in space-y-5">
            <p className="text-xs text-slate-500 font-semibold flex items-center gap-2">
              <Icon name="map-pin" className="w-4 h-4 text-emerald-500" /> Search city for real location lookup & coordinates.
            </p>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2">
                City / Destination
              </label>
              <LocationAutocomplete
                name="city"
                value={city}
                onChange={(val) => {
                  setCity(val);
                  markTouched("city");
                }}
                onSelect={(loc) => {
                  setCity(loc.name);
                  // loc.latitude/longitude are `number | null` — many real
                  // locations in the system (e.g. Kasol) have no coordinates
                  // populated yet. Normalize null to undefined so the
                  // "Coordinates locked" summary below correctly hides
                  // itself instead of crashing on null.toFixed().
                  setLatitude(loc.latitude ?? undefined);
                  setLongitude(loc.longitude ?? undefined);
                  markTouched("city");
                }}
                placeholder="Search city (e.g. Manali, Kasol, Shimla)..."
              />
              <div className="mt-1"><FieldError message={touched.city ? errors.city : undefined} /></div>
            </div>

            <Input
              label="Street address / landmark"
              name="street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              onBlur={() => markTouched("street")}
              placeholder="e.g. Near Mall Road, Old Manali"
              error={touched.street ? errors.street : undefined}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="State"
                name="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                onBlur={() => markTouched("state")}
                placeholder="e.g. Himachal Pradesh"
                error={touched.state ? errors.state : undefined}
              />
              <Input
                label="Postal code"
                name="postalCode"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                onBlur={() => markTouched("postalCode")}
                placeholder="e.g. 175131"
                error={touched.postalCode ? errors.postalCode : undefined}
              />
            </div>

            {typeof latitude === "number" && typeof longitude === "number" && (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <Icon name="check" className="w-4 h-4 text-emerald-600" /> Coordinates locked: {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div key={step} className="animate-fade-in space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 flex items-center gap-2">
                <Icon name="tag" className="w-3.5 h-3.5" /> Pricing Model
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRICING_UNIT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPricingUnit(opt.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      pricingUnit === opt.id ? "border-slate-900 bg-slate-900 text-white shadow-md" : "border-slate-100 bg-slate-50/50 text-slate-700 hover:border-slate-200"
                    }`}
                  >
                    <div className="font-bold text-sm">{opt.label}</div>
                    <div className={`text-[11px] mt-1 ${pricingUnit === opt.id ? "text-slate-300" : "text-slate-400"}`}>{opt.hint}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Base / Weekday price (₹)" name="weekdayPrice" type="number" value={weekdayPrice} onChange={(e) => setWeekdayPrice(e.target.value)} onBlur={() => markTouched("weekdayPrice")} placeholder="1500" error={touched.weekdayPrice ? errors.weekdayPrice : undefined} />
              <Input label="Weekend price (₹, optional)" name="weekendPrice" type="number" value={weekendPrice} onChange={(e) => setWeekendPrice(e.target.value)} placeholder="Same as weekday" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-1 flex items-center gap-2">
                <Icon name="users" className="w-3.5 h-3.5" /> {categoryConfig.capacityLabel}
              </label>
              <p className="text-xs text-slate-400 font-medium pl-2 mb-2">{categoryConfig.capacityHint}</p>
              <div className="flex flex-wrap gap-3">
                {[1, 2, 4, 6, 8, 12].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => { setCapacity(String(num)); markTouched("capacity"); }}
                    className={`w-14 h-14 rounded-2xl text-base font-black transition-all active:scale-95 ${
                      capacity === String(num) ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="mt-2"><FieldError message={touched.capacity ? errors.capacity : undefined} /></div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <Textarea
                label="Inclusions (one item per line)"
                name="inclusions"
                value={inclusionsText}
                onChange={(e) => setInclusionsText(e.target.value)}
                placeholder="Breakfast included&#10;Free High Speed Wi-Fi&#10;Hot water 24/7"
                rows={3}
              />

              <Textarea
                label="Exclusions (optional, one item per line)"
                name="exclusions"
                value={exclusionsText}
                onChange={(e) => setExclusionsText(e.target.value)}
                placeholder="Personal laundry&#10;Adventure gear rental"
                rows={2}
              />

              <Textarea
                label="Cancellation policy (optional)"
                name="cancellationPolicy"
                value={cancellationPolicy}
                onChange={(e) => setCancellationPolicy(e.target.value)}
                placeholder="Full refund up to 48 hours before check-in/activity date."
                rows={2}
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div key={step} className="animate-fade-in space-y-6">
            <div>
              <Typography variant="h3" className="text-sm font-bold text-slate-900 mb-1">
                Listing Photos
              </Typography>
              <p className="text-xs text-slate-400 font-medium">
                Upload clear images of your property, vehicle, or activity. First image will be used as the cover photo.
              </p>
            </div>

            <MediaManager value={images} onChange={setImages} folder="service-images" label="" minWidth={480} minHeight={320} />
          </div>
        );
      case 5: {
        const subcategory = subcategories.find((s) => s.id === subcategoryId);
        const selectedPricingOpt = PRICING_UNIT_OPTIONS.find((p) => p.id === pricingUnit);
        return (
          <div key={step} className="animate-fade-in space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm space-y-4 divide-y divide-slate-100">
              <div className="pb-4">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-full tracking-wider">
                  {selectedCategory?.name || "Service"} › {subcategory?.name}
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-2">{name}</h3>
                {shortDescription && <p className="text-xs text-slate-500 font-medium mt-1 italic">{shortDescription}</p>}
              </div>

              <div className="pt-4 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Pricing Unit</span>
                  <span className="text-xs font-bold text-slate-800">{selectedPricingOpt?.label}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Base Rate</span>
                  <span className="text-sm font-black text-slate-900">₹{weekdayPrice}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Capacity</span>
                  <span className="text-xs font-bold text-slate-800">{capacity} {categoryConfig.capacityLabel.toLowerCase()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Location</span>
                  <span className="text-xs font-bold text-slate-800">{city}, {state}</span>
                </div>
              </div>

              {images.length > 0 && (
                <div className="pt-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Photos ({images.length})</span>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((item, i) => (
                      <div key={i} className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
              <Icon name="shield" className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-xs text-emerald-900 font-semibold leading-relaxed">
                Services start as <span className="font-bold">Pending Review</span> for quality control before appearing in public traveler search results.
              </p>
            </div>
          </div>
        );
      }
      default: return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-28">
      <div className="mb-10">
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-sm font-semibold text-slate-900">
            Step {step} of {TOTAL_STEPS}
            <span className="ml-2 text-slate-500 font-medium">{STEP_LABELS[step - 1]}</span>
          </p>
          <p className="text-xs font-medium text-slate-400">
            {step === TOTAL_STEPS ? "Last step" : `${TOTAL_STEPS - step} left`}
          </p>
        </div>
        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <Typography variant="h1" className="text-2xl font-black text-slate-900 mb-6">
        {STEP_LABELS[step - 1]}
      </Typography>

      {submitError && <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 mb-6">{submitError}</p>}

      {renderStep()}

      {isMounted && createPortal(
        <div className="fixed bottom-0 left-0 right-0 px-4 sm:px-6 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] bg-white/90 backdrop-blur-xl border-t border-slate-100 z-50">
          <div className="max-w-2xl mx-auto flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={handleBack} className="w-fit px-6 h-14 rounded-2xl font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-100 text-sm">
                {step === 1 ? "Cancel" : "Back"}
              </Button>
              {step === TOTAL_STEPS ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 h-14 rounded-2xl text-base font-black transition-all bg-slate-900 hover:bg-black text-white shadow-lg active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Publishing…</span>
                    </div>
                  ) : "Add & Publish Service"}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid(step)}
                  className="flex-1 h-14 rounded-2xl text-base font-black transition-all bg-slate-900 hover:bg-black text-white shadow-lg active:scale-[0.98] disabled:opacity-40"
                >
                  Continue
                </Button>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

