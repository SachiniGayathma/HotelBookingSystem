import { useMemo, useRef, useState } from "react";
import { AMENITY_OPTIONS } from "../../services/hotelApi";

function parseCsvList(csvText) {
  return csvText
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function amenitiesFromInitial(initialHotel) {
  return new Set(initialHotel?.amenities ?? []);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

export default function HotelForm({
  title,
  submitLabel,
  initialHotel,
  onSubmit,
  isSubmitting,
  error,
}) {
  const [name, setName] = useState(initialHotel?.name ?? "");
  const [city, setCity] = useState(initialHotel?.city ?? "");
  const [address, setAddress] = useState(initialHotel?.address ?? "");
  const [latitude, setLatitude] = useState(initialHotel?.latitude ?? "");
  const [longitude, setLongitude] = useState(initialHotel?.longitude ?? "");
  const [description, setDescription] = useState(
    initialHotel?.description ?? "",
  );
  const fileInputRef = useRef(null);
  const [imagesCsv, setImagesCsv] = useState(
    (initialHotel?.images ?? []).join(", "),
  );
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState(
    amenitiesFromInitial(initialHotel),
  );

  const formValid = useMemo(
    () => name.trim() && city.trim() && address.trim() && description.trim(),
    [name, city, address, description],
  );

  function toggleAmenity(amenity) {
    setSelectedAmenities((previous) => {
      const next = new Set(previous);
      if (next.has(amenity)) {
        next.delete(amenity);
      } else {
        next.add(amenity);
      }
      return next;
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      name: name.trim(),
      city: city.trim(),
      address: address.trim(),
      latitude: Number(latitude) || 0,
      longitude: Number(longitude) || 0,
      description: description.trim(),
      amenities: Array.from(selectedAmenities),
      images: [
        ...parseCsvList(imagesCsv),
        ...uploadedImages.map((item) => item.src),
      ],
      rooms: initialHotel?.rooms ?? [],
    };

    onSubmit(payload);
  }

  async function handleImageFileSelection(event) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    try {
      setUploadError("");

      const imageFiles = files.filter((file) =>
        SUPPORTED_IMAGE_TYPES.includes((file.type || "").toLowerCase()),
      );

      if (!imageFiles.length) {
        setUploadError(
          "Please choose JPG, PNG, WEBP, or GIF images. AVIF/HEIC may not display in all browsers.",
        );
        return;
      }

      const dataUrls = await Promise.all(imageFiles.map(fileToDataUrl));
      const nextImages = dataUrls.map((src, index) => ({
        src,
        name: imageFiles[index].name,
      }));

      setUploadedImages((previous) => [...previous, ...nextImages]);
    } catch {
      setUploadError("Failed to read selected image files.");
    } finally {
      event.target.value = "";
    }
  }

  function removeUploadedImage(indexToRemove) {
    setUploadedImages((previous) =>
      previous.filter((_, index) => index !== indexToRemove),
    );
  }

  return (
    <section className="rounded-3xl border border-rose-200/70 bg-gradient-to-b from-white to-rose-50/40 p-6 shadow-[0_20px_60px_-35px_rgba(225,29,72,0.45)] sm:p-8">
      <h1 className="text-2xl font-black text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">
        Fields marked * are required.
      </p>

      {error ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Hotel Name *
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none ring-rose-300 transition focus:border-rose-300 focus:ring"
              placeholder="e.g., Cinnamon Lakeside"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            City *
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none ring-rose-300 transition focus:border-rose-300 focus:ring"
              placeholder="e.g., Colombo"
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Address *
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none ring-rose-300 transition focus:border-rose-300 focus:ring"
            placeholder="Street and number"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Latitude
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none ring-rose-300 transition focus:border-rose-300 focus:ring"
              placeholder="6.9271"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Longitude
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none ring-rose-300 transition focus:border-rose-300 focus:ring"
              placeholder="79.8612"
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Description *
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none ring-rose-300 transition focus:border-rose-300 focus:ring"
            placeholder="Describe rooms, neighborhood, and unique value"
          />
        </label>

        <div className="grid gap-2 text-sm font-medium text-slate-700">
          <span>Upload Images</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleImageFileSelection}
            className="sr-only"
          />

          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-rose-300 bg-rose-50/60 px-3 py-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-rose-700 transition hover:bg-rose-100"
            >
              Choose Images
            </button>

            <p className="text-xs font-medium text-slate-600">
              {uploadedImages.length
                ? `${uploadedImages.length} file(s) selected`
                : "No files selected yet"}
            </p>
          </div>

          <span className="text-xs font-normal text-slate-500">
            Select one or more images from your file explorer.
          </span>
        </div>

        {uploadError ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {uploadError}
          </p>
        ) : null}

        {uploadedImages.length ? (
          <div className="grid gap-2">
            <p className="text-sm font-medium text-slate-700">
              Selected images
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {uploadedImages.map((image, index) => (
                <div
                  key={`${image.src.slice(0, 24)}-${index}`}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                >
                  <img
                    src={image.src}
                    alt={`Selected upload ${index + 1}`}
                    className="h-24 w-full object-cover"
                  />
                  <p
                    className="truncate border-t border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-500"
                    title={image.name}
                  >
                    {image.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeUploadedImage(index)}
                    className="w-full border-t border-slate-200 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Images (comma separated URLs)
          <textarea
            rows={2}
            value={imagesCsv}
            onChange={(e) => setImagesCsv(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none ring-rose-300 transition focus:border-rose-300 focus:ring"
            placeholder="https://..., https://..."
          />
          <span className="text-xs font-normal text-slate-500">
            Optional: you can still paste URL links here.
          </span>
        </label>

        <div className="grid gap-2">
          <p className="text-sm font-medium text-slate-700">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {AMENITY_OPTIONS.map((amenity) => {
              const checked = selectedAmenities.has(amenity);
              return (
                <button
                  type="button"
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    checked
                      ? "border-rose-300 bg-rose-100 text-rose-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  {amenity}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={!formValid || isSubmitting}
          className="mt-2 inline-flex items-center justify-center rounded-xl bg-rose-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </form>
    </section>
  );
}
