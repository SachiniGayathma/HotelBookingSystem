package com.ctse.payment_service.repository;

import com.ctse.payment_service.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PaymentRepository extends MongoRepository<Payment, String> {
    Payment findByOrderId(String orderId);
}