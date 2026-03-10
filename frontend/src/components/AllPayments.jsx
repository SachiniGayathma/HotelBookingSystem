import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AllPayments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/payment/all");
        setPayments(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPayments();
  }, []);

  return (
    <div>
      <h2>All Payments</h2>

      <table border="1">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Amount</th>
            <th>Product</th>
            <th>Payment ID</th>
          </tr>
        </thead>

        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{p.userId}</td>
              <td>{p.amount}</td>
              <td>{p.productName}</td>
              <td>{p.paymentId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}