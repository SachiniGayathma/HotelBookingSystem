package com.ctse.payment_service.service;

import com.ctse.payment_service.model.Payment;
import com.ctse.payment_service.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    // Save payment
    public Payment savePayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    // Get payments by userId
    public List<Payment> getPaymentsByUserId(String userId) {
        return paymentRepository.findByUserId(userId);
    }

    //Get all payments
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }
}