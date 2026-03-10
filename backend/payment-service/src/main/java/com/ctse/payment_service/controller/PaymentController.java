package com.ctse.payment_service;

import com.ctse.payment_service.model.Payment;
import com.ctse.payment_service.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    // Request body class
    public static class PaymentRequest {
        private Long amount; // in cents
        private String userId;

        public Long getAmount() {
            return amount;
        }

        public void setAmount(Long amount) {
            this.amount = amount;
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }
    }

    // Create Stripe Checkout Session
    @PostMapping("/create-session")
    public Map<String, String> createCheckoutSession(@RequestBody(required = false) PaymentRequest request) throws Exception {

        // Set Stripe API key
        Stripe.apiKey = stripeSecretKey;

        long amount = (request != null && request.getAmount() != null) ? request.getAmount() : 5000L;
        String userId = (request != null && request.getUserId() != null) ? request.getUserId() : "guest";

        SessionCreateParams params =
                SessionCreateParams.builder()
                        .setMode(SessionCreateParams.Mode.PAYMENT)
                        .setSuccessUrl("http://localhost:5173/success")
                        .setCancelUrl("http://localhost:5173/cancel")
                        .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                        .addLineItem(
                                SessionCreateParams.LineItem.builder()
                                        .setQuantity(1L)
                                        .setPriceData(
                                                SessionCreateParams.LineItem.PriceData.builder()
                                                        .setCurrency("usd")
                                                        .setUnitAmount(amount)
                                                        .setProductData(
                                                                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                        .setName("Hotel Booking Payment")
                                                                        .build()
                                                        )
                                                        .build()
                                        )
                                        .build()
                        )
                        .build();

        Session session = Session.create(params);

        // Save payment in MongoDB
        Payment payment = new Payment(userId, amount, "usd", "Hotel Booking Payment", session.getId());
        paymentRepository.save(payment);

        Map<String, String> response = new HashMap<>();
        response.put("url", session.getUrl());

        return response;
    }

    // Get payment history for a user
    @GetMapping("/history/{userId}")
    public List<Payment> getPaymentHistory(@PathVariable String userId) {
        return paymentRepository.findByUserId(userId);
    }

    // Get all payments
    @GetMapping("/all")
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }
}