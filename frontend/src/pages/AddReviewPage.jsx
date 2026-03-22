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
      await axios.post("https://notify-service-app.jollyforest-5b37db64.southeastasia.azurecontainerapps.io/reviews", {
        hotelId,
        userId: "user123", 
        rating,
        comment
      });
      // Redirect to the reviews page upon success
      navigate(`/hotels/${hotelId}/reviews`);
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "Failed to post review"));
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f6] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-xl border border-rose-100">
        
        {/* Header with Cancel/Close button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-900">Leave a Review</h2>
          <button 
            type="button"
            onClick={() => navigate(-1)} 
            className="text-slate-400 hover:text-rose-500 transition"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Interactive Star Rating */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(s => (
                <button 
                  key={s} 
                  type="button" 
                  onClick={() => setRating(s)} 
                  className={`transition-transform hover:scale-110 focus:outline-none ${s <= rating ? "text-amber-500" : "text-slate-200"}`}
                >
                  {/* Razor-sharp custom SVG Star */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Comment Text Area */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Your Experience</label>
            <textarea 
              required 
              rows="4" 
              className="w-full rounded-2xl border border-slate-200 p-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-50 transition resize-none" 
              placeholder="Tell us what you loved (or didn't love) about your stay..." 
              value={comment} 
              onChange={e => setComment(e.target.value)} 
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="w-1/3 py-4 bg-white text-slate-600 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition"
            >
              Back
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-2/3 py-4 bg-rose-500 text-white font-bold rounded-2xl shadow-md shadow-rose-200 hover:bg-rose-600 hover:-translate-y-0.5 transition disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? "Posting..." : "Post Review"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}