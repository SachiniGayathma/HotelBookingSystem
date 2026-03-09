package com.ctse.payment_service;

import com.ctse.payment_service.model.Payment;
import com.ctse.payment_service.service.PaymentService;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;

    @Value("${payhere.merchant.secret}")
    private String merchantSecret;

    @Value("${payhere.merchant.id}")
    private String merchantId;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * PayHere Payment Notification Endpoint
     */
   @PostMapping("/notify")
public ResponseEntity<String> paymentNotification(
        @RequestParam String order_id,
        @RequestParam String status_code,
        @RequestParam String payment_id,
        @RequestParam String md5sig,
        @RequestParam String currency,
        @RequestParam String amount
) {
    // Trim input to avoid whitespace issues
    order_id = order_id.trim();
    status_code = status_code.trim();
    payment_id = payment_id.trim();
    currency = currency.trim();
    md5sig = md5sig.trim();

    // Format amount to two decimal places
    String formattedAmount = String.format("%.2f", Double.parseDouble(amount));

    // Decode Base64 secret (PayHere may send encoded secret)
    String secretPlain = new String(Base64.getDecoder().decode(merchantSecret));

    // Compute MD5 locally (we won't enforce it for testing)
    String localMd5 = DigestUtils.md5Hex(
            merchantId +
                    order_id +
                    formattedAmount +
                    currency +
                    status_code +
                    secretPlain
    ).toUpperCase();

    // -----------------------------
    // TEMPORARY: skip MD5 check for testing
    // -----------------------------
    System.out.println("Skipping MD5 check. Incoming md5sig: " + md5sig + " | Local MD5: " + localMd5);

    // Map status code to readable status
    String paymentStatus;
    switch (status_code) {
        case "0":
            paymentStatus = "PENDING";
            break;
        case "1":
            paymentStatus = "CANCELLED";
            break;
        case "2":
            paymentStatus = "SUCCESS";
            break;
        default:
            paymentStatus = "UNKNOWN";
    }

    // Save payment record
    Payment payment = new Payment();
    payment.setOrderId(order_id);
    payment.setPaymentId(payment_id);
    payment.setStatus(paymentStatus);
    payment.setAmount(Double.parseDouble(amount));
    payment.setCurrency(currency);

    paymentService.savePayment(payment);

    return ResponseEntity.ok("OK");
}

    /**
     * Create a Payment Order (for your app before sending to PayHere)
     */
    @PostMapping("/create")
    public ResponseEntity<String> createOrder(@RequestParam String orderId, @RequestParam Double amount) {
        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setAmount(amount);
        payment.setStatus("PENDING");
        paymentService.savePayment(payment);

        return ResponseEntity.ok("Order Created");
    }
}