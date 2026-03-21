import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import HotelForm from "../components/hotels/HotelForm";
import { createHotel } from "../services/hotelApi";

export default function HotelCreatePage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate(payload) {
    try {
      setSaving(true);
      setError("");
      await createHotel(payload);
      navigate("/admin/hotels");
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Failed to create hotel. Check required fields.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ffe8df_0%,_#fff8f6_45%,_#fff_100%)] text-slate-900">
      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-6 rounded-2xl border border-rose-200/70 bg-white/90 px-5 py-4 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-500">
                Hotel Admin
              </p>
              <h1 className="mt-1 text-xl font-black text-slate-800">
                Create Hotel
              </h1>
            </div>
            <Link
              to="/admin/hotels"
              className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              Back to Hotels
            </Link>
          </div>
        </div>
        <HotelForm
          title="Create New Hotel"
          submitLabel="Create hotel"
          onSubmit={handleCreate}
          isSubmitting={saving}
          error={error}
        />
      </main>
    </div>
  );
}
