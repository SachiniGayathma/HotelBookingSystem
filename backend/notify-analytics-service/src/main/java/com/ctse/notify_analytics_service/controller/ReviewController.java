package com.ctse.notify_analytics_service.controller;

import com.ctse.notify_analytics_service.model.Review;
import com.ctse.notify_analytics_service.repository.ReviewRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public ReviewController(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @PostMapping
    public ResponseEntity<?> addReview(@RequestBody Review review) {
        try {
            String bookingUrl = "http://localhost:8080/api/bookings/all";
            Map[] allBookings = restTemplate.getForObject(bookingUrl, Map[].class);
            
            boolean hasBooked = false;

            // Verify if this user has a booking for this specific hotel
            if (allBookings != null) {
                for (Map booking : allBookings) {
                    String bUserId = (String) booking.get("userId");
                    String bHotelId = (String) booking.get("hotelId");
                    
                    if (review.getUserId().equals(bUserId) && review.getHotelId().equals(bHotelId)) {
                        hasBooked = true;
                        break;
                    }
                }
            }

            // Block or Allow the Review
            if (!hasBooked) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Error: You must have a confirmed booking at this hotel to leave a review.");
            }

            Review savedReview = reviewRepository.save(review);
            return ResponseEntity.ok(savedReview);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error verifying booking status: " + e.getMessage());
        }
    }

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<Review>> getReviewsForHotel(@PathVariable String hotelId) {
        return ResponseEntity.ok(reviewRepository.findByHotelId(hotelId));
    }
}