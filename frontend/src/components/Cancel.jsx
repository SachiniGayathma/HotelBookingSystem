import { useEffect } from "react";

export default function Cancel() {
  useEffect(() => {
    localStorage.removeItem("pendingBookingAfterPayment");
  }, []);

  return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Payment Cancelled ❌</h2>;
}