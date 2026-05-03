package com.ctse.notify_analytics_service.controller;

import com.ctse.notify_analytics_service.model.Review;
import com.ctse.notify_analytics_service.repository.ReviewRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ReviewRepository reviewRepository; // We need this for the Star Ratings!

    public AnalyticsController(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @GetMapping(value = "/dashboard", produces = "application/json")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        try {
            // 1. Fetch Data from all 3 Microservices
            Map[] hotelsArray = restTemplate.getForObject("https://hotel-service-app.jollyforest-5b37db64.southeastasia.azurecontainerapps.io/hotels", Map[].class);
            Map[] bookingsArray = restTemplate.getForObject("https://booking-service-app.jollyforest-5b37db64.southeastasia.azurecontainerapps.io/api/bookings/all", Map[].class);
            List<Review> allReviews = reviewRepository.findAll();

            List<Map> hotels = hotelsArray != null ? Arrays.asList(hotelsArray) : new ArrayList<>();
            List<Map> bookings = bookingsArray != null ? Arrays.asList(bookingsArray) : new ArrayList<>();

            // 2. Global System Variables
            double totalRevenue = 0.0;
            int cancelledCount = 0;
            Map<String, Integer> roomTypeCounts = new HashMap<>();
            Map<String, Integer> mealPlanCounts = new HashMap<>();
            Map<String, Integer> bookingsPerDay = new TreeMap<>(); // TreeMap keeps dates sorted!

            // 3. Setup Per-Hotel Tracking
            Map<String, HotelStat> hotelStatsMap = new HashMap<>();
            for (Map h : hotels) {
                hotelStatsMap.put((String) h.get("id"), new HotelStat((String) h.get("id"), (String) h.get("name")));
            }

            // 4. Process Every Booking
            for (Map b : bookings) {
                String status = (String) b.get("status");
                String hotelId = (String) b.get("hotelId");
                String roomType = (String) b.get("roomType");
                String mealPlan = (String) b.get("mealPlan");
                
                // Safely extract the date string
                String dateStr = "Unknown";
                Object createdAtObj = b.get("createdAt");
                if (createdAtObj instanceof Map) {
                    dateStr = (String) ((Map) createdAtObj).get("$date");
                    if (dateStr != null && dateStr.length() >= 10) dateStr = dateStr.substring(0, 10);
                } else if (createdAtObj instanceof String) {
                    dateStr = ((String) createdAtObj).substring(0, 10);
                }
                
                if ("CONFIRMED".equals(status) || "COMPLETED".equals(status)) {
                    double price = b.get("totalPrice") != null ? Double.parseDouble(b.get("totalPrice").toString()) : 0.0;
                    totalRevenue += price;

                    roomTypeCounts.put(roomType, roomTypeCounts.getOrDefault(roomType, 0) + 1);
                    mealPlanCounts.put(mealPlan, mealPlanCounts.getOrDefault(mealPlan, 0) + 1);
                    bookingsPerDay.put(dateStr, bookingsPerDay.getOrDefault(dateStr, 0) + 1);

                    if (hotelStatsMap.containsKey(hotelId)) {
                        hotelStatsMap.get(hotelId).addBooking(price);
                    }
                } else if ("CANCELLED".equals(status)) {
                    cancelledCount++;
                }
            }

            // 5. Process Reviews for Star Ratings
            for (Review r : allReviews) {
                if (hotelStatsMap.containsKey(r.getHotelId())) {
                    hotelStatsMap.get(r.getHotelId()).addReview(r.getRating());
                }
            }

            // 6. Find the "Most Populars"
            String mostPopularRoom = roomTypeCounts.entrySet().stream().max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("N/A");
            String mostPopularMeal = mealPlanCounts.entrySet().stream().max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("N/A");
            HotelStat mostPopularHotel = hotelStatsMap.values().stream().max(Comparator.comparingInt(HotelStat::getBookingCount)).orElse(null);

            // 7. Package it all into the JSON Response
            stats.put("totalHotels", hotels.size());
            stats.put("totalBookings", bookings.size());
            stats.put("totalRevenue", Math.round(totalRevenue * 100.0) / 100.0);
            stats.put("cancellationRatePercent", bookings.isEmpty() ? 0 : Math.round(((double) cancelledCount / bookings.size()) * 100.0));
            stats.put("mostPopularRoomType", mostPopularRoom);
            stats.put("mostPopularMealPlan", mostPopularMeal);
            stats.put("mostPopularHotelName", mostPopularHotel != null && mostPopularHotel.getBookingCount() > 0 ? mostPopularHotel.getName() : "N/A");
            
            stats.put("bookingsPerDay", bookingsPerDay);
            stats.put("hotelStats", hotelStatsMap.values()); // The specific breakdown per hotel!
            stats.put("status", "success");

        } catch (Exception e) {
            stats.put("status", "error");
            stats.put("message", e.getMessage());
        }

        return ResponseEntity.ok(stats);
    }

    // Inner Class to cleanly format the specific hotel data
    public static class HotelStat {
        private String hotelId;
        private String name;
        private int bookingCount = 0;
        private double revenue = 0.0;
        private int reviewCount = 0;
        private int ratingSum = 0;

        public HotelStat(String hotelId, String name) {
            this.hotelId = hotelId;
            this.name = name;
        }

        public void addBooking(double price) {
            this.bookingCount++;
            this.revenue += price;
        }

        public void addReview(int rating) {
            this.reviewCount++;
            this.ratingSum += rating;
        }

        public String getHotelId() { return hotelId; }
        public String getName() { return name; }
        public int getBookingCount() { return bookingCount; }
        public double getRevenue() { return Math.round(revenue * 100.0) / 100.0; }
        public int getReviewCount() { return reviewCount; }
        public double getAverageRating() {
            return reviewCount == 0 ? 0.0 : Math.round(((double) ratingSum / reviewCount) * 10.0) / 10.0; // Rounds to 1 decimal (e.g., 4.5)
        }
    }
}