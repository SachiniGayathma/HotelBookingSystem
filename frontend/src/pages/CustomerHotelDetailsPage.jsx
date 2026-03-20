import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getHotelById } from "../services/hotelApi";

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

  const rooms = hotel?.rooms ?? [];

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

  return (
    <div className="min-h-screen bg-[#fff8f6] text-slate-900">
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10 lg:py-12">
        <header className="rounded-2xl border border-rose-100 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link to="/hotels" className="text-sm font-semibold text-rose-600">
              Back to hotels
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/pay"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Book now
              </Link>
              <Link
                to="/history/user123"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Payment history
              </Link>
            </div>
          </div>
        </header>

        {loading ? (
          <p className="mt-6 text-sm text-slate-500">
            Loading hotel details...
          </p>
        ) : null}

        {!loading && error ? (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {!loading && hotel ? (
          <>
            <section className="mt-6 overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-sm">
              <div
                className="h-64 bg-cover bg-center sm:h-80"
                style={{
                  backgroundImage: `url(${hotel.images?.[0] || "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1500&q=80"})`,
                }}
              />
              <div className="p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                  {hotel.hotelCode || "Hotel"}
                </p>
                <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                  {hotel.name}
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
                      className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  From price
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {stats.fromPrice === null ? "N/A" : `$${stats.fromPrice}`}
                </p>
                <p className="mt-1 text-xs text-slate-500">Per night</p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Room types
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {stats.roomTypes}
                </p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Available now
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {stats.availableNow}
                </p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total rooms
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {stats.totalInventory}
                </p>
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
