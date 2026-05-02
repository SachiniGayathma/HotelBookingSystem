import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  ROOM_TYPE_OPTIONS,
  addRoomToHotel,
  checkRoomAvailability,
  getHotelById,
  reserveRoom,
} from "../services/hotelApi";
//test comment

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

function roomBadge(availableRooms) {
  if (availableRooms > 5) {
    return "bg-emerald-100 text-emerald-700";
  }
  if (availableRooms > 0) {
    return "bg-amber-100 text-amber-700";
  }
  return "bg-rose-100 text-rose-700";
}

export default function HotelDetailsPage() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [roomType, setRoomType] = useState("SINGLE");
  const [pricePerNight, setPricePerNight] = useState("");
  const [totalRooms, setTotalRooms] = useState("");
  const [availableRooms, setAvailableRooms] = useState("");
  const [roomActionMessage, setRoomActionMessage] = useState("");
  const [roomActionError, setRoomActionError] = useState("");

  const [updateRoomType, setUpdateRoomType] = useState("");
  const [updateAvailableRooms, setUpdateAvailableRooms] = useState("");

  const roomCount = useMemo(() => hotel?.rooms?.length ?? 0, [hotel]);

  async function loadHotelDetails() {
    try {
      setLoading(true);
      setError("");
      const response = await getHotelById(id);
      setHotel(response.data);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Failed to load hotel details.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHotelDetails();
  }, [id]);

  async function handleAddRoom(event) {
    event.preventDefault();
    setRoomActionError("");
    setRoomActionMessage("");

    const payload = {
      roomType,
      pricePerNight: Number(pricePerNight) || 0,
      totalRooms: Number(totalRooms) || 0,
      availableRooms: Number(availableRooms) || 0,
    };

    try {
      await addRoomToHotel(id, payload);
      setRoomActionMessage("Room type saved successfully (added or updated).");
      setPricePerNight("");
      setTotalRooms("");
      setAvailableRooms("");
      await loadHotelDetails();
    } catch (requestError) {
      setRoomActionError(
        requestError?.response?.data?.message || "Failed to add room.",
      );
    }
  }

  async function handleAvailabilityCheck() {
    try {
      setRoomActionMessage("");
      setRoomActionError("");
      const response = await checkRoomAvailability(id, roomType);
      const availableCount = Number(response?.data?.availableRooms ?? 0);
      setRoomActionMessage(
        availableCount > 0
          ? `${availableCount} ${roomType} room(s) available.`
          : `${roomType} rooms are currently unavailable.`,
      );
    } catch (requestError) {
      setRoomActionError(
        requestError?.response?.data?.message ||
          "Failed to check availability.",
      );
    }
  }

  async function handleReserveRoom() {
    try {
      setRoomActionMessage("");
      setRoomActionError("");
      await reserveRoom(id, roomType);
      setRoomActionMessage(`${roomType} room reserved successfully.`);
      await loadHotelDetails();
    } catch (requestError) {
      setRoomActionError(
        requestError?.response?.data?.message || "Failed to reserve room.",
      );
    }
  }

  async function handleQuickInventoryUpdate(event) {
    event.preventDefault();
    setRoomActionError("");
    setRoomActionMessage("");

    const existingRoom = (hotel?.rooms ?? []).find(
      (room) => room.roomType === updateRoomType,
    );

    if (!existingRoom) {
      setRoomActionError("Room type not found.");
      return;
    }

    const newAvailableCount = Number(updateAvailableRooms) || 0;
    const delta = newAvailableCount - existingRoom.availableRooms;

    const payload = {
      roomType: updateRoomType,
      pricePerNight: existingRoom.pricePerNight,
      totalRooms: 0,
      availableRooms: delta,
    };

    try {
      await addRoomToHotel(id, payload);
      setRoomActionMessage(
        `${updateRoomType} available rooms updated to ${newAvailableCount}.`,
      );
      setUpdateAvailableRooms("");
      await loadHotelDetails();
    } catch (requestError) {
      setRoomActionError(
        requestError?.response?.data?.message ||
          "Failed to update room inventory.",
      );
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ffe7dd_0%,_#fff8f6_45%,_#fff_100%)] text-slate-900">
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200/70 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
          <h1 className="text-2xl font-black">Hotel Details</h1>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin/hotels"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Hotels
            </Link>
            <Link
              to={`/admin/hotels/${id}/edit`}
              className="rounded-lg bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
            >
              Edit Hotel
            </Link>
          </div>
        </div>

        {loading ? <LoadingSpinner label="Loading hotel details..." /> : null}

        {!loading && error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {!loading && hotel ? (
          <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {hotel.hotelCode}
                  </p>
                  <h2 className="mt-1 text-2xl font-black">{hotel.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {hotel.city} • {hotel.address}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {roomCount} room types
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-700">{hotel.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {(hotel.amenities ?? []).map((amenity) => (
                  <span
                    key={amenity}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${amenityClassName(amenity)}`}
                  >
                    {amenity}
                  </span>
                ))}
              </div>

              <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Room Type</th>
                      <th className="px-4 py-3 font-semibold">Price / Night</th>
                      <th className="px-4 py-3 font-semibold">Total</th>
                      <th className="px-4 py-3 font-semibold">Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(hotel.rooms ?? []).map((room, index) => (
                      <tr
                        key={`${room.roomType}-${index}`}
                        className="border-t border-slate-100"
                      >
                        <td className="px-4 py-3 font-semibold">
                          {room.roomType}
                        </td>
                        <td className="px-4 py-3">${room.pricePerNight}</td>
                        <td className="px-4 py-3">{room.totalRooms}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${roomBadge(room.availableRooms)}`}
                          >
                            {room.availableRooms}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid gap-4">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold">Room operations</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Use service endpoints to manage availability.
                </p>

                <div className="mt-4 grid gap-3">
                  <label className="grid gap-1 text-sm font-medium text-slate-700">
                    Room type
                    <select
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-2"
                    >
                      {ROOM_TYPE_OPTIONS.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleAvailabilityCheck}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                    >
                      Check availability
                    </button>
                    <button
                      type="button"
                      onClick={handleReserveRoom}
                      className="rounded-lg bg-rose-500 px-3 py-2 text-sm font-semibold text-white"
                    >
                      Reserve room
                    </button>
                  </div>

                  {roomActionMessage ? (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                      {roomActionMessage}
                    </div>
                  ) : null}

                  {roomActionError ? (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                      {roomActionError}
                    </div>
                  ) : null}
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold">Quick inventory update</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Update available rooms for existing room types.
                </p>
                <form
                  className="mt-3 grid gap-3"
                  onSubmit={handleQuickInventoryUpdate}
                >
                  <label className="grid gap-1 text-sm font-medium text-slate-700">
                    Select room type
                    <select
                      value={updateRoomType}
                      onChange={(e) => setUpdateRoomType(e.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-2"
                      required
                    >
                      <option value="">-- Choose a room type --</option>
                      {(hotel?.rooms ?? []).map((room) => (
                        <option key={room.roomType} value={room.roomType}>
                          {room.roomType} (Price: ${room.pricePerNight}, Total:{" "}
                          {room.totalRooms}, Available: {room.availableRooms})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm font-medium text-slate-700">
                    New available count
                    <input
                      type="number"
                      value={updateAvailableRooms}
                      onChange={(e) => setUpdateAvailableRooms(e.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-2"
                      required
                    />
                  </label>
                  <button
                    type="submit"
                    className="mt-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Update inventory
                  </button>
                </form>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold">Add room type</h3>
                <form className="mt-3 grid gap-3" onSubmit={handleAddRoom}>
                  <label className="grid gap-1 text-sm font-medium text-slate-700">
                    Room type
                    <select
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-2"
                    >
                      {ROOM_TYPE_OPTIONS.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm font-medium text-slate-700">
                    Price per night
                    <input
                      type="number"
                      step="0.01"
                      value={pricePerNight}
                      onChange={(e) => setPricePerNight(e.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-2"
                      required
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-medium text-slate-700">
                    Total rooms
                    <input
                      type="number"
                      value={totalRooms}
                      onChange={(e) => setTotalRooms(e.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-2"
                      required
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-medium text-slate-700">
                    Available rooms
                    <input
                      type="number"
                      value={availableRooms}
                      onChange={(e) => setAvailableRooms(e.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-2"
                      required
                    />
                  </label>

                  <button
                    type="submit"
                    className="mt-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Add room
                  </button>
                </form>
              </article>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}
