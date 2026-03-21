import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import PayButton from "./components/PayButton";
import Success from "./components/Success";
import Cancel from "./components/Cancel";
import PaymentHistory from "./components/PaymentHistory";
import AllPayments from "./components/AllPayments";
import HomePage from "./pages/HomePage";
import HotelsPage from "./pages/HotelsPage";
import AdminHotelsPage from "./pages/AdminHotelsPage";
import HotelCreatePage from "./pages/HotelCreatePage";
import HotelEditPage from "./pages/HotelEditPage";
import HotelDetailsPage from "./pages/HotelDetailsPage";
import CustomerHotelDetailsPage from "./pages/CustomerHotelDetailsPage";
import BookingPage from "./pages/BookingPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/hotels" element={<HotelsPage />} />
        <Route path="/hotels/:id" element={<CustomerHotelDetailsPage />} />
        <Route path="/booking/:hotelId" element={<BookingPage />} />
        <Route path="/admin/hotels" element={<AdminHotelsPage />} />
        <Route path="/admin/hotels/new" element={<HotelCreatePage />} />
        <Route path="/admin/hotels/:id" element={<HotelDetailsPage />} />
        <Route path="/admin/hotels/:id/edit" element={<HotelEditPage />} />
        <Route path="/pay" element={<PayButton />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/history/:userId" element={<PaymentHistory />} />
        <Route path="/all-payments" element={<AllPayments />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
