package com.ctse.payment_service.repository;

import com.ctse.payment_service.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PaymentRepository extends MongoRepository<Payment, String> {
    // find payments by userId
    List<Payment> findByUserId(String userId);
}