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
    <div className="min-h-screen bg-[#fff8f6] text-slate-900">
      <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-600">Hotel Admin</h1>
          <Link
            to="/admin/hotels"
            className="text-sm font-semibold text-rose-600 hover:text-rose-700"
          >
            Back to Hotels
          </Link>
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
