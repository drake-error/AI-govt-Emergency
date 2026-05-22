"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { MapPin, Camera, Tag, CheckCircle, ChevronRight, ChevronLeft, Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";

const MapView = dynamic(() => import("@/components/citizen/MapView"), { ssr: false });

const CATEGORIES = [
  { id: "pothole", icon: "🕳️", label: "Pothole" },
  { id: "road", icon: "🛣️", label: "Bad Road" },
  { id: "drainage", icon: "💧", label: "Drainage" },
  { id: "garbage", icon: "🗑️", label: "Garbage" },
  { id: "streetlight", icon: "💡", label: "Streetlight" },
  { id: "encroachment", icon: "🚧", label: "Encroachment" },
  { id: "water", icon: "🚿", label: "Water Supply" },
  { id: "toilet", icon: "🚻", label: "Public Toilet" },
  { id: "bridge", icon: "🌉", label: "Bridge/Path" },
  { id: "tree", icon: "🌳", label: "Tree Fall" },
];

const STEPS = ["Location", "Photo", "Details", "Submit"];

const SOUTH_INDIA_CITIES = [
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867 },
  { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673 },
  { name: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
  { name: "Kozhikode", state: "Kerala", lat: 11.2588, lng: 75.7804 },
  { name: "Vijayawada", state: "Andhra Pradesh", lat: 16.5062, lng: 80.6480 },
  { name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185 },
  { name: "Mysuru", state: "Karnataka", lat: 12.2958, lng: 76.6394 },
  { name: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198 },
  { name: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lng: 76.9366 },
  { name: "Mangaluru", state: "Karnataka", lat: 12.9141, lng: 74.8560 },
  { name: "Puducherry", state: "Puducherry", lat: 11.9416, lng: 79.8083 },
  { name: "Hubli", state: "Karnataka", lat: 15.3647, lng: 75.1240 },
  { name: "Warangal", state: "Telangana", lat: 17.9689, lng: 79.5941 },
];

