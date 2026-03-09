package com.ctse.payment_service.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "payments")
public class Payment {

    @Id
    private String id;
    private String orderId;
    private String paymentId;
    private String status;
    private double amount;
    private String currency;

    public Payment() {}

    // Getters
    public String getId() { return id; }
    public String getOrderId() { return orderId; }
    public String getPaymentId() { return paymentId; }
    public String getStatus() { return status; }
    public double getAmount() { return amount; }
    public String getCurrency() { return currency; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }
    public void setStatus(String status) { this.status = status; }
    public void setAmount(double amount) { this.amount = amount; }
    public void setCurrency(String currency) { this.currency = currency; }
}