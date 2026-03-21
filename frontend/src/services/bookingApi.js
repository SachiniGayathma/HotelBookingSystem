import axios from "axios";

const BOOKING_API_BASE_URL = import.meta.env.VITE_BOOKING_API_BASE_URL || "/api/bookings";

export function checkBookingAvailability(hotelId, roomType, checkIn, checkOut, guests) {
  return axios.get(`${BOOKING_API_BASE_URL}/check-availability`, {
    params: { hotelId, roomType, checkIn, checkOut, guests },
  });
}

export function createBooking(data) {
  return axios.post(BOOKING_API_BASE_URL, data);
}