export default function ReportPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState({ city: "", state: "", ward: "", street: "" });
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState<"minor" | "serious" | "critical" | "">("");
  const [description, setDescription] = useState("");
  const [lang, setLang] = useState("en-IN");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Address search via Nominatim
  const searchAddress = async (q: string) => {
    if (q.length < 3) { setSearchResults([]); return; }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + " India")}&format=json&limit=5&countrycodes=in`);
      const data = await res.json();
      setSearchResults(data);
    } catch { setSearchResults([]); }
  };

  const selectLocation = async (lat: number, lng: number) => {
    setPin({ lat, lng });
    // Reverse geocode
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await res.json();
      const addr = data.address || {};
      setAddress({
        city: addr.city || addr.town || addr.village || addr.county || "",
        state: addr.state || "",
        ward: addr.suburb || addr.neighbourhood || "",
        street: addr.road || addr.pedestrian || "",
      });
    } catch {}
  };

  // Upload photo
  const handleFileChange = async (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async () => {
    if (!imageFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", imageFile);
      const res = await fetch("/api/citizen/upload", { method: "POST", body: fd });
      const data = await res.json();
      setImageUrl(data.url || imagePreview);
    } catch {
      setImageUrl(imagePreview);
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!pin || !category || !severity) return;
    setSubmitting(true);
    try {
      const finalImageUrl = imageUrl || imagePreview || "";
      await fetch("/api/citizen/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: pin.lat, longitude: pin.lng,
          city: address.city, state: address.state,
          ward: address.ward, street: address.street,
          category, severity, description, image_url: finalImageUrl, lang,
        }),
      });
      setSubmitted(true);
    } catch {
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 text-center px-6">
      <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>
      <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Report Submitted! 🎉</h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
        Your civic issue in <strong>{address.city}</strong> has been logged. It will appear on the map shortly.
      </p>
      <div className="flex gap-3">
        <button onClick={() => router.push("/citizen-empowerment")} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-5 py-2.5 rounded-xl text-sm">
          View Map
        </button>
        <button onClick={() => { setStep(0); setPin(null); setImageFile(null); setImagePreview(""); setImageUrl(""); setCategory(""); setSeverity(""); setDescription(""); setSubmitted(false); }}
          className="bg-green-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm">
          Report Another
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950">
      {/* Step indicator */}
      <div className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"}`} />
              {i < STEPS.length - 1 && <div className={`w-1.5 h-1.5 rounded-full mx-0.5 ${i < step ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          {STEPS.map((s, i) => (
            <span key={s} className={`text-[10px] font-bold ${i === step ? "text-green-600 dark:text-green-400" : "text-slate-400"}`}>{s}</span>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-hidden">
        {/* STEP 0: Location */}
        {step === 0 && (
          <div className="h-full flex flex-col">
            {/* Search bar */}
            <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search city or street in South India..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); searchAddress(e.target.value); }}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-400 outline-none"
                />
              </div>
              {/* Search results */}
              {searchResults.length > 0 && (
                <div className="mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 max-h-36 overflow-y-auto">
                  {searchResults.map((r, i) => (
                    <button key={i} onClick={() => { selectLocation(parseFloat(r.lat), parseFloat(r.lon)); setSearch(r.display_name.split(",")[0]); setSearchResults([]); }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-0">
                      📍 {r.display_name}
                    </button>
                  ))}
                </div>
              )}
              {/* Quick city buttons */}
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-none">
                {SOUTH_INDIA_CITIES.slice(0, 8).map((c) => (
                  <button key={c.name} onClick={() => selectLocation(c.lat, c.lng)}
                    className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 transition-colors">
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            {/* Map */}
            <div className="flex-1 relative">
              <MapView complaints={[]} onMapClick={selectLocation} draggablePin={pin || undefined} onPinMove={selectLocation} />
              {!pin && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/60 backdrop-blur text-white rounded-2xl px-4 py-3 text-center">
                    <MapPin className="w-6 h-6 mx-auto mb-1 text-green-400" />
                    <p className="text-sm font-bold">Tap the map to pin the issue location</p>
                    <p className="text-xs text-white/60 mt-0.5">or search above</p>
                  </div>
                </div>
              )}
            </div>
            {pin && (
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">📍 {address.street || "Selected location"}, {address.city}, {address.state}</p>
                <button onClick={() => setStep(1)} className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors">
                  Confirm Location <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 1: Photo */}
        {step === 1 && (
          <div className="h-full flex flex-col overflow-y-auto">
            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
              {imagePreview ? (
                <div className="relative w-full max-w-sm">
                  <img src={imagePreview} alt="Preview" className="w-full h-56 object-cover rounded-2xl shadow-lg" />
                  <button onClick={() => { setImageFile(null); setImagePreview(""); setImageUrl(""); }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow">✕</button>
                </div>
              ) : (
                <label className="w-full max-w-sm h-52 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors">
                  <Camera className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="font-bold text-slate-500 dark:text-slate-400">Tap to upload photo</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">JPG, PNG, WEBP</p>
                  <input type="file" accept="image/*" capture="environment" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileChange(f); }} />
                </label>
              )}
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-xs">
                A clear photo helps voters understand the severity. (Optional but recommended)
              </p>
            </div>
            <div className="p-3 flex gap-2 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
              <button onClick={() => setStep(0)} className="px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={async () => { if (imageFile && !imageUrl) await uploadPhoto(); setStep(2); }}
                disabled={uploading}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <>Next <ChevronRight className="w-5 h-5" /></>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Details */}
        {step === 2 && (
          <div className="h-full overflow-y-auto">
            <div className="p-4 space-y-5">
              {/* Category */}
              <div>
                <p className="font-black text-slate-700 dark:text-slate-200 text-sm mb-2">What type of issue?</p>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {CATEGORIES.map((c) => (
                    <button key={c.id} onClick={() => setCategory(c.id)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${category === c.id ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-slate-200 dark:border-slate-700 hover:border-slate-300"}`}>
                      <span className="text-2xl">{c.icon}</span>
                      <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 text-center leading-tight">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div>
                <p className="font-black text-slate-700 dark:text-slate-200 text-sm mb-2">How severe?</p>
                <div className="grid grid-cols-3 gap-2">
                  {[["minor","🟡","Minor","Small issue, inconvenient"],["serious","🟠","Serious","Significant impact on daily life"],["critical","🔴","Critical","Dangerous, needs urgent fix"]] .map(([val, icon, label, desc]) => (
                    <button key={val} onClick={() => setSeverity(val as any)}
                      className={`p-3 rounded-2xl border-2 text-left transition-all ${severity === val ? val === "critical" ? "border-red-500 bg-red-50 dark:bg-red-900/20" : val === "serious" ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20" : "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" : "border-slate-200 dark:border-slate-700"}`}>
                      <span className="text-xl block mb-1">{icon}</span>
                      <span className="font-black text-xs text-slate-700 dark:text-slate-200 block">{label}</span>
                      <span className="text-[9px] text-slate-400 leading-tight block">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="font-black text-slate-700 dark:text-slate-200 text-sm mb-2">Describe (optional)</p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Any additional details about this issue..."
                  rows={3}
                  className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-400 outline-none resize-none"
                />
              </div>
            </div>

            <div className="p-3 flex gap-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0">
              <button onClick={() => setStep(1)} className="px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => setStep(3)} disabled={!category || !severity}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-40">
                Review <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Submit */}
        {step === 3 && (
          <div className="h-full overflow-y-auto">
            <div className="p-4 space-y-4">
              <h3 className="font-black text-slate-800 dark:text-white text-lg">Review Your Report</h3>

              {imagePreview && (
                <img src={imagePreview} alt="Issue" className="w-full h-44 object-cover rounded-2xl shadow" />
              )}

              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{CATEGORIES.find(c => c.id === category)?.icon}</span>
                  <div>
                    <p className="font-black text-slate-800 dark:text-white capitalize">{category}</p>
                    <p className="text-xs text-slate-500">Category</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{severity === "critical" ? "🔴" : severity === "serious" ? "🟠" : "🟡"}</span>
                  <div>
                    <p className="font-black text-slate-800 dark:text-white capitalize">{severity}</p>
                    <p className="text-xs text-slate-500">Severity</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{address.street || "Selected Location"}</p>
                    <p className="text-xs text-slate-500">{address.ward ? `${address.ward}, ` : ""}{address.city}, {address.state}</p>
                  </div>
                </div>
                {description && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500 mb-1">Description</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 flex gap-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0">
              <button onClick={() => setStep(2)} className="px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={submit} disabled={submitting}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>🚀 Submit Report</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
