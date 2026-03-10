import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function PaymentHistory() {
  const { userId } = useParams();   // get userId from URL
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/payment/history/${userId}`
        );
        setPayments(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (userId) {
      fetchPayments();
    }
  }, [userId]);

  return (
    <div>
      <h2>Payment History for {userId}</h2>

      {payments.length === 0 ? (
        <p>No payments found</p>
      ) : (
        <ul>
          {payments.map((p) => (
            <li key={p.id}>
              {p.amount} - {p.productName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}