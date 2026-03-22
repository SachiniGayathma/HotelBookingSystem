import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getHotelById } from "../services/hotelApi";
import LoadingSpinner from "../components/LoadingSpinner";
import axios from "axios";

const AMENITY_STYLES = {
  WIFI: "bg-sky-100 text-sky-700 border-sky-200",
  POOL: "bg-cyan-100 text-cyan-700 border-cyan-200",
  PARKING: "bg-slate-100 text-slate-700 border-slate-200",
  RESTAURANT: "bg-orange-100 text-orange-700 border-orange-200",
  GYM: "bg-violet-100 text-violet-700 border-violet-200",
  SPA: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

function amenityClassName(amenity) {
  return AMENITY_STYLES[amenity] ?? "bg-rose-100 text-rose-700 border-rose-200";
}

function getAvailabilityTone(availableRooms) {
  if (availableRooms > 5) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (availableRooms > 0) {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-rose-100 text-rose-700";
}

export default function CustomerHotelDetailsPage() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const hotelImages = hotel?.images?.length
    ? hotel.images
    : [
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1500&q=80",
      ];

/* --- REVIEWS ADDITION START --- */
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    const fetchAvgRating = async () => {
      try {
        const res = await axios.get(`http://localhost:8084/reviews/hotel/${id}`);
        if (res.data.length > 0) {
          const sum = res.data.reduce((acc, rev) => acc + rev.rating, 0);
          setAvgRating((sum / res.data.length).toFixed(1));
        }
      } catch (err) { console.error("Rating error", err); }
    };
    fetchAvgRating();
  }, [id]);
  /* --- REVIEWS ADDITION END --- */

  const rooms = hotel?.rooms ?? [];
  const latitude = Number(hotel?.latitude);
  const longitude = Number(hotel?.longitude);
  const hasCoordinates =
    Number.isFinite(latitude) && Number.isFinite(longitude);
  const mapEmbedUrl = hasCoordinates
    ? `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`
    : "";
  const mapLink = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : "";

  const stats = useMemo(() => {
    if (!rooms.length) {
      return {
        roomTypes: 0,
        availableNow: 0,
        totalInventory: 0,
        fromPrice: null,
      };
    }

    const fromPrice = rooms.reduce((lowest, room) => {
      if (typeof room.pricePerNight !== "number") {
        return lowest;
      }

      if (lowest === null || room.pricePerNight < lowest) {
        return room.pricePerNight;
      }

      return lowest;
    }, null);

    return {
      roomTypes: rooms.length,
      availableNow: rooms.reduce(
        (sum, room) => sum + (Number(room.availableRooms) || 0),
        0,
      ),
      totalInventory: rooms.reduce(
        (sum, room) => sum + (Number(room.totalRooms) || 0),
        0,
      ),
      fromPrice,
    };
  }, [rooms]);

  async function loadHotel() {
    try {
      setLoading(true);
      setError("");
      const response = await getHotelById(id);
      setHotel(response.data);
      setActiveImageIndex(0);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Failed to load hotel information.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHotel();
  }, [id]);

  function showPreviousImage() {
    setActiveImageIndex((previous) =>
      previous === 0 ? hotelImages.length - 1 : previous - 1,
    );
  }

  function showNextImage() {
    setActiveImageIndex((previous) =>
      previous === hotelImages.length - 1 ? 0 : previous + 1,
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#ffe5db_0%,_#fff8f6_40%,_#fff_100%)] text-slate-900">
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10 lg:py-12">
        <header className="rounded-2xl border border-rose-200/70 bg-white/90 px-5 py-4 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/hotels"
              className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              Back to hotels
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/booking/${id}`}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Book now
              </Link>
              <Link
                to={`/hotels/${id}/reviews`}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Reviews & Ratings
              </Link>
            </div>
          </div>
        </header>

        {loading ? (
          <LoadingSpinner label="Loading hotel details..." className="mt-6" />
        ) : null}

        {!loading && error ? (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {!loading && hotel ? (
          <>
            <section className="mt-6 overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-sm">
              <div className="relative h-64 sm:h-80">
                <img
                  src={hotelImages[activeImageIndex]}
                  alt={`${hotel.name} image ${activeImageIndex + 1}`}
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />
                <p className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white">
                  {activeImageIndex + 1}/{hotelImages.length}
                </p>

                {hotelImages.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={showPreviousImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-black/45 px-3 py-2 text-sm font-bold text-white transition hover:bg-black/60"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={showNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-black/45 px-3 py-2 text-sm font-bold text-white transition hover:bg-black/60"
                    >
                      Next
                    </button>

                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/35 px-3 py-1">
                      {hotelImages.map((image, index) => (
                        <button
                          key={`${image.slice(0, 24)}-${index}`}
                          type="button"
                          onClick={() => setActiveImageIndex(index)}
                          className={`h-2.5 w-2.5 rounded-full ${
                            index === activeImageIndex
                              ? "bg-white"
                              : "bg-white/50"
                          }`}
                          aria-label={`Go to image ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
              <div className="p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                  {hotel.hotelCode || "Hotel"}
                </p>
                <h1 className="mt-2 text-3xl font-black sm:text-4xl flex items-center justify-between gap-4">
                  <span>{hotel.name}</span>
                  
                  {/* --- REVIEWS ADDITION START --- */}
                  {avgRating > 0 && (
                    <span className="flex items-center gap-1.5 text-lg font-bold text-amber-600 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200 shadow-sm">
                      {/* Razor-sharp SVG Star instead of emoji */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-amber-500">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {avgRating}
                    </span>
                  )}
                  {/* --- REVIEWS ADDITION END --- */}
                </h1>
                
                <p className="mt-2 text-sm text-slate-600">
                  {hotel.city} - {hotel.address}
                </p>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-700">
                  {hotel.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {(hotel.amenities ?? []).map((amenity) => (
                    <span
                      key={amenity}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${amenityClassName(amenity)}`}
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <article className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-rose-50/30 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  From price
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {stats.fromPrice === null ? "N/A" : `$${stats.fromPrice}`}
                </p>
                <p className="mt-1 text-xs text-slate-500">Per night</p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-sky-50/30 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Room types
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {stats.roomTypes}
                </p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-emerald-50/30 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Available now
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {stats.availableNow}
                </p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-amber-50/30 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total rooms
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {stats.totalInventory}
                </p>
              </article>
            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
              <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="text-xl font-black text-slate-900">
                    Location Map
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Based on the hotel latitude and longitude.
                  </p>
                </div>

                {hasCoordinates ? (
                  <iframe
                    title="Hotel location map"
                    src={mapEmbedUrl}
                    className="h-72 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="px-5 py-6 text-sm text-slate-600">
                    No location coordinates were provided for this hotel.
                  </div>
                )}
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black text-slate-900">
                  Location Details
                </h2>
                <div className="mt-4 grid gap-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Latitude
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {hasCoordinates ? latitude : "N/A"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Longitude
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {hasCoordinates ? longitude : "N/A"}
                    </p>
                  </div>

                  {hasCoordinates ? (
                    <a
                      href={mapLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Open in Maps
                    </a>
                  ) : null}
                </div>
              </article>
            </section>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-black">Room details</h2>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Live availability from service
                </p>
              </div>

              {rooms.length === 0 ? (
                <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Room information has not been added for this hotel yet.
                </p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Room type</th>
                        <th className="px-4 py-3 font-semibold">
                          Price / Night
                        </th>
                        <th className="px-4 py-3 font-semibold">Total rooms</th>
                        <th className="px-4 py-3 font-semibold">Available</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map((room, index) => (
                        <tr
                          key={`${room.roomType}-${index}`}
                          className="border-t border-slate-100"
                        >
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {room.roomType}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            ${room.pricePerNight}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {room.totalRooms}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-semibold ${getAvailabilityTone(room.availableRooms)}`}
                            >
                              {room.availableRooms}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}