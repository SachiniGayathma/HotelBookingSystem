import { useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";

export default function Success() {
  /* --- DIGITAL RECEIPT LOGIC START --- */
  const emailSent = useRef(false);

  useEffect(() => {
    // Prevents React from firing the email twice
    if (emailSent.current) return;
    
    const bookingDataStr = localStorage.getItem("recentBooking");
    
    if (bookingDataStr) {
      const bookingData = JSON.parse(bookingDataStr);
      
      // Fire EmailJS API Call
      emailjs.send(
        'service_xolaaok',      // service-id
        'template_j1cm2uc',     // template id
        bookingData, 
        'VRwWuvzY3ns5B0bfM'       // public key
      ).then(() => {
        console.log("✅ Digital Receipt Sent Successfully!");
        localStorage.removeItem("recentBooking"); 
      }).catch(err => console.error("❌ Email Receipt Failed:", err));
      
      emailSent.current = true;
    }
  }, []);
  /* --- DIGITAL RECEIPT LOGIC END --- */
  
  return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Payment Successful! 🎉</h2>;
}