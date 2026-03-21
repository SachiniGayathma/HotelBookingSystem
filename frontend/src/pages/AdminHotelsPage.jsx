import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  AMENITY_OPTIONS,
  deleteHotel,
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

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
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
    setMessage("");
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

  async function handleDelete(hotelId, hotelName) {
    const confirmed = window.confirm(`Delete hotel '${hotelName}'?`);
    if (!confirmed) {
      return;
    }

    try {
      setError("");
      await deleteHotel(hotelId);
      setHotels((previous) => previous.filter((hotel) => hotel.id !== hotelId));
      setMessage("Hotel deleted successfully.");
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "Failed to delete hotel.",
      );
    }
  }

  function resetFilters() {
    setCityFilter("");
    setAmenityFilter("");
    setMessage("");
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
            <Link
              to="/hotels"
              className="rounded-full px-3 py-1 transition hover:bg-slate-100"
            >
              Customer View
            </Link>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-600">
              Admin Hotels
            </span>
          </nav>
        </header>

        <section className="mt-6 rounded-3xl border border-rose-100 bg-gradient-to-br from-white via-rose-50 to-orange-50 p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">
                Admin Panel
              </p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                Manage hotels, rooms, and availability
              </h1>
              <p className="mt-2 max-w-2xl text-slate-600">
                Perform create, read, update, and delete operations directly
                against the hotel-service API.
              </p>
            </div>
            <Link
              to="/admin/hotels/new"
              className="inline-flex items-center justify-center rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-600"
            >
              + Add hotel
            </Link>
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

        {message ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

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
              No hotels found.
            </p>
          ) : null}

          {hotels.map((hotel) => (
            <article
              key={hotel.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
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
                  {(hotel.amenities ?? []).slice(0, 3).map((amenity) => (
                    <span
                      key={amenity}
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${amenityClassName(amenity)}`}
                    >
                      {amenity}
                    </span>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    to={`/admin/hotels/${hotel.id}`}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-700"
                  >
                    View
                  </Link>
                  <Link
                    to={`/admin/hotels/${hotel.id}/edit`}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-center text-xs font-semibold text-rose-700"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(hotel.id, hotel.name)}
                    className="col-span-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
