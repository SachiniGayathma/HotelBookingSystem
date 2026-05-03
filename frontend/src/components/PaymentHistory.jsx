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
          `https://payment-service-app.jollyforest-5b37db64.southeastasia.azurecontainerapps.io/api/payment/history/${userId}`
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
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-6 border border-rose-100">
          <h2 className="text-2xl font-bold text-slate-800">
            Payment History
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            User ID: <span className="font-medium text-rose-500">{userId}</span>
          </p>
        </div>
        {/* Empty State */}
        {payments.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow text-center border border-gray-100">
            <p className="text-gray-500 text-sm">
              No payments found for this user.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((p) => (
              <div
                key={p.id}
                className="bg-white shadow-sm border border-gray-100 rounded-xl p-5 flex justify-between items-center hover:shadow-md transition"
              >
                <div>
                  <p className="text-lg font-semibold text-slate-800">
                    {p.productName}
                  </p>
                  <p className="text-sm text-gray-500">
                    Payment ID: {p.id}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-rose-500 font-bold text-lg">
                    ${(p.amount / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 uppercase">
                    {p.currency}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}