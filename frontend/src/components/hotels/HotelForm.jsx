import { useMemo, useState } from "react";
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
  const [imagesCsv, setImagesCsv] = useState(
    (initialHotel?.images ?? []).join(", "),
  );
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
      images: parseCsvList(imagesCsv),
      rooms: initialHotel?.rooms ?? [],
    };

    onSubmit(payload);
  }

  return (
    <section className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-black text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">
        Fields marked * are required.
      </p>

      {error ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Hotel Name *
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 outline-none ring-rose-300 transition focus:ring"
              placeholder="e.g., Cinnamon Lakeside"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            City *
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 outline-none ring-rose-300 transition focus:ring"
              placeholder="e.g., Colombo"
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Address *
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 outline-none ring-rose-300 transition focus:ring"
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
              className="rounded-xl border border-slate-200 px-3 py-2 outline-none ring-rose-300 transition focus:ring"
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
              className="rounded-xl border border-slate-200 px-3 py-2 outline-none ring-rose-300 transition focus:ring"
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
            className="rounded-xl border border-slate-200 px-3 py-2 outline-none ring-rose-300 transition focus:ring"
            placeholder="Describe rooms, neighborhood, and unique value"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Images (comma separated URLs)
          <textarea
            rows={2}
            value={imagesCsv}
            onChange={(e) => setImagesCsv(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 outline-none ring-rose-300 transition focus:ring"
            placeholder="https://..., https://..."
          />
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
                      ? "border-rose-200 bg-rose-100 text-rose-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
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
