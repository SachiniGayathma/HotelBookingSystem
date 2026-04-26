import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AllPayments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get(
          "https://payment-service-app.jollyforest-5b37db64.southeastasia.azurecontainerapps.io/api/payment/all"
        );
        setPayments(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPayments();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-rose-100 mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            All Payments
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Overview of all transactions
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
          <table className="w-full text-sm text-left">
            
            <thead className="bg-rose-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">User ID</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Payment ID</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-rose-50 transition"
                  >
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {p.userId}
                    </td>

                    <td className="px-6 py-4 text-rose-500 font-semibold">
                      ${(p.amount / 100).toFixed(2)}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {p.productName}
                    </td>

                    <td className="px-6 py-4 text-xs text-gray-400 break-all">
                      {p.stripeSessionId}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}