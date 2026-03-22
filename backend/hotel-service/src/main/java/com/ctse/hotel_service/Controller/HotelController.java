package com.ctse.hotel_service.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import jakarta.validation.Valid;

import com.ctse.hotel_service.Dto.HotelWriteRequest;
import com.ctse.hotel_service.Dto.RoomWriteRequest;
import com.ctse.hotel_service.Entities.Hotel;
import com.ctse.hotel_service.Services.HotelService;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/hotels")
@CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173" })
public class HotelController {
    private final HotelService hotelService;

    public HotelController(HotelService hotelService) {
        this.hotelService = hotelService;
    }

    // CREATE
    @Operation(summary = "Create a new hotel")
    @PostMapping
    public ResponseEntity<Hotel> createHotel(@Valid @RequestBody HotelWriteRequest request) {
        return ResponseEntity.ok(hotelService.addHotel(request));
    }

    // READ ALL
    @Operation(summary = "Get all hotels")
    @GetMapping
    public ResponseEntity<List<Hotel>> getAllHotels() {
        return ResponseEntity.ok(hotelService.getAllHotels());
    }

    // READ ONE
    @Operation(summary = "Get a hotel by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Hotel> getHotel(@PathVariable String id) {
        return ResponseEntity.ok(hotelService.getHotelById(id));
    }

    // GET BY HOTEL CODE
    @Operation(summary = "Get a hotel by hotel code")
    @GetMapping("/code/{hotelCode}")
    public ResponseEntity<Hotel> getByCode(@PathVariable String hotelCode) {
        return ResponseEntity.ok(hotelService.getHotelByCode(hotelCode));
    }

    // UPDATE
    @Operation(summary = "Update a hotel")
    @PutMapping("/{id}")
    public ResponseEntity<Hotel> updateHotel(
            @PathVariable String id,
            @Valid @RequestBody HotelWriteRequest request) {

        return ResponseEntity.ok(hotelService.updateHotel(id, request));
    }

    // DELETE
    @Operation(summary = "Delete a hotel")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteHotel(@PathVariable String id) {
        hotelService.deleteHotel(id);
        return ResponseEntity.ok("Hotel deleted successfully");
    }

    // SEARCH BY CITY
    @Operation(summary = "Search hotels by city")
    @GetMapping("/search")
    public ResponseEntity<List<Hotel>> searchHotels(@RequestParam String city) {
        return ResponseEntity.ok(hotelService.searchByCity(city));
    }

    // SEARCH BY AMENITY
    @Operation(summary = "Search hotels by amenity")
    @GetMapping("/amenity")
    public ResponseEntity<List<Hotel>> searchByAmenity(@RequestParam String amenity) {
        return ResponseEntity.ok(hotelService.searchByAmenity(amenity));
    }

    // ADD ROOM
    @Operation(summary = "Add a room to a hotel")
    @PostMapping("/{id}/rooms")
    public ResponseEntity<Hotel> addRoom(
            @PathVariable String id,
            @Valid @RequestBody RoomWriteRequest request) {

        return ResponseEntity.ok(hotelService.addRoomToHotel(id, request));
    }

    // CHECK AVAILABILITY
    @Operation(summary = "Check room availability")
    @GetMapping("/{id}/availability")
    public ResponseEntity<Map<String, Integer>> checkAvailability(
            @PathVariable String id,
            @RequestParam String roomType) {

        int availableRooms = hotelService.checkAvailability(id, roomType);
        return ResponseEntity.ok(Map.of("availableRooms", availableRooms));
    }

    // RESERVE ROOM
    @Operation(summary = "Reserve a room")
    @PutMapping("/{id}/reserve")
    public ResponseEntity<Hotel> reserveRoom(
            @PathVariable String id,
            @RequestParam String roomType) {
        return ResponseEntity.ok(hotelService.reserveRoom(id, roomType));
    }

}
