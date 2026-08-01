"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { sanitizePhone, isValidPhone, PHONE_LENGTH } from "@/utils/validation";
import { toApiUiError } from "@/utils/apiErrors";
import { createVendor, createPointOfContact } from "@/services/vendorService";
import { uploadMedia, deleteMedia, validateImage, type UploadedMedia } from "@/services/mediaService";
import Typography from "../../components/atoms/Typography";
import Button from "../../components/atoms/Button";
import Input from "../../components/atoms/Input";
import Textarea from "../../components/atoms/Textarea";

// ─── Icon system — same inline-stroke-SVG convention used across the app ───

type IconName = "home" | "utensils" | "car" | "mountain" | "check" | "upload" | "file" | "trash" | "user" | "phone" | "mail";

const ICON_PATHS: Record<IconName, React.ReactNode> = {
  home: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></>,
  utensils: <><path d="M3 2v7c0 1.1.9 2 2 2s2-.9 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></>,
  car: <><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" /><circle cx="6.5" cy="16.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" /></>,
  mountain: <path d="m8 3 4 8 5-5 5 15H2L8 3z" />,
  check: <path d="M20 6 9 17l-5-5" />,
  upload: <><path d="M12 3v12" /><path d="m7 8 5-5 5 5" /><path d="M5 21h14" /></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>,
  trash: <><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></>,
  user: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
  mail: <><path d="m22 6-10 7L2 6" /><path d="M2 6h20v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" /></>,
};

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">
      {ICON_PATHS[name]}
    </svg>
  );
}

// ─── Real, backend-supported data only ──────────────────────────────────────
// Vendor.types is a Postgres enum (backend/src/feature/vendor/enums/vendor-type.ts):
// hotel | restaurant | transport | adventure. Not a fetched list, but not
// invented either — this is the actual enum, mirrored 1:1.

type VendorType = "hotel" | "restaurant" | "transport" | "adventure";

const CATEGORY_OPTIONS: { id: VendorType; label: string; icon: IconName; hint: string; color: "indigo" | "emerald" | "blue" | "amber" }[] = [
  { id: "hotel", label: "Stay", icon: "home", hint: "Mention room types, amenities and check-in details.", color: "indigo" },
  { id: "adventure", label: "Activities", icon: "mountain", hint: "Mention activity types, duration and group size.", color: "emerald" },
  { id: "transport", label: "Transport", icon: "car", hint: "Mention vehicle types, capacity and the routes you cover.", color: "blue" },
  { id: "restaurant", label: "Food", icon: "utensils", hint: "Mention cuisine, meal types and seating capacity.", color: "amber" },
];

// Matches app/[lang]/builder/components/ServiceInterestSelector.tsx's palette exactly.
const CATEGORY_COLORS = {
  indigo: { border: "border-indigo-500", shadow: "shadow-indigo-100", bg: "bg-indigo-500" },
  emerald: { border: "border-emerald-500", shadow: "shadow-emerald-100", bg: "bg-emerald-500" },
  blue: { border: "border-blue-500", shadow: "shadow-blue-100", bg: "bg-blue-500" },
  amber: { border: "border-amber-500", shadow: "shadow-amber-100", bg: "bg-amber-500" },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type DocEntry = UploadedMedia & { label: string; uploading?: boolean };

const TOTAL_STEPS = 5;
const STEP_LABELS = ["Basic info", "Category", "About", "Documents", "Review"];

export default function VendorOnboardingPage() {
  const { lang } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // Step 1 — basic info
  const [contactName, setContactName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");

  // Step 2 — category
  const [types, setTypes] = useState<VendorType[]>([]);

  // Step 3 — description
  const [description, setDescription] = useState("");

  // Step 4 — documents
  const [documents, setDocuments] = useState<DocEntry[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdVendorId, setCreatedVendorId] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (user?.phone && !phone) setPhone(user.phone);
    if (user?.email && !email) setEmail(user.email);
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const markTouched = (field: string) => setTouched((t) => ({ ...t, [field]: true }));

  const errors = {
    contactName: contactName.trim().length < 1 ? "Your name is required." : undefined,
    businessName: businessName.trim().length < 1 ? "Business name is required." : undefined,
    phone: !isValidPhone(phone) ? `Enter a valid ${PHONE_LENGTH}-digit mobile number.` : undefined,
    email: email.trim().length > 0 && !EMAIL_RE.test(email) ? "Enter a valid email address." : undefined,
    types: types.length === 0 ? "Select at least one category." : undefined,
    description: description.trim().length < 10 ? "Add a few more words (at least 10 characters)." : undefined,
  };

  const isStepValid = (s: number) => {
    switch (s) {
      case 1: return !errors.contactName && !errors.businessName && !errors.phone && !errors.email;
      case 2: return !errors.types;
      case 3: return !errors.description;
      case 4: return true; // documents are optional
      case 5: return true;
      default: return false;
    }
  };

  const toggleType = (t: VendorType) => {
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const handleNext = () => {
    if (step === 1) setTouched((t) => ({ ...t, contactName: true, businessName: true, phone: true, email: true }));
    if (step === 3) setTouched((t) => ({ ...t, description: true }));
    if (!isStepValid(step)) return;
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  // ─── Documents ─────────────────────────────────────────────────────────

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    for (const file of Array.from(files)) {
      const validationError = validateImage(file);
      if (validationError) {
        setUploadError(validationError);
        continue;
      }
      const tempLabel = file.name.replace(/\.[^.]+$/, "");
      const placeholder: DocEntry = { key: `pending-${Date.now()}-${tempLabel}`, url: "", label: tempLabel, uploading: true };
      setDocuments((prev) => [...prev, placeholder]);
      try {
        const uploaded = await uploadMedia(file, "vendor-documents");
        setDocuments((prev) => prev.map((d) => (d.key === placeholder.key ? { ...uploaded, label: tempLabel } : d)));
      } catch {
        setUploadError("Upload failed. Please try that file again.");
        setDocuments((prev) => prev.filter((d) => d.key !== placeholder.key));
      }
    }
  };

  const removeDocument = async (doc: DocEntry) => {
    setDocuments((prev) => prev.filter((d) => d.key !== doc.key));
    if (!doc.uploading && doc.url) {
      try { await deleteMedia(doc.key); } catch { /* already removed from the list either way */ }
    }
  };

  // ─── Submit ────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // If the vendor was already created on a previous failed attempt, don't
      // create a second one — only retry the point-of-contact step.
      let vendorId = createdVendorId;
      if (!vendorId) {
        const documentsMap = documents.reduce<Record<string, string>>((acc, d) => {
          if (d.url) acc[d.label || d.key] = d.url;
          return acc;
        }, {});
        const vendor = await createVendor({
          businessName: businessName.trim(),
          description: description.trim(),
          types,
          ...(Object.keys(documentsMap).length > 0 ? { documents: documentsMap } : {}),
        });
        vendorId = vendor?.id;
        if (!vendorId) throw new Error("Vendor was created but no id was returned.");
        setCreatedVendorId(vendorId);
      }

      await createPointOfContact({
        vendorId,
        name: contactName.trim(),
        phone,
        ...(email.trim() ? { email: email.trim() } : {}),
      });

      // No backend link between a logged-in user and their vendor record yet
      // (see final report) — this is the pragmatic bridge so the dashboard
      // can show the vendor that was *just* created in this session.
      try { window.localStorage.setItem("vendorId", vendorId); } catch { /* storage unavailable — non-fatal */ }

      router.replace(`/${lang}/vendor/onboarding/confirmation`);
    } catch (err) {
      const ui = toApiUiError(err, "We could not submit your application. Review the highlighted fields and try again.");
      setSubmitError(ui.message);
    } finally {
      isSubmittingRef.current = false;
      setSubmitting(false);
    }
  }, [createdVendorId, documents, businessName, description, types, contactName, phone, email, lang, router]);

  // ─── Step content ──────────────────────────────────────────────────────
  // The step number + title live in the progress indicator (below), so each
  // step only needs a short instruction where the fields alone aren't
  // self-explanatory — no repeated per-step headline.

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div key={step} className="animate-fade-in space-y-5">
            <Input
              label="Your name"
              name="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              onBlur={() => markTouched("contactName")}
              placeholder="e.g. Priya Sharma"
              autoFocus
              error={touched.contactName ? errors.contactName : undefined}
            />
            <Input
              label="Business or provider name"
              name="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              onBlur={() => markTouched("businessName")}
              placeholder="e.g. Everest Travels"
              error={touched.businessName ? errors.businessName : undefined}
            />
            <div>
              <label htmlFor="phone" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2">Mobile number</label>
              <div className={`w-full border-2 rounded-2xl flex items-center bg-slate-50/50 transition-all ${touched.phone && errors.phone ? "border-red-300" : "border-slate-100/50 focus-within:border-slate-900 focus-within:bg-white"}`}>
                <span className="pl-5 pr-3 font-black text-slate-400 text-sm select-none border-r border-slate-200 h-6 flex items-center">+91</span>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={PHONE_LENGTH}
                  value={phone}
                  onChange={(e) => setPhone(sanitizePhone(e.target.value))}
                  onBlur={() => markTouched("phone")}
                  placeholder="00000 00000"
                  className="flex-1 h-full px-4 py-4 bg-transparent border-0 outline-none font-medium text-slate-900"
                />
              </div>
              {touched.phone && errors.phone && <p role="alert" className="text-xs text-red-500 mt-1.5 pl-2 animate-fade-in">{errors.phone}</p>}
            </div>
            <Input
              label="Email (optional)"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => markTouched("email")}
              placeholder="you@example.com"
              error={touched.email ? errors.email : undefined}
            />
          </div>
        );
      case 2:
        return (
          <div key={step} className="animate-fade-in">
            <p className="text-xs sm:text-sm text-slate-400 font-medium mb-4">Select every category you offer services in.</p>
            <div className="grid grid-cols-2 gap-4" role="group" aria-label="Vendor category">
              {CATEGORY_OPTIONS.map((opt) => {
                const selected = types.includes(opt.id);
                const colors = CATEGORY_COLORS[opt.color];
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleType(opt.id)}
                    aria-pressed={selected}
                    className={`relative h-32 sm:h-40 rounded-[1.5rem] sm:rounded-[2rem] border-2 transition-all p-4 sm:p-6 text-left flex flex-col justify-end group active:scale-95 overflow-hidden ${
                      selected ? `${colors.border} ${colors.shadow} shadow-xl bg-white` : "border-slate-50 hover:border-slate-200 shadow-md shadow-slate-100/50 bg-white"
                    }`}
                  >
                    <div className={`absolute -right-4 -top-4 w-24 sm:w-28 h-24 sm:h-28 rounded-full blur-2xl sm:blur-3xl opacity-10 transition-all duration-700 ${selected ? `${colors.bg} scale-150` : "bg-slate-200"}`} />
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 transition-all duration-500 relative z-10 ${
                      selected ? `${colors.bg} text-white shadow-lg rotate-3` : "bg-slate-50 text-slate-400 group-hover:scale-110 group-hover:rotate-6"
                    }`}>
                      {selected ? <Icon name="check" className="w-4 h-4 sm:w-5 sm:h-5" /> : <Icon name={opt.icon} className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </div>
                    <h3 className={`font-black text-sm sm:text-lg transition-colors z-10 leading-tight ${selected ? "text-slate-900" : "text-slate-600"}`}>
                      {opt.label}
                    </h3>
                  </button>
                );
              })}
            </div>
            {touched.types && errors.types && <p role="alert" className="text-xs text-red-500 pl-2 mt-3 animate-fade-in">{errors.types}</p>}
          </div>
        );
      case 3: {
        const activeHints = CATEGORY_OPTIONS.filter((c) => types.includes(c.id)).map((c) => c.hint);
        return (
          <div key={step} className="animate-fade-in">
            <div className="p-4 sm:p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100">
              <Textarea
                label="Describe your business"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => markTouched("description")}
                placeholder="What do you offer, and what makes it worth booking?"
                rows={6}
                className="!bg-transparent !border-0 !p-0 focus:!bg-transparent"
                error={touched.description ? errors.description : undefined}
              />
              {activeHints.length > 0 && !errors.description && (
                <ul className="space-y-1.5 pl-2 mt-4 pt-4 border-t border-slate-50">
                  {activeHints.map((h) => (
                    <li key={h} className="text-xs text-slate-400 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      }
      case 4:
        return (
          <div key={step} className="animate-fade-in">
            <p className="text-xs sm:text-sm text-slate-400 font-medium mb-4">Optional — you can add these later too.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={(e) => { handleFilesSelected(e.target.files); e.target.value = ""; }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-200 rounded-[2rem] py-10 sm:py-14 flex flex-col items-center gap-3 text-slate-400 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/30 transition-colors bg-white"
            >
              <span className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
                <Icon name="upload" className="w-6 h-6" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest">Upload ID proof or business licence (JPG, PNG, WebP)</span>
            </button>
            {uploadError && <p role="alert" className="text-xs text-red-500 pl-2 mt-3 animate-fade-in">{uploadError}</p>}

            {documents.length > 0 && (
              <ul className="space-y-2 mt-4">
                {documents.map((doc) => (
                  <li key={doc.key} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm animate-fade-in">
                    <span className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {doc.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={doc.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Icon name="file" className="w-4 h-4 text-slate-300" />
                      )}
                    </span>
                    <span className="flex-1 text-sm font-medium text-slate-700 truncate">{doc.label}</span>
                    {doc.uploading ? (
                      <span className="w-4 h-4 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin flex-shrink-0" />
                    ) : (
                      <button type="button" onClick={() => removeDocument(doc)} aria-label={`Remove ${doc.label}`} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      case 5:
        return (
          <div key={step} className="animate-fade-in">
            <div className="rounded-[2rem] border border-slate-100 bg-white shadow-sm divide-y divide-slate-100 overflow-hidden">
              <ReviewRow icon="user" label="Contact" value={contactName} />
              <ReviewRow icon="home" label="Business" value={businessName} />
              <ReviewRow icon="phone" label="Phone" value={`+91 ${phone}`} />
              {email && <ReviewRow icon="mail" label="Email" value={email} />}
              <ReviewRow
                icon="check"
                label="Categories"
                value={types.map((t) => CATEGORY_OPTIONS.find((c) => c.id === t)?.label || t).join(", ") || "—"}
              />
              <ReviewRow icon="file" label="Documents" value={documents.filter((d) => !d.uploading).length ? `${documents.filter((d) => !d.uploading).length} uploaded` : "None"} />
            </div>
            <div className="rounded-[2rem] border border-slate-100 bg-white shadow-sm p-5 sm:p-6 mt-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Description</p>
              <p className="text-sm text-slate-700 leading-relaxed line-clamp-4">{description}</p>
            </div>
            {submitError && (
              <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg py-2.5 px-3 mt-4 animate-fade-in">{submitError}</p>
            )}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div>
      {/* Small page heading + one-line supporting text — stays constant across every step. */}
      <header className="mb-6 sm:mb-8">
        <Typography variant="h1" className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
          Join <span className="text-emerald-500">Free.</span>
        </Typography>
        <p className="text-slate-400 font-medium mt-1 text-xs sm:text-sm">5 quick steps to start receiving bookings.</p>
      </header>

      {/* Step progress: number, title, and how many are left, above a segmented bar. */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-xs sm:text-sm font-black text-slate-900">
            Step {step}<span className="text-slate-300 font-bold"> / {TOTAL_STEPS}</span>
            <span className="ml-2 text-slate-500 font-bold">{STEP_LABELS[step - 1]}</span>
          </p>
          <p className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest">
            {step === TOTAL_STEPS ? "Last step" : `${TOTAL_STEPS - step} left`}
          </p>
        </div>
        <div className="flex gap-1.5 sm:gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i + 1 <= step ? "bg-slate-900" : "bg-slate-200"}`} />
          ))}
        </div>
      </div>

      {renderStep()}

      {isMounted && createPortal(
        <div className="builder-footer-safe-area fixed bottom-0 left-0 right-0 px-3 sm:px-6 pt-3 sm:pt-6 bg-white/90 backdrop-blur-xl border-t border-slate-100 z-50">
          <div className="max-w-2xl mx-auto px-2 sm:px-4 flex items-center justify-between gap-3 sm:gap-4">
            <Button variant="ghost" onClick={handleBack} className="w-fit px-6 sm:px-8 h-12 sm:h-16 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-100 text-[9px] sm:text-xs">
              {step === 1 ? "Exit" : "Back"}
            </Button>
            {step === TOTAL_STEPS ? (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 h-12 sm:h-16 rounded-xl sm:rounded-2xl text-sm sm:text-lg font-black tracking-[0.15em] sm:tracking-[0.2em] transition-all uppercase bg-slate-900 hover:bg-black text-white shadow-2xl active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span className="text-xs md:text-sm tracking-widest">Submitting…</span>
                  </div>
                ) : "Submit Application"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!isStepValid(step)}
                className="flex-1 h-12 sm:h-16 rounded-xl sm:rounded-2xl text-sm sm:text-lg font-black tracking-[0.15em] sm:tracking-[0.2em] transition-all uppercase bg-slate-900 hover:bg-black text-white shadow-2xl active:scale-[0.98] disabled:opacity-40"
              >
                Continue
              </Button>
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

function ReviewRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <span className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center flex-shrink-0">
        <Icon name={icon} className="w-4 h-4" />
      </span>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-24 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-slate-900 truncate">{value}</span>
    </div>
  );
}
