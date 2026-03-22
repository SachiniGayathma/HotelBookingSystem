package com.ctse.booking_service.Services;

import com.ctse.booking_service.Model.Booking;
import com.ctse.booking_service.Repositories.BookingRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

import java.time.LocalDate;
import java.util.Map;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {
    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);
    private static final String DEFAULT_HOTEL_SERVICE_URL = "https://hotel-service-app.jollyforest-5b37db64.southeastasia.azurecontainerapps.io";
    private static final String DEFAULT_PAYMENT_SERVICE_URL = "https://payment-service-app.jollyforest-5b37db64.southeastasia.azurecontainerapps.io";

    private final BookingRepository repository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${booking.hotel.service.url:${hotel.service.url:https://hotel-service-app.jollyforest-5b37db64.southeastasia.azurecontainerapps.io}}")
    private String hotelServiceUrl;

    @Value("${booking.payment.service.url:${payment.service.url:https://payment-service-app.jollyforest-5b37db64.southeastasia.azurecontainerapps.io}}")
    private String paymentServiceUrl;

    public BookingService(BookingRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    public void normalizeConfiguredServiceUrls() {
        hotelServiceUrl = normalizeServiceUrl(hotelServiceUrl, DEFAULT_HOTEL_SERVICE_URL);
        paymentServiceUrl = normalizeServiceUrl(paymentServiceUrl, DEFAULT_PAYMENT_SERVICE_URL);
        logger.info("Resolved booking service dependencies: hotelServiceUrl={}, paymentServiceUrl={}", hotelServiceUrl, paymentServiceUrl);
    }

    private String normalizeServiceUrl(String configuredUrl, String fallbackUrl) {
        if (configuredUrl == null || configuredUrl.isBlank()) {
            return fallbackUrl;
        }

        String normalized = configuredUrl.trim();
        String lower = normalized.toLowerCase();
        if (lower.contains("localhost") || lower.contains("127.0.0.1")) {
            return fallbackUrl;
        }
        return normalized;
    }

    // Check availability by calling hotel service.
    // Hotel service may return either a room count (int) or a boolean.
    public int checkAvailability(String hotelId, String roomType, LocalDate checkIn, LocalDate checkOut, int guests) {
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
            Object availabilityResponse = restTemplate.getForObject(url, Object.class);
            if (availabilityResponse == null) {
                throw new RuntimeException("Hotel service returned empty availability response");
            }

            if (availabilityResponse instanceof Number) {
                return Math.max(0, ((Number) availabilityResponse).intValue());
            }

            if (availabilityResponse instanceof Boolean) {
                return ((Boolean) availabilityResponse) ? 1 : 0;
            }

            if (availabilityResponse instanceof String) {
                String value = ((String) availabilityResponse).trim();
                if ("true".equalsIgnoreCase(value)) {
                    return 1;
                }
                if ("false".equalsIgnoreCase(value)) {
                    return 0;
                }
                return Math.max(0, Integer.parseInt(value));
            }

            if (availabilityResponse instanceof Map<?, ?>) {
                Object availableRooms = ((Map<?, ?>) availabilityResponse).get("availableRooms");
                if (availableRooms instanceof Number) {
                    return Math.max(0, ((Number) availableRooms).intValue());
                }
                if (availableRooms instanceof String) {
                    return Math.max(0, Integer.parseInt(((String) availableRooms).trim()));
                }
                throw new RuntimeException("Hotel availability payload missing numeric availableRooms field");
            }

            throw new RuntimeException("Unsupported availability response type: " + availabilityResponse.getClass().getSimpleName());
        } catch (Exception e) {
            throw new RuntimeException("Hotel service unavailable: " + e.getMessage());
        }
    }

    private double getRoomBasePrice(String hotelId, String roomType) {
        String url = hotelServiceUrl + "/hotels/" + hotelId;
        try {
            Object hotelResponse = restTemplate.getForObject(url, Object.class);
            if (!(hotelResponse instanceof Map<?, ?>)) {
                throw new RuntimeException("Invalid hotel response payload");
            }

            Object roomsObject = ((Map<?, ?>) hotelResponse).get("rooms");
            if (!(roomsObject instanceof List<?>)) {
                throw new RuntimeException("Hotel response missing rooms data");
            }

            for (Object roomObj : (List<?>) roomsObject) {
                if (!(roomObj instanceof Map<?, ?>)) {
                    continue;
                }
                Map<?, ?> room = (Map<?, ?>) roomObj;
                String type = String.valueOf(room.get("roomType"));
                if (!roomType.equalsIgnoreCase(type)) {
                    continue;
                }

                Object priceObject = room.get("pricePerNight");
                if (priceObject instanceof Number) {
                    return ((Number) priceObject).doubleValue();
                }
                if (priceObject instanceof String) {
                    return Double.parseDouble(((String) priceObject).trim());
                }
                throw new RuntimeException("Room price is missing for room type " + roomType);
            }

            throw new RuntimeException("Room type not found in hotel: " + roomType);
        } catch (Exception e) {
            throw new RuntimeException("Failed to load room pricing from hotel service: " + e.getMessage());
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

        double basePrice = getRoomBasePrice(booking.getHotelId(), booking.getRoomType());
        double roomCharge = basePrice * nights;
        double mealRate = getMealPlanRate(booking.getMealPlan());
        double mealCharge = mealRate * totalGuests * nights;
        double serviceCharge = roomCharge * 0.1; // 10% of room charge
        double taxCharge = roomCharge * 0.12; // 12% of room charge

        return Math.round((roomCharge + mealCharge + serviceCharge + taxCharge) * 100.0) / 100.0;
    }

    private int dateDiffInDays(LocalDate start, LocalDate end) {
        return (int) java.time.Duration.between(start.atStartOfDay(), end.atStartOfDay()).toDays();
    }

    public Booking createBooking(Booking booking) {
        // Validate booking
        validateBooking(booking);

        // Ensure availability is still true (avoid race conditions)
        int availableRooms = checkAvailability(booking.getHotelId(), booking.getRoomType(), booking.getCheckIn(), booking.getCheckOut(), booking.getGuests());
        if (availableRooms <= 0) {
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

            if (paymentResp == null) {
                throw new RuntimeException("Payment service returned empty response");
            }

            // Payment service currently returns only "url"; keep compatibility if "sessionId" is absent.
            String externalPaymentRef = paymentResp.getSessionId();
            if (externalPaymentRef == null || externalPaymentRef.isBlank()) {
                externalPaymentRef = paymentResp.getUrl();
            }

            // Update booking with payment ID
            savedBooking.setPaymentId(externalPaymentRef);
            savedBooking.setStatus("CONFIRMED");
            savedBooking.setUpdatedAt(LocalDate.now());

            // --- ADDED FOR NOTIFICATION SERVICE (START) ---
            try {
                System.out.println("Triggering Notification Webhook...");
                org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
                String notifyUrl = "http://localhost:8084/notifications/booking-success";
                restTemplate.postForObject(notifyUrl, savedBooking, String.class);
            } catch (Exception ex) {
                System.out.println("Webhook failed, but booking succeeded: " + ex.getMessage());
            }
            // -------------------------------------------------

            return repository.save(savedBooking);

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            // Rollback: cancel booking if external calls fail
            savedBooking.setStatus("CANCELLED");
            repository.save(savedBooking);
            throw new RuntimeException("Booking failed: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            savedBooking.setStatus("CANCELLED");
            repository.save(savedBooking);
            throw new RuntimeException("Booking failed: " + e.getMessage());
        }
    }

    public PriceQuote quoteBooking(Booking booking) {
        validateBooking(booking);
        double totalPriceUsd = calculateTotalPrice(booking);
        long paymentAmountMinorUnits = Math.max(50L, Math.round(totalPriceUsd * 100.0));
        return new PriceQuote(totalPriceUsd, paymentAmountMinorUnits, "usd");
    }

    public Booking completeBookingAfterPayment(Booking booking) {
        validateBooking(booking);

        int availableRooms = checkAvailability(booking.getHotelId(), booking.getRoomType(), booking.getCheckIn(), booking.getCheckOut(), booking.getGuests());
        if (availableRooms <= 0) {
            throw new IllegalStateException("Room not available when trying to finalize booking");
        }

        if (booking.getPaymentId() == null || booking.getPaymentId().isBlank()) {
            throw new IllegalArgumentException("Payment reference is required to complete booking");
        }

        String reserveUrl = hotelServiceUrl + "/hotels/" + booking.getHotelId() + "/reserve?roomType=" + booking.getRoomType();
        restTemplate.put(reserveUrl, null);

        booking.setTotalPrice(calculateTotalPrice(booking));
        booking.setStatus("COMPLETED");
        booking.setCreatedAt(LocalDate.now());
        booking.setUpdatedAt(LocalDate.now());

        return repository.save(booking);
    }

    // --- ADDED FOR ANALYTICS DASHBOARD ---
    public java.util.List<Booking> getAllBookings() {
        return repository.findAll();
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
        if (booking.getGuests() <= 0) {
            throw new IllegalArgumentException("Invalid guest count");
        }
        if (booking.getHotelId() == null || booking.getHotelId().isBlank()) {
            throw new IllegalArgumentException("Hotel ID is required");
        }
        if (booking.getRoomType() == null || booking.getRoomType().isBlank()) {
            throw new IllegalArgumentException("Room type is required");
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

    public static class PriceQuote {
        private final double totalPriceUsd;
        private final long paymentAmountMinorUnits;
        private final String paymentCurrency;

        public PriceQuote(double totalPriceUsd, long paymentAmountMinorUnits, String paymentCurrency) {
            this.totalPriceUsd = totalPriceUsd;
            this.paymentAmountMinorUnits = paymentAmountMinorUnits;
            this.paymentCurrency = paymentCurrency;
        }

        // Backward-compatible field name for existing frontend code paths.
        public double getTotalPrice() {
            return totalPriceUsd;
        }

        // Backward-compatible field name for existing frontend code paths.
        public long getAmountCents() {
            return paymentAmountMinorUnits;
        }

        public double getTotalPriceUsd() {
            return totalPriceUsd;
        }

        public long getPaymentAmountMinorUnits() {
            return paymentAmountMinorUnits;
        }

        public String getPaymentCurrency() {
            return paymentCurrency;
        }
    }
}
