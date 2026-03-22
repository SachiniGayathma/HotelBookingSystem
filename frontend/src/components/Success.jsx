import { useEffect, useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { completeBookingAfterPayment } from "../services/bookingApi";

export default function Success() {
  const [message, setMessage] = useState("Finalizing your booking...");
  const emailSent = useRef(false);

 const sendReceiptIfAvailable = async (finalBookingId = null) => {
    // 1. Lock the email IMMEDIATELY to stop React from sending it twice
    if (emailSent.current) return;
    const bookingDataStr = localStorage.getItem("recentBooking");
    if (!bookingDataStr) return;

    emailSent.current = true; 
    localStorage.removeItem("recentBooking"); 

    try {
      const bookingData = JSON.parse(bookingDataStr);
      const payload = {
        ...bookingData,
        booking_id: finalBookingId || bookingData.booking_id || "N/A",
      };

      await emailjs.send(
        "service_xolaaok",
        "template_j1cm2uc",
        payload,
        "VRwWuvzY3ns5B0bfM",
      );
      console.log("Digital receipt sent successfully");
    } catch (err) {
      console.error("Digital receipt failed:", err);
    }
  };

useEffect(() => {
    const finalize = async () => {
      const raw = localStorage.getItem("pendingBookingAfterPayment");

      if (!raw) {
        setMessage("Your payment has been processed successfully.");
        await sendReceiptIfAvailable();
        return;
      }

      let completedBookingId = null;

      try {
        const pendingBooking = JSON.parse(raw);

        const response = await completeBookingAfterPayment({
          ...pendingBooking,
          status: "COMPLETED", // Kept exactly as your backend requires!
        });

        completedBookingId = response?.data?.id || null;
        localStorage.removeItem("pendingBookingAfterPayment");
        setMessage("Payment and booking completed successfully.");
        
      } catch (error) {
        setMessage(
          `Payment succeeded, but booking finalization failed: ${error?.response?.data || error.message}`,
        );
      } finally {
        // 2. Moved to the 'finally' block so the customer ALWAYS gets their receipt!
        await sendReceiptIfAvailable(completedBookingId);
      }
    };

    finalize();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 px-4">
      
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center border border-green-100">
        
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 text-green-600 rounded-full p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Payment Successful 🎉
        </h2>

        {/* Subtitle */}
        <p className="text-gray-500 text-sm mb-6">
          {message}
        </p>

        {/* Button */}
        <a
          href="/"
          className="inline-block bg-green-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-600 transition"
        >
          Go to Home
        </a>

      </div>
    </div>
  );
}