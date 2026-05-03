import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get("https://notify-service-app.jollyforest-5b37db64.southeastasia.azurecontainerapps.io/analytics/dashboard");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Helper function to handle TIES for the most popular hotel!
  const getMostPopularHotels = (hotelStats) => {
    if (!hotelStats || hotelStats.length === 0) return "N/A";
    
    // Find the highest booking count
    const maxBookings = Math.max(...hotelStats.map(h => h.bookingCount));
    if (maxBookings === 0) return "No bookings yet";

    // Find all hotels that share that max number
    const topHotels = hotelStats
      .filter(h => h.bookingCount === maxBookings)
      .map(h => h.name);

    return topHotels.join(", "); // E.g., "Hikkaduwa Hues, Cinnamon Lakeside"
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff8f6]">
        <p className="text-xl font-bold animate-pulse text-rose-500">Loading Live Analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8f6] text-slate-900">
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10 lg:py-12">
        
        {/* Header */}
        <header className="mb-8 flex justify-between items-center rounded-2xl border border-rose-100 bg-white px-6 py-5 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-rose-600">System Analytics</h1>
          <p className="text-slate-600 font-medium mt-1">Real-time performance of the Hotel Booking Platform</p>
        </div>
        <Link to="/" className="text-sm font-bold text-rose-600 border-2 border-rose-200 px-5 py-2.5 rounded-xl transition hover:bg-rose-50 hover:border-rose-300">
          Back to Home
        </Link>
      </header>

      {/* Global Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Total System Revenue</p>
          <p className="mt-2 text-4xl font-black text-emerald-900">${stats?.totalRevenue?.toLocaleString() || "0"}</p>
        </article>

        <article className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Total Bookings</p>
          <p className="mt-2 text-4xl font-black text-blue-900">{stats?.totalBookings || 0}</p>
        </article>

        <article className="rounded-2xl border border-purple-200 bg-purple-50 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-purple-700">Active Hotels</p>
          <p className="mt-2 text-4xl font-black text-purple-900">{stats?.totalHotels || 0}</p>
        </article>

        <article className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-rose-700">Cancellation Rate</p>
          <p className="mt-2 text-4xl font-black text-rose-900">{stats?.cancellationRatePercent || 0}%</p>
        </article>
      </div>

      {/* Popularity Insights */}
      <div className="grid gap-6 sm:grid-cols-3 mb-8">
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm sm:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Most Popular Hotel(s)</p>
          <p className="mt-2 text-2xl font-black text-amber-900">{getMostPopularHotels(stats?.hotelStats)}</p>
        </article>
        
        <div className="grid gap-6">
          <article className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm">
             <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Top Room Type</p>
             <p className="mt-1 text-xl font-black text-indigo-900">{stats?.mostPopularRoomType || "N/A"}</p>
          </article>
          <article className="rounded-2xl border border-teal-200 bg-teal-50 p-5 shadow-sm">
             <p className="text-xs font-bold uppercase tracking-wider text-teal-700">Top Meal Plan</p>
             <p className="mt-1 text-xl font-black text-teal-900">{stats?.mostPopularMealPlan || "N/A"}</p>
          </article>
        </div>
      </div>

      {/* Per-Hotel Breakdown Table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Individual Hotel Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold">Hotel Name</th>
                <th className="px-6 py-4 font-bold">Bookings</th>
                <th className="px-6 py-4 font-bold">Revenue</th>
                <th className="px-6 py-4 font-bold">Avg Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.hotelStats?.map((hotel) => (
                <tr key={hotel.hotelId} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-bold text-slate-900">{hotel.name}</td>
                  <td className="px-6 py-4 font-medium">{hotel.bookingCount}</td>
                  <td className="px-6 py-4 font-medium text-emerald-600">${hotel.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      {hotel.averageRating > 0 ? `⭐ ${hotel.averageRating.toFixed(1)}` : "No Reviews"}
                      <span className="text-xs text-slate-400 font-normal ml-1">
                        ({hotel.reviewCount})
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      </main>
    </div>
  );
}