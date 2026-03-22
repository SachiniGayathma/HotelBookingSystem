import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

export default function PayButton() {
  const location = useLocation();
  const autoTriggered = useRef(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(Number(location.state?.amount) || 5000);
  const [userId, setUserId] = useState(location.state?.userId || "user123");

  const handlePayment = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "https://payment-service-app.agreeableocean-2c4c42d0.southeastasia.azurecontainerapps.io/api/payment/create-session",
        { amount, userId } // send userId to backend
      );
      window.location.href = response.data.url;
    } catch (error) {
      console.error(error);
      alert("Payment failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoTriggered.current) {
      return;
    }

    if (location.state?.amount && location.state?.userId) {
      autoTriggered.current = true;
      handlePayment();
    }
  }, [location.state]);

  return (
    <div>
      <input
        type="text"
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        style={{ padding: "5px", marginRight: "10px" }}
      />
      <input
        type="number"
        placeholder="Enter amount in USD"
        value={amount / 100}
        onChange={(e) => setAmount(Number(e.target.value) * 100)}
        style={{ padding: "5px", marginRight: "10px" }}
      />
      <button onClick={handlePayment} disabled={loading} style={{ padding: "10px 20px" }}>
        {loading ? "Redirecting..." : `Pay $${amount / 100}`}
      </button>
    </div>
  );
}