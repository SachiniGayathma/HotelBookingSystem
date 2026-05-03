import axios from "axios";

const HOTEL_API_BASE_URL =
  import.meta.env.VITE_HOTEL_API_BASE_URL ||
  "https://hotel-service-app.jollyforest-5b37db64.southeastasia.azurecontainerapps.io/hotels";

export const AMENITY_OPTIONS = [
  "WIFI",
  "POOL",
  "PARKING",
  "RESTAURANT",
  "GYM",
  "SPA",
];
export const ROOM_TYPE_OPTIONS = ["SINGLE", "DOUBLE", "SUITE"];

export function getAllHotels() {
  return axios.get(HOTEL_API_BASE_URL);
}

export function getHotelById(hotelId) {
  return axios.get(`${HOTEL_API_BASE_URL}/${hotelId}`);
}

export function createHotel(payload) {
  return axios.post(HOTEL_API_BASE_URL, payload);
}

export function updateHotel(hotelId, payload) {
  return axios.put(`${HOTEL_API_BASE_URL}/${hotelId}`, payload);
}

export function deleteHotel(hotelId) {
  return axios.delete(`${HOTEL_API_BASE_URL}/${hotelId}`);
}

export function searchHotelsByCity(city) {
  return axios.get(`${HOTEL_API_BASE_URL}/search`, {
    params: { city },
  });
}

export function searchHotelsByAmenity(amenity) {
  return axios.get(`${HOTEL_API_BASE_URL}/amenity`, {
    params: { amenity },
  });
}

export function addRoomToHotel(hotelId, payload) {
  return axios.post(`${HOTEL_API_BASE_URL}/${hotelId}/rooms`, payload);
}

export function checkRoomAvailability(hotelId, roomType) {
  return axios.get(`${HOTEL_API_BASE_URL}/${hotelId}/availability`, {
    params: { roomType },
  });
}

export function reserveRoom(hotelId, roomType) {
  return axios.put(`${HOTEL_API_BASE_URL}/${hotelId}/reserve`, null, {
    params: { roomType },
  });
}
