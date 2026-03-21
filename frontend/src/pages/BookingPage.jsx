import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getHotelById } from "../services/hotelApi";
import { checkBookingAvailability, createBooking } from "../services/bookingApi";

const ROOM_TYPES = [
  { key: "SINGLE", label: "Single", max: 1 },
  { key: "DOUBLE", label: "Double", max: 3 },
  { key: "SUITE", label: "Suite", max: 6 },
];

const MEAL_PLANS = [
  { key: "NONE", label: "No meals", addPerNight: 0 },
  { key: "BREAKFAST", label: "Breakfast", addPerNight: 10 },
  { key: "HALF_BOARD", label: "Half-board", addPerNight: 20 },
  { key: "FULL_BOARD", label: "Full-board", addPerNight: 30 },
];

const SERVICE_RATE = 0.1;
const TAX_RATE = 0.12;
const HARDCODED_USER_ID = "user123";

function dateDiffInDays(start, end) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.round((end - start) / msPerDay));
}

export default function BookingPage() {
  const { hotelId } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [roomType, setRoomType] = useState("DOUBLE");
  const [mealPlan, setMealPlan] = useState("NONE");

  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const totalGuests = adults + kids;
  const selectedRoom = hotel?.rooms?.find((r) => r.roomType === roomType);
  const basePrice = selectedRoom?.pricePerNight || 0;

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    return dateDiffInDays(d1, d2);
  }, [checkIn, checkOut]);

  const mealPlanObj = MEAL_PLANS.find((m) => m.key === mealPlan) || MEAL_PLANS[0];

  const pricing = useMemo(() => {
    if (nights < 1 || basePrice <= 0) return 0;
    const roomCharge = basePrice * nights;
    const mealCharge = mealPlanObj.addPerNight * nights * totalGuests;
    const serviceCharge = roomCharge * SERVICE_RATE;
    const taxCharge = roomCharge * TAX_RATE;
    const total = roomCharge + mealCharge + serviceCharge + taxCharge;
    return {
      roomCharge,
      mealCharge,
      serviceCharge,
      taxCharge,
      total,
    };
  }, [nights, basePrice, mealPlanObj, totalGuests]);

  const totalPrice = pricing?.total || 0;

  useEffect(() => {
    const loadHotel = async () => {
      try {
        const res = await getHotelById(hotelId);
        setHotel(res.data);
      } catch (err) {
        console.error("Could not load hotel", err);
      }
    };

    if (hotelId) loadHotel();
  }, [hotelId]);

  const checkAvailabilityAction = async () => {
    if (!hotelId || !checkIn || !checkOut) {
      setAvailabilityMessage("Please provide check-in and check-out dates.");
      setIsAvailable(false);
      setAvailabilityChecked(true);
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setAvailabilityMessage("Check-out date must be after check-in date.");
      setIsAvailable(false);
      setAvailabilityChecked(true);
      return;
    }

    const roomTypeConfig = ROOM_TYPES.find((r) => r.key === roomType);
    if (totalGuests > roomTypeConfig.max) {
      setAvailabilityMessage(`Selected room type supports up to ${roomTypeConfig.max} guests.`);
      setIsAvailable(false);
      setAvailabilityChecked(true);
      return;
    }

    setBusy(true);
    try {
      const response = await checkBookingAvailability(hotelId, roomType, checkIn, checkOut, totalGuests);
      const available = response.data === true;
      setIsAvailable(available);
      setAvailabilityChecked(true);

      if (available) {
        setAvailabilityMessage("Room is available! Select meal plan and book now.");
      } else {
        setAvailabilityMessage("Sorry, no rooms are available for the selected dates.");
      }
    } catch (error) {
      setAvailabilityMessage("Availability check failed. Please try again.");
      setIsAvailable(false);
      setAvailabilityChecked(true);
      console.error(error);
    } finally {
      setBusy(false);
    }
  };

  const handleBookNow = async () => {
    if (!isAvailable) {
      setBookingMessage("Please check availability first.");
      return;
    }

    setBusy(true);
    setBookingMessage("");

    const payload = {
      hotelId,
      roomId: selectedRoom?.id || `${hotelId}-${roomType}`,
      roomType,
      mealPlan,
      userId: HARDCODED_USER_ID,
      guests: totalGuests,
      checkIn,
      checkOut,
      totalPrice,
      status: "PENDING",
    };

    try {
      const result = await createBooking(payload);
      if (result?.data?.id) {
        setBookingMessage(`Booking successful! ID: ${result.data.id}`);
        setTimeout(() => {
          const paymentRedirectUrl = result?.data?.paymentId;
          if (typeof paymentRedirectUrl === "string" && paymentRedirectUrl.startsWith("http")) {
            window.location.href = paymentRedirectUrl;
            return;
          }

          navigate("/pay", {
            state: {
              amount: Math.round((result?.data?.totalPrice || totalPrice) * 100),
              userId: HARDCODED_USER_ID,
              bookingId: result.data.id,
            },
          });
        }, 1200);
      } else {
        setBookingMessage("Booking succeeded, but no ID returned.");
      }
    } catch (error) {
      setBookingMessage(`Booking failed: ${error?.response?.data || error.message}`);
      console.error(error);
    } finally {
      setBusy(false);
    }
  };

  const handleClearSelection = () => {
    setCheckIn("");
    setCheckOut("");
    setAvailabilityChecked(false);
    setIsAvailable(false);
    setAvailabilityMessage("");
    setBookingMessage("");
    setMealPlan("NONE");
  };

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
              Hotels
            </Link>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-600">
              Booking
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
          </nav>
        </header>

        <section className="mt-6 rounded-3xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-black">Booking</h1>
          <p className="mt-1 text-sm text-slate-500">Hotel ID: {hotelId}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="font-semibold text-sm">Room Type</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
              >
                {ROOM_TYPES.map((type) => (
                  <option key={type.key} value={type.key}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-sm">Adults</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={adults <= 1}
                  onClick={() => setAdults((value) => Math.max(1, value - 1))}
                  className="rounded-lg border px-3 py-1"
                >
                  -
                </button>
                <span className="w-8 text-center">{adults}</span>
                <button
                  type="button"
                  disabled={adults + kids >= 6}
                  onClick={() => setAdults((value) => Math.min(6 - kids, value + 1))}
                  className="rounded-lg border px-3 py-1"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-sm">Kids (0-5 yrs free)</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={kids <= 0}
                  onClick={() => setKids((value) => Math.max(0, value - 1))}
                  className="rounded-lg border px-3 py-1"
                >
                  -
                </button>
                <span className="w-8 text-center">{kids}</span>
                <button
                  type="button"
                  disabled={adults + kids >= 6}
                  onClick={() => setKids((value) => Math.min(6 - adults, value + 1))}
                  className="rounded-lg border px-3 py-1"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-sm">Guests (auto)</label>
              <input
                readOnly
                value={totalGuests}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 bg-slate-50"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="font-semibold text-sm">Check-in Date</label>
              <input
                type="date"
                value={checkIn}
                min={new Date().toISOString().split("T")[0]}
                disabled={busy || isAvailable}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="font-semibold text-sm">Check-out Date</label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || new Date().toISOString().split("T")[0]}
                disabled={busy || isAvailable}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={checkAvailabilityAction}
              disabled={busy}
              className="rounded-xl bg-rose-600 px-5 py-2 text-white transition hover:bg-rose-700"
            >
              {busy ? "Checking..." : "Check Availability"}
            </button>
          </div>

          {availabilityChecked ? (
            <div className="mt-4 rounded-xl border p-3 text-sm" data-testid="availability-message">
              <p
                className={`font-semibold ${isAvailable ? "text-green-700" : "text-rose-700"}`}
              >
                {availabilityMessage}
              </p>
            </div>
          ) : null}

          {isAvailable ? (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h2 className="font-bold">Selected options</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-semibold text-sm">Meal plan</label>
                  <select
                    value={mealPlan}
                    onChange={(e) => setMealPlan(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  >
                    {MEAL_PLANS.map((plan) => (
                      <option key={plan.key} value={plan.key}>
                        {plan.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-sm">Nights</label>
                  <input
                    readOnly
                    value={nights}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-sm">Hotel amenities</label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {hotel?.amenities?.length ? (
                      hotel.amenities.map((a) => (
                        <span
                          key={a}
                          className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700"
                        >
                          {a}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-600">No amenities info</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-sm">Base room price: {basePrice.toFixed(2)} per night</p>
                <p className="text-sm">Room charge: {pricing ? pricing.roomCharge.toFixed(2) : "0.00"} USD</p>
                <p className="text-sm">Meal surcharge: {pricing ? pricing.mealCharge.toFixed(2) : "0.00"} USD</p>
                <p className="text-sm">Service charge ({(SERVICE_RATE * 100).toFixed(0)}% of room): {pricing ? pricing.serviceCharge.toFixed(2) : "0.00"} USD</p>
                <p className="text-sm">Tax ({(TAX_RATE * 100).toFixed(0)}% of room): {pricing ? pricing.taxCharge.toFixed(2) : "0.00"} USD</p>
                <p className="text-lg font-bold mt-2">Total estimated: {totalPrice.toFixed(2)} USD</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={handleBookNow}
                  disabled={busy}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-white hover:bg-slate-800"
                >
                  {busy ? "Booking..." : "Book Now"}
                </button>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  disabled={busy}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-slate-700 hover:bg-slate-50"
                >
                  Clear
                </button>
              </div>

              {bookingMessage ? (
                <p className="mt-3 rounded-md border border-slate-200 bg-white p-2 text-sm text-slate-700">
                  {bookingMessage}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}