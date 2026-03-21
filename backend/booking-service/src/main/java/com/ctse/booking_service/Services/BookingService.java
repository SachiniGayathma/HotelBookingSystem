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
    public boolean checkAvailability(String hotelId, String roomType, LocalDate checkIn, LocalDate checkOut, int guests) {
        // Validate dates
        if (checkIn.isBefore(LocalDate.now()) || checkOut.isBefore(checkIn)) {
            throw new IllegalArgumentException("Invalid dates");
        }

        if (guests <= 0 || guests > 6) {
            throw new IllegalArgumentException("Guest count must be between 1 and 6");
        }

        // Call hotel service for availability by room type
        String url = hotelServiceUrl + "/hotels/" + hotelId + "/availability?roomType=" + roomType;
        try {
            Boolean availableAtHotel = restTemplate.getForObject(url, Boolean.class);
            if (availableAtHotel == null) {
                throw new RuntimeException("Hotel service returned empty availability response");
            }
            return availableAtHotel;
        } catch (Exception e) {
            throw new RuntimeException("Hotel service unavailable: " + e.getMessage());
        }
    }

    private double getRoomBasePrice(String roomType) {
        switch (roomType) {
            case "SINGLE":
                return 50.0;
            case "DOUBLE":
                return 90.0;
            case "SUITE":
                return 180.0;
            default:
                return 100.0;
        }
    }

    private double getMealPlanRate(String mealPlan) {
        switch (mealPlan) {
            case "BREAKFAST":
                return 10.0;
            case "HALF_BOARD":
                return 20.0;
            case "FULL_BOARD":
                return 30.0;
            default:
                return 0.0;
        }
    }

    private double calculateTotalPrice(Booking booking) {
        int totalGuests = booking.getGuests();
        int nights = dateDiffInDays(booking.getCheckIn(), booking.getCheckOut());
        if (nights <= 0) {
            throw new IllegalArgumentException("Check-out must be after check-in");
        }

        double basePrice = getRoomBasePrice(booking.getRoomType());
        double roomTotal = basePrice * nights;
        double mealRate = getMealPlanRate(booking.getMealPlan());
        double mealTotal = mealRate * totalGuests * nights;

        double subTotal = roomTotal + mealTotal;
        double serviceFee = subTotal * 0.1; // 10%
        double tax = (subTotal + serviceFee) * 0.12; // 12%

        return Math.round((subTotal + serviceFee + tax) * 100.0) / 100.0;
    }

    private int dateDiffInDays(LocalDate start, LocalDate end) {
        return (int) java.time.Duration.between(start.atStartOfDay(), end.atStartOfDay()).toDays();
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

        // Ensure availability is still true (avoid race conditions)
        boolean available = checkAvailability(booking.getHotelId(), booking.getRoomType(), booking.getCheckIn(), booking.getCheckOut(), booking.getGuests());
        if (!available) {
            throw new IllegalStateException("Room not available when trying to book");
        }

        // Price calculation
        booking.setTotalPrice(calculateTotalPrice(booking));

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
            PaymentRequest paymentReq = new PaymentRequest(booking.getUserId(), (int) (booking.getTotalPrice() * 100)); // Convert to cents
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
