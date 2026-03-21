package com.ctse.booking_service.Services;

import com.ctse.booking_service.Model.Booking;
import com.ctse.booking_service.Repositories.BookingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {
    private final BookingRepository repository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${hotel.service.url:http://localhost:8081}") // Default to local, override in prod
    private String hotelServiceUrl;

    @Value("${payment.service.url:http://localhost:8082}")
    private String paymentServiceUrl;

    public BookingService(BookingRepository repository) {
        this.repository = repository;
    }

    // Check availability by calling hotel service
    public Object checkAvailability(String hotelId, LocalDate checkIn, LocalDate checkOut, int guests) {
        // Validate dates
        if (checkIn.isBefore(LocalDate.now()) || checkOut.isBefore(checkIn)) {
            throw new IllegalArgumentException("Invalid dates");
        }

        // Call hotel service for availability
        String url = hotelServiceUrl + "/hotels/" + hotelId + "/availability?checkIn=" + checkIn + "&checkOut=" + checkOut + "&guests=" + guests;
        try {
            return restTemplate.getForObject(url, Object.class); // Assuming hotel returns JSON with rooms and prices
        } catch (Exception e) {
            throw new RuntimeException("Hotel service unavailable: " + e.getMessage());
        }
    }

    public Booking createBooking(Booking booking) {
        // Validate booking
        validateBooking(booking);

        // Check for double booking (simple check: no overlapping bookings for same room)
        List<Booking> existing = repository.findByRoomIdAndStatus(booking.getRoomId(), "CONFIRMED");
        for (Booking b : existing) {
            if (datesOverlap(b.getCheckIn(), b.getCheckOut(), booking.getCheckIn(), booking.getCheckOut())) {
                throw new IllegalArgumentException("Room already booked for these dates");
            }
        }

        // Set initial status
        booking.setStatus("PENDING");
        booking.setCreatedAt(LocalDate.now());
        booking.setUpdatedAt(LocalDate.now());

        // Save to DB
        Booking savedBooking = repository.save(booking);

        try {
            // Call hotel service to reserve room
            String reserveUrl = hotelServiceUrl + "/hotels/" + booking.getHotelId() + "/reserve?roomType=" + booking.getRoomType();
            restTemplate.put(reserveUrl, null);

            // Call payment service to initiate payment
            String paymentUrl = paymentServiceUrl + "/api/payment/create-session";
            PaymentRequest paymentReq = new PaymentRequest(booking.getUserId(), (int)(booking.getTotalPrice() * 100)); // Convert to cents
            PaymentResponse paymentResp = restTemplate.postForObject(paymentUrl, paymentReq, PaymentResponse.class);

            // Update booking with payment ID
            savedBooking.setPaymentId(paymentResp.getSessionId());
            savedBooking.setStatus("CONFIRMED");
            savedBooking.setUpdatedAt(LocalDate.now());
            return repository.save(savedBooking);

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            // Rollback: cancel booking if external calls fail
            savedBooking.setStatus("CANCELLED");
            repository.save(savedBooking);
            throw new RuntimeException("Booking failed: " + e.getResponseBodyAsString());
        }
    }

    public List<Booking> getBookingsByUser(String userId) {
        return repository.findByUserId(userId);
    }

    public Optional<Booking> getBookingById(String id) {
        return repository.findById(id);
    }

    public Booking cancelBooking(String id) {
        Optional<Booking> opt = repository.findById(id);
        if (opt.isEmpty()) {
            throw new IllegalArgumentException("Booking not found");
        }
        Booking booking = opt.get();
        if (!"CONFIRMED".equals(booking.getStatus())) {
            throw new IllegalArgumentException("Cannot cancel non-confirmed booking");
        }

        // Call hotel to release room
        String releaseUrl = hotelServiceUrl + "/hotels/" + booking.getHotelId() + "/release?roomType=" + booking.getRoomType();
        restTemplate.put(releaseUrl, null); // Assuming hotel has a release endpoint

        // Call payment for refund (placeholder)
        // TODO: Implement refund logic

        booking.setStatus("CANCELLED");
        booking.setUpdatedAt(LocalDate.now());
        return repository.save(booking);
    }

    private void validateBooking(Booking booking) {
        if (booking.getCheckIn().isBefore(LocalDate.now()) || booking.getCheckOut().isBefore(booking.getCheckIn())) {
            throw new IllegalArgumentException("Invalid check-in/check-out dates");
        }
        if (booking.getTotalPrice() <= 0) {
            throw new IllegalArgumentException("Invalid total price");
        }
    }

    private boolean datesOverlap(LocalDate start1, LocalDate end1, LocalDate start2, LocalDate end2) {
        return start1.isBefore(end2) && start2.isBefore(end1);
    }

    // Inner classes for payment request/response
    public static class PaymentRequest {
        private String userId;
        private int amount; // in cents

        public PaymentRequest(String userId, int amount) {
            this.userId = userId;
            this.amount = amount;
        }

        // getters
        public String getUserId() { return userId; }
        public int getAmount() { return amount; }
    }

    public static class PaymentResponse {
        private String sessionId;
        private String url;

        // getters and setters
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
    }
}
