package com.ctse.booking_service.Controller;

import com.ctse.booking_service.Model.Booking;
import com.ctse.booking_service.Services.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*") // For frontend integration
@Tag(name = "Booking Management", description = "APIs for managing hotel bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/test")
    @Operation(summary = "Test endpoint", description = "Check if the booking service is running")
    public String test() {
        return "Booking service running!";
    }

    // Check availability
    @GetMapping("/check-availability")
    @Operation(summary = "Check room availability", description = "Check available rooms and prices for given dates and guests")
    @ApiResponse(responseCode = "200", description = "Availability data", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "400", description = "Invalid dates or parameters")
    public ResponseEntity<?> checkAvailability(
            @Parameter(description = "Hotel ID") @RequestParam String hotelId,
            @Parameter(description = "Room type") @RequestParam String roomType,
            @Parameter(description = "Check-in date (YYYY-MM-DD)") @RequestParam String checkIn,
            @Parameter(description = "Check-out date (YYYY-MM-DD)") @RequestParam String checkOut,
            @Parameter(description = "Number of guests") @RequestParam int guests) {
        try {
            LocalDate checkInDate = LocalDate.parse(checkIn);
            LocalDate checkOutDate = LocalDate.parse(checkOut);
            boolean availability = bookingService.checkAvailability(hotelId, roomType, checkInDate, checkOutDate, guests);
            return ResponseEntity.ok(availability);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Create booking
    @PostMapping
    @Operation(summary = "Create a new booking", description = "Create a booking, reserve room, and initiate payment")
    @ApiResponse(responseCode = "200", description = "Booking created", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Booking.class)))
    @ApiResponse(responseCode = "400", description = "Validation error")
    public ResponseEntity<?> createBooking(@RequestBody Booking booking) {
        try {
            Booking created = bookingService.createBooking(booking);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Validation error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Booking failed: " + e.getMessage());
        }
    }

    // Get booking by ID
    @GetMapping("/{id}")
    @Operation(summary = "Get booking by ID", description = "Retrieve a specific booking")
    @ApiResponse(responseCode = "200", description = "Booking found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Booking.class)))
    @ApiResponse(responseCode = "404", description = "Booking not found")
    public ResponseEntity<?> getBooking(@Parameter(description = "Booking ID") @PathVariable String id) {
        Optional<Booking> booking = bookingService.getBookingById(id);
        if (booking.isPresent()) {
            return ResponseEntity.ok(booking.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Get bookings by user
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get bookings by user", description = "Retrieve all bookings for a user")
    @ApiResponse(responseCode = "200", description = "List of bookings", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Booking.class)))
    public ResponseEntity<List<Booking>> getBookingsByUser(@Parameter(description = "User ID") @PathVariable String userId) {
        List<Booking> bookings = bookingService.getBookingsByUser(userId);
        return ResponseEntity.ok(bookings);
    }

    // Cancel booking
    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel a booking", description = "Cancel a confirmed booking and process refund")
    @ApiResponse(responseCode = "200", description = "Booking cancelled", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Booking.class)))
    @ApiResponse(responseCode = "400", description = "Cannot cancel booking")
    public ResponseEntity<?> cancelBooking(@Parameter(description = "Booking ID") @PathVariable String id) {
        try {
            Booking cancelled = bookingService.cancelBooking(id);
            return ResponseEntity.ok(cancelled);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Cancellation failed: " + e.getMessage());
        }
    }

    // --- ADDED FOR ANALYTICS DASHBOARD ---
    @GetMapping("/all")
    @Operation(summary = "Get all bookings", description = "Retrieve all bookings for analytics")
    @ApiResponse(responseCode = "200", description = "List of all bookings")
    public ResponseEntity<java.util.List<Booking>> getAllBookings() {
        java.util.List<Booking> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }
}