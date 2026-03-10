import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PayButton from "./components/PayButton";
import Success from "./components/Success";
import Cancel from "./components/Cancel";
import PaymentHistory from "./components/PaymentHistory";
import AllPayments from "./components/AllPayments";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/pay" element={<PayButton />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/history/:userId" element={<PaymentHistory />} />
        <Route path="/all-payments" element={<AllPayments />} />
      </Routes>
    </Router>
  );
}

export default App;