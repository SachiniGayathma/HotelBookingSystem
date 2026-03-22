import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner";

export default function HotelReviewsPage() {
  const { hotelId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hotelName, setHotelName] = useState("Hotel");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Fetch reviews from your notify-analytics-service
        const res = await axios.get(`http://localhost:8084/reviews/hotel/${hotelId}`);
        setReviews(res.data);
        
        // Also fetch hotel name for the header
        const hotelRes = await axios.get(`http://localhost:8081/hotels/${hotelId}`);
        setHotelName(hotelRes.data.name);
      } catch (err) {
        console.error("Failed to load reviews", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [hotelId]);

  const averageRating = reviews.length 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) return <LoadingSpinner label="Loading reviews..." />;

  return (
    <div className="min-h-screen bg-[#fff8f6] p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-900">{hotelName} - Guest Reviews</h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-amber-500 font-bold text-lg">⭐ {averageRating}</span>
              <span className="text-slate-400 text-sm">({reviews.length} reviews)</span>
            </div>
          </div>
          <Link to={`/hotels/${hotelId}`} className="text-sm font-bold text-rose-600 border border-rose-200 px-4 py-2 rounded-xl hover:bg-rose-50">
            Back to Hotel
          </Link>
        </header>

        <div className="grid gap-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500">
              No reviews yet. Be the first to leave one!
            </div>
          ) : (
            reviews.map((review) => (
              <article key={review.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition hover:shadow-md">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 font-bold">
                      {review.userId.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{review.userId}</p>
                      <p className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-amber-500 font-bold">
                    {"⭐".repeat(review.rating)}
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed italic">"{review.comment}"</p>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}