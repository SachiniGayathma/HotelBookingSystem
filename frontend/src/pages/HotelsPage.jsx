import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  AMENITY_OPTIONS,
  getAllHotels,
  searchHotelsByAmenity,
  searchHotelsByCity,
} from "../services/hotelApi";

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

function resolveHotelId(hotel) {
  return hotel?.id || hotel?._id || "";
}

export default function HotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [amenityFilter, setAmenityFilter] = useState("");

  async function loadHotels() {
    try {
      setLoading(true);
      setError("");
      const response = await getAllHotels();
      setHotels(response.data);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "Failed to fetch hotels.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHotels();
  }, []);

  async function handleSearch(event) {
    event.preventDefault();
    setError("");

    try {
      setLoading(true);

      if (cityFilter.trim()) {
        const response = await searchHotelsByCity(cityFilter.trim());
        setHotels(response.data);
        return;
      }

      if (amenityFilter) {
        const response = await searchHotelsByAmenity(amenityFilter);
        setHotels(response.data);
        return;
      }

      await loadHotels();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  function resetFilters() {
    setCityFilter("");
    setAmenityFilter("");
    loadHotels();
  }

  return (
    <div className="min-h-screen bg-[#fff8f6] text-slate-900">
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10 lg:py-12">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rose-100 bg-white px-5 py-4 shadow-sm">
          <Link
            to="/"
            className="text-xl font-extrabold tracking-tight text-rose-500"
          >
            StayEase
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600">
            <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-600">
              Hotels
            </span>
            <Link
              to="/admin/hotels"
              className="rounded-full px-3 py-1 transition hover:bg-slate-100"
            >
              Admin
            </Link>
            <a
              href="/#support"
              className="rounded-full px-3 py-1 transition hover:bg-slate-100"
            >
              Support
            </a>
            <Link
              to="/history/user123"
              className="rounded-full px-3 py-1 transition hover:bg-slate-100"
            >
              View My Payments
            </Link>
            <Link
              to="/admin/analytics"
              className="rounded-full px-3 py-1 transition hover:bg-slate-100"
            >
              Analytics
            </Link>
          </nav>
        </header>

        <section className="mt-6 rounded-3xl border border-rose-100 bg-linear-to-br from-white via-rose-50 to-orange-50 p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">
                Hotel Listings
              </p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                Explore available stays across Sri Lanka
              </h1>
              <p className="mt-2 max-w-2xl text-slate-600">
                Search by city or amenity, compare verified properties, and
                continue to booking.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="mt-5 grid gap-3 rounded-2xl border border-rose-100 bg-white p-3 sm:grid-cols-[1fr_220px_auto_auto]"
          >
            <input
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value)}
              placeholder="Search by city"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-rose-300 transition focus:ring"
            />

            <select
              value={amenityFilter}
              onChange={(event) => setAmenityFilter(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-rose-300 transition focus:ring"
            >
              <option value="">Filter by amenity</option>
              {AMENITY_OPTIONS.map((amenity) => (
                <option key={amenity} value={amenity}>
                  {amenity}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Search
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Reset
            </button>
          </form>
        </section>

        {error ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <LoadingSpinner
              label="Loading hotels..."
              className="sm:col-span-2 lg:col-span-3"
            />
          ) : null}

          {!loading && hotels.length === 0 ? (
            <p className="text-sm text-slate-500">
              No hotels found for the current query.
            </p>
          ) : null}

          {hotels.map((hotel) => {
            const hotelId = resolveHotelId(hotel);

            return (
              <article
                key={hotelId || hotel.hotelCode || hotel.name}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {hotelId ? (
                  <Link
                    to={`/hotels/${hotelId}`}
                    aria-label={`View details for ${hotel.name}`}
                    className="absolute inset-0 z-0"
                  />
                ) : null}
                <div className="relative z-10">
                  <div
                    className="h-52 w-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${hotel.images?.[0] || "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80"})`,
                    }}
                  />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-lg font-bold leading-tight">
                        {hotel.name}
                      </h2>
                      <p className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {hotel.hotelCode}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{hotel.city}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      {hotel.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(hotel.amenities ?? []).length ? (
                        (hotel.amenities ?? []).map((amenity) => (
                          <span
                            key={amenity}
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${amenityClassName(amenity)}`}
                          >
                            {amenity}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
                          No amenities listed
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {hotelId ? (
                        <Link
                          to={`/hotels/${hotelId}`}
                          onClick={(event) => event.stopPropagation()}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-center text-xs font-semibold text-rose-700"
                        >
                          More info
                        </Link>
                      ) : (
                        <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-semibold text-slate-500">
                          Info unavailable
                        </span>
                      )}
                      <Link
                        to={`/booking/${hotelId}`}
                        onClick={(event) => event.stopPropagation()}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-700"
                      >
                        Book now
                      </Link>
                    </div>

                    <Link
                      to={`/hotels/${hotelId}/add-review`}
                      onClick={(event) => event.stopPropagation()}
                      className="mt-2 block rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-700"
                    >
                      Leave a review
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
