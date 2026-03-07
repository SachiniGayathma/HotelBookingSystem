package com.ctse.hotel_service.Repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

import com.ctse.hotel_service.Entities.Amenity;
import com.ctse.hotel_service.Entities.Hotel;

public interface HotelRepository extends MongoRepository<Hotel, String> {
     List<Hotel> findByCityContainingIgnoreCase(String city);

     List<Hotel> findByAmenities(Amenity amenity);

     Optional<Hotel> findByHotelCode(String hotelCode);
}
