package com.ctse.hotel_service.Services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ctse.hotel_service.Entities.Hotel;
import com.ctse.hotel_service.Entities.Room;
import com.ctse.hotel_service.Repositories.HotelRepository;

@Service
public class HotelService {
    private final HotelRepository hotelRepository;

    public HotelService(HotelRepository hotelRepository) {
        this.hotelRepository = hotelRepository;
    }

    //ADD HOTEL
    public Hotel addHotel(Hotel hotel) {
        hotel.setHotelCode("HTL-" + System.currentTimeMillis());
        return hotelRepository.save(hotel);
    }

     // READ ALL
    public List<Hotel> getAllHotels() {
        return hotelRepository.findAll();
    }

    //GET HOTEL BY HOTEL CODE
    public Hotel getHotelByCode(String hotelCode) {
        return hotelRepository.findByHotelCode(hotelCode)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));
    }

    // READ ONE
    public Hotel getHotelById(String id) {
        return hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));
    }

    // UPDATE
    public Hotel updateHotel(String id, Hotel updatedHotel) {

        Hotel existingHotel = getHotelById(id);

        existingHotel.setName(updatedHotel.getName());
        existingHotel.setCity(updatedHotel.getCity());
        existingHotel.setAddress(updatedHotel.getAddress());
        existingHotel.setLatitude(updatedHotel.getLatitude());
        existingHotel.setLongitude(updatedHotel.getLongitude());
        existingHotel.setDescription(updatedHotel.getDescription());
        existingHotel.setAmenities(updatedHotel.getAmenities());
        existingHotel.setImages(updatedHotel.getImages());
        existingHotel.setRooms(updatedHotel.getRooms());

        return hotelRepository.save(existingHotel);
    }

    // DELETE
    public void deleteHotel(String id) {

        if (!hotelRepository.existsById(id)) {
            throw new RuntimeException("Hotel not found");
        }

        hotelRepository.deleteById(id);
    }

    // SEARCH
    public List<Hotel> searchByCity(String city) {
        return hotelRepository.findByCityContainingIgnoreCase(city);
    }

    // SEARCH BY AMENITY
    public List<Hotel> searchByAmenity(String amenity) {
        return hotelRepository.findByAmenitiesContainingIgnoreCase(amenity);
    }

    // ADD ROOM TO HOTEL
    public Hotel addRoomToHotel(String hotelId, Room room) {

        Hotel hotel = getHotelById(hotelId);

        if (hotel.getRooms() == null) {
            hotel.setRooms(new ArrayList<>());
        }

        hotel.getRooms().add(room);

        return hotelRepository.save(hotel);
    }

    // CHECK ROOM AVAILABILITY
    public boolean checkAvailability(String hotelId, String roomType) {
        Hotel hotel = getHotelById(hotelId);

        return hotel.getRooms().stream()
                .filter(room -> room.getRoomType().equalsIgnoreCase(roomType))
                .anyMatch(room -> room.getAvailableRooms() > 0);
    }

    // RESERVE ROOM
    public Hotel reserveRoom(String hotelId, String roomType) {
        Hotel hotel = getHotelById(hotelId);
        hotel.getRooms().forEach(room -> {
            if (room.getRoomType().equalsIgnoreCase(roomType)) {
                if (room.getAvailableRooms() <= 0) {
                    throw new RuntimeException("No rooms available");
                }
                room.setAvailableRooms(room.getAvailableRooms() - 1);
            }
        });
        return hotelRepository.save(hotel);
    }
}
