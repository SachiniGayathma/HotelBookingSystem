import React, { useState } from "react";
import axios from "axios";

export default function PayButton() {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(5000);
  const [userId, setUserId] = useState("user123"); // Example user ID

  const handlePayment = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:8080/api/payment/create-session",
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