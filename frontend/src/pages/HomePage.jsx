import { Link } from "react-router-dom";

const guestHighlights = [
  {
    title: "Verified Stays",
    description:
      "Every listing is reviewed with clear room details, photos, and amenities before you book.",
    status: "Trust & Safety",
    accent: "bg-orange-100 text-orange-700",
  },
  {
    title: "Secure Checkout",
    description:
      "Pay with confidence through encrypted transactions and instant booking confirmation.",
    status: "Protected Payments",
    accent: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Real-Time Availability",
    description:
      "See what is available now, lock your dates quickly, and avoid double-booking surprises.",
    status: "Always Updated",
    accent: "bg-sky-100 text-sky-700",
  },
  {
    title: "Trip Reminders",
    description:
      "Get timely updates for payment receipts, check-in info, and booking changes.",
    status: "Guest Notifications",
    accent: "bg-rose-100 text-rose-700",
  },
];

const stays = [
  {
    name: "Sunset Cliff Resort",
    location: "Mirissa, Sri Lanka",
    price: "$180 night",
    rating: "4.92",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    tag: "Ocean View",
  },
  {
    name: "Cityline Boutique Hotel",
    location: "Colombo, Sri Lanka",
    price: "$140 night",
    rating: "4.81",
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
    tag: "Business",
  },
  {
    name: "Highland Glass Villas",
    location: "Nuwara Eliya, Sri Lanka",
    price: "$210 night",
    rating: "4.95",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    tag: "Mountain Escape",
  },
];

const quickActions = [
  { label: "Book & Pay", to: "/pay" },
  { label: "Payment Ledger", to: "/all-payments" },
  { label: "Guest Payment History", to: "/history/user123" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fff8f6] text-slate-900">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(255,102,102,0.16),transparent_45%)]" />
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10 lg:py-12">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rose-100 bg-white px-5 py-4 shadow-sm">
            <div className="text-xl font-extrabold tracking-tight text-rose-500">
              StayEase
            </div>
            <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600">
              <Link
                to="/hotels"
                className="rounded-full bg-rose-50 px-3 py-1 text-rose-600 transition hover:bg-rose-100"
              >
                Hotels
              </Link>
              <a
                href="#support"
                className="rounded-full px-3 py-1 transition hover:bg-slate-100"
              >
                Support
              </a>
            </nav>
          </header>

          <section className="mt-6 rounded-3xl border border-rose-100 bg-gradient-to-br from-white via-rose-50 to-orange-50 p-6 shadow-sm sm:p-8">
            <p className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-700">
              Hotel Booking System
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
              Find the right stay, then run every booking workflow end-to-end.
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Marketplace-inspired guest experience in the front, connected to
              reliable booking, payment, and operational services in the back.
            </p>

            <div className="mt-7 grid gap-3 rounded-2xl border border-rose-100 bg-white p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-100 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Destination
                </p>
                <p className="mt-1 font-semibold">Anywhere in Sri Lanka</p>
              </div>
              <div className="rounded-xl border border-slate-100 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Check In
                </p>
                <p className="mt-1 font-semibold">Add dates</p>
              </div>
              <div className="rounded-xl border border-slate-100 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Guests
                </p>
                <p className="mt-1 font-semibold">2 guests</p>
              </div>
              <Link
                to="/hotels"
                className="inline-flex items-center justify-center rounded-xl bg-rose-500 px-5 py-3.5 text-center text-sm font-bold leading-none text-white transition hover:bg-rose-600"
              >
                Search stays
              </Link>
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-2xl font-extrabold">Featured stays</h2>
              <p className="text-sm text-slate-500">
                Curated for your next trip
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {stays.map((stay) => (
                <article
                  key={stay.name}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div
                    className="h-52 w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${stay.image})` }}
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold">{stay.name}</h3>
                      <p className="text-sm font-semibold text-slate-700">
                        {stay.rating} ★
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {stay.location}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                        {stay.tag}
                      </span>
                      <p className="text-sm font-bold">{stay.price}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section
            id="support"
            className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-extrabold">
                Why guests book with StayEase
              </h2>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="mb-5 rounded-xl border border-rose-100 bg-rose-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">
                How it works
              </p>
              <p className="mt-2 text-sm text-slate-700">
                Search your destination, compare stays, complete secure
                checkout, and receive instant confirmation with trip updates.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {guestHighlights.map((highlight) => (
                <article
                  key={highlight.title}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <p
                    className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${highlight.accent}`}
                  >
                    {highlight.status}
                  </p>
                  <h3 className="mt-3 text-lg font-bold">{highlight.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {highlight.description}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
