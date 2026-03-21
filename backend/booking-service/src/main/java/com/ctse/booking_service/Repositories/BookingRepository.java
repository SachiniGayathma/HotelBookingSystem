package com.ctse.booking_service.Repositories;

import com.ctse.booking_service.Model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByRoomIdAndStatus(String roomId, String status);
}