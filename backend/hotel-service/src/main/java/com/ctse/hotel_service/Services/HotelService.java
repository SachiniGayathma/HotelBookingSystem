package com.ctse.hotel_service.Services;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;

import com.ctse.hotel_service.Entities.Amenity;
import com.ctse.hotel_service.Entities.Hotel;
import com.ctse.hotel_service.Entities.Room;
import com.ctse.hotel_service.Exceptions.HotelNotFoundException;
import com.ctse.hotel_service.Exceptions.InvalidAmenityException;
import com.ctse.hotel_service.Exceptions.InvalidRoomTypeException;
import com.ctse.hotel_service.Exceptions.NoRoomsAvailableException;
import com.ctse.hotel_service.Repositories.HotelRepository;

@Service
public class HotelService {
    private static final String HOTEL_CODE_PREFIX = "HTL-";
    private static final int HOTEL_CODE_PADDING = 3;

    private final HotelRepository hotelRepository;

    public HotelService(HotelRepository hotelRepository) {
        this.hotelRepository = hotelRepository;
    }

    // ADD HOTEL
    public synchronized Hotel addHotel(Hotel hotel) {
        hotel.setHotelCode(generateNextHotelCode());
        return hotelRepository.save(hotel);
    }

    private String generateNextHotelCode() {
        int nextCodeNumber = hotelRepository.findAll().stream()
                .map(Hotel::getHotelCode)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(code -> code.startsWith(HOTEL_CODE_PREFIX))
                .mapToInt(this::extractCodeNumber)
                .max()
                .orElse(0) + 1;

        return HOTEL_CODE_PREFIX + String.format("%0" + HOTEL_CODE_PADDING + "d", nextCodeNumber);
    }

    private int extractCodeNumber(String hotelCode) {
        String numericPart = hotelCode.substring(HOTEL_CODE_PREFIX.length());
        try {
            return Integer.parseInt(numericPart);
        } catch (NumberFormatException ex) {
            return 0;
        }
    }

    // READ ALL
    public List<Hotel> getAllHotels() {
        return hotelRepository.findAll();
    }

    // GET HOTEL BY HOTEL CODE
    public Hotel getHotelByCode(String hotelCode) {
        return hotelRepository.findByHotelCode(hotelCode)
                .orElseThrow(() -> new HotelNotFoundException("Hotel not found: " + hotelCode));
    }

    // READ ONE
    public Hotel getHotelById(String id) {
        return hotelRepository.findById(id)
                .orElseThrow(() -> new HotelNotFoundException("Hotel not found: " + id));
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
            throw new HotelNotFoundException("Hotel not found: " + id);
        }

        hotelRepository.deleteById(id);
    }

    // SEARCH
    public List<Hotel> searchByCity(String city) {
        return hotelRepository.findByCityContainingIgnoreCase(city);
    }

    // SEARCH BY AMENITY
    public List<Hotel> searchByAmenity(String amenity) {
        if (amenity == null || amenity.isBlank()) {
            throw new InvalidAmenityException("Amenity is required");
        }

        Amenity amenityEnum;
        try {
            amenityEnum = Amenity.valueOf(amenity.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new InvalidAmenityException("Invalid amenity: " + amenity);
        }

        return hotelRepository.findByAmenities(amenityEnum);
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

    // CHECK ROOM AVAILABILITY COUNT
    public int checkAvailability(String hotelId, String roomType) {
        Hotel hotel = getHotelById(hotelId);

        if (roomType == null || roomType.isBlank()) {
            throw new InvalidRoomTypeException("Room type is required");
        }

        if (hotel.getRooms() == null) {
            return 0;
        }

        return hotel.getRooms().stream()
                .filter(room -> room.getRoomType().name().equalsIgnoreCase(roomType))
                .mapToInt(Room::getAvailableRooms)
                .sum();
    }

    // RESERVE ROOM
    public Hotel reserveRoom(String hotelId, String roomType) {
        Hotel hotel = getHotelById(hotelId);

        if (roomType == null || roomType.isBlank()) {
            throw new InvalidRoomTypeException("Room type is required");
        }

        if (hotel.getRooms() == null) {
            throw new NoRoomsAvailableException("No rooms available");
        }

        boolean roomTypeFound = false;

        for (Room room : hotel.getRooms()) {
            if (room.getRoomType().name().equalsIgnoreCase(roomType)) {
                roomTypeFound = true;
                if (room.getAvailableRooms() <= 0) {
                    throw new NoRoomsAvailableException("No rooms available for room type: " + roomType);
                }
                room.setAvailableRooms(room.getAvailableRooms() - 1);
                break;
            }
        }

        if (!roomTypeFound) {
            throw new InvalidRoomTypeException("Invalid room type: " + roomType);
        }

        return hotelRepository.save(hotel);
    }
}
