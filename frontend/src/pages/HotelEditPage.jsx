import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import HotelForm from "../components/hotels/HotelForm";
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

        {loading ? (
          <p className="text-sm text-slate-500">Loading hotel...</p>
        ) : null}

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
