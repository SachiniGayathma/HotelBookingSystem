package com.ctse.payment_service.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "payments")
public class Payment {

    @Id
    private String id;

    private String userId;
    private long amount; // in cents
    private String currency;
    private String productName;
    private String stripeSessionId;

    public Payment() {}

    public Payment(String userId, long amount, String currency, String productName, String stripeSessionId) {
        this.userId = userId;
        this.amount = amount;
        this.currency = currency;
        this.productName = productName;
        this.stripeSessionId = stripeSessionId;
    }

    // Getters & Setters
    //checking
    public String getId() { return id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public long getAmount() { return amount; }
    public void setAmount(long amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getStripeSessionId() { return stripeSessionId; }
    public void setStripeSessionId(String stripeSessionId) { this.stripeSessionId = stripeSessionId; }
}