package com.ctse.payment_service.service;

import com.ctse.payment_service.model.Payment;
import com.ctse.payment_service.repository.PaymentRepository;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository){
        this.paymentRepository = paymentRepository;
    }

    public Payment savePayment(Payment payment){
        return paymentRepository.save(payment);
    }

    public Payment getPaymentByOrderId(String orderId){
        return paymentRepository.findByOrderId(orderId);
    }
}