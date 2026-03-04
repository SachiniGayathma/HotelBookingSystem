package com.ctse.hotel_service.Controller;

import java.util.List;

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

import com.ctse.hotel_service.Entities.Hotel;
import com.ctse.hotel_service.Entities.Room;
import com.ctse.hotel_service.Services.HotelService;

@RestController
@RequestMapping("/hotels")
public class HotelController {
    private final HotelService hotelService;

    public HotelController(HotelService hotelService) {
        this.hotelService = hotelService;
    }

    //CREATE
    @PostMapping
    public ResponseEntity<Hotel> createHotel(@RequestBody Hotel hotel) {
        return ResponseEntity.ok(hotelService.addHotel(hotel));
    }

    // READ ALL
    @GetMapping
    public ResponseEntity<List<Hotel>> getAllHotels() {
        return ResponseEntity.ok(hotelService.getAllHotels());
    }

    // READ ONE
    @GetMapping("/{id}")
    public ResponseEntity<Hotel> getHotel(@PathVariable String id) {
        return ResponseEntity.ok(hotelService.getHotelById(id));
    }

    // GET BY HOTEL CODE
    @GetMapping("/code/{hotelCode}")
    public ResponseEntity<Hotel> getByCode(@PathVariable String hotelCode) {
        return ResponseEntity.ok(hotelService.getHotelByCode(hotelCode));
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Hotel> updateHotel(
            @PathVariable String id,
            @RequestBody Hotel hotel) {

        return ResponseEntity.ok(hotelService.updateHotel(id, hotel));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteHotel(@PathVariable String id) {
        hotelService.deleteHotel(id);
        return ResponseEntity.ok("Hotel deleted successfully");
    }

    // SEARCH BY CITY
    @GetMapping("/search")
    public ResponseEntity<List<Hotel>> searchHotels(@RequestParam String city) {
        return ResponseEntity.ok(hotelService.searchByCity(city));
    }

    // SEARCH BY AMENITY
    @GetMapping("/amenity")
    public ResponseEntity<List<Hotel>> searchByAmenity(@RequestParam String amenity) {
        return ResponseEntity.ok(hotelService.searchByAmenity(amenity));
    }

    // ADD ROOM
    @PostMapping("/{id}/rooms")
    public ResponseEntity<Hotel> addRoom(
        @PathVariable String id,
        @RequestBody Room room) {

        return ResponseEntity.ok(hotelService.addRoomToHotel(id, room));
    }

    // CHECK AVAILABILITY
    @GetMapping("/{id}/availability")
    public ResponseEntity<Boolean> checkAvailability(
        @PathVariable String id,
        @RequestParam String roomType) {

        return ResponseEntity.ok(
                hotelService.checkAvailability(id, roomType)
        );
    }

    // RESERVE ROOM
    @PutMapping("/{id}/reserve")
    public ResponseEntity<Hotel> reserveRoom(
            @PathVariable String id,
            @RequestParam String roomType) {
        return ResponseEntity.ok(hotelService.reserveRoom(id, roomType));
    }
    
}
