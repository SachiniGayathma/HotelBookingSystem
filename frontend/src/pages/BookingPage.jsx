import { Link, useParams } from "react-router-dom";

export default function BookingPage() {
  const { hotelId } = useParams(); // Get hotelId from URL

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

        <section className="mt-6 rounded-3xl border border-rose-100 bg-linear-to-br from-white via-rose-50 to-orange-50 p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <h1 className="text-3xl font-black sm:text-4xl">Book Your Stay</h1>
            <p className="mt-2 text-slate-600">
              Hotel ID: {hotelId} - Booking form coming soon!
            </p>
            {/* TODO: Add booking form here */}
          </div>
        </section>
      </main>
    </div>
  );
}