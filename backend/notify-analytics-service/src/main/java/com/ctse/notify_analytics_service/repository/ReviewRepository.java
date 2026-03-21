package com.ctse.notify_analytics_service.repository;

import com.ctse.notify_analytics_service.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByHotelId(String hotelId);
}