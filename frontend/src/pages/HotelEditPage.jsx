import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import HotelForm from "../components/hotels/HotelForm";
import LoadingSpinner from "../components/LoadingSpinner";
import { getHotelById, updateHotel } from "../services/hotelApi";

export default function HotelEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchHotel() {
      try {
        setLoading(true);
        setError("");
        const response = await getHotelById(id);
        setHotel(response.data);
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message || "Failed to load hotel.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchHotel();
  }, [id]);

  async function handleUpdate(payload) {
    try {
      setSaving(true);
      setError("");
      await updateHotel(id, payload);
      navigate(`/admin/hotels/${id}`);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "Failed to update hotel.",
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
                Edit Hotel
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

        {loading ? <LoadingSpinner label="Loading hotel..." /> : null}

        {!loading && hotel ? (
          <HotelForm
            title={`Edit ${hotel.name}`}
            submitLabel="Save changes"
            initialHotel={hotel}
            onSubmit={handleUpdate}
            isSubmitting={saving}
            error={error}
          />
        ) : null}

        {!loading && !hotel && error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </main>
    </div>
  );
}
