import { Link } from "react-router-dom";

const hotels = [
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
  {
    name: "Coral Bay Suites",
    location: "Trincomalee, Sri Lanka",
    price: "$165 night",
    rating: "4.76",
    image:
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80",
    tag: "Beachfront",
  },
  {
    name: "Lakeview Heritage House",
    location: "Kandy, Sri Lanka",
    price: "$132 night",
    rating: "4.68",
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    tag: "Family Friendly",
  },
  {
    name: "Palm Court Urban Stay",
    location: "Negombo, Sri Lanka",
    price: "$118 night",
    rating: "4.63",
    image:
      "https://images.unsplash.com/photo-1578774204375-826dc5d996ed?auto=format&fit=crop&w=1200&q=80",
    tag: "Budget Pick",
  },
];

export default function HotelsPage() {
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
            <a
              href="/#support"
              className="rounded-full px-3 py-1 transition hover:bg-slate-100"
            >
              Support
            </a>
          </nav>
        </header>

        <section className="mt-6 rounded-3xl border border-rose-100 bg-gradient-to-br from-white via-rose-50 to-orange-50 p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">
            Hotel listings
          </p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            Explore handpicked stays
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Compare locations, room styles, and nightly rates to find the stay
            that matches your trip.
          </p>
        </section>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {hotels.map((hotel) => (
            <article
              key={hotel.name}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className="h-52 w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${hotel.image})` }}
              />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-bold leading-tight">
                    {hotel.name}
                  </h2>
                  <p className="text-sm font-semibold text-slate-700">
                    {hotel.rating} ★
                  </p>
                </div>
                <p className="mt-1 text-sm text-slate-500">{hotel.location}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                    {hotel.tag}
                  </span>
                  <p className="text-sm font-bold">{hotel.price}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
