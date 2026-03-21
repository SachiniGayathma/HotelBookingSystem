// Create this at frontend/src/pages/AddReviewPage.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function AddReviewPage() {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:8084/reviews", {
        hotelId,
        userId: "user123", // Hardcoded for project
        rating,
        comment
      });
      navigate(`/hotels/${hotelId}/reviews`);
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "Failed to post review"));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#fff8f6] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-xl border border-rose-100">
        <h2 className="text-2xl font-black text-slate-900 mb-6">Leave a Review</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} type="button" onClick={() => setRating(s)} className={`text-2xl ${s <= rating ? "grayscale-0" : "grayscale opacity-30"}`}>⭐</button>
            ))}
          </div>
          <textarea required rows="4" className="w-full rounded-2xl border border-slate-200 p-4" placeholder="How was your stay?" value={comment} onChange={e => setComment(e.target.value)} />
          <button type="submit" disabled={loading} className="w-full py-4 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition">
            {loading ? "Posting..." : "Post Review"}
          </button>
        </form>
      </div>
    </div>
  );
}