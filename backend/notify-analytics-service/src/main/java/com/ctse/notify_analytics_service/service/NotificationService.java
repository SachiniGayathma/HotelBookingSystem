package com.ctse.notify_analytics_service.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    // @Value("${twilio.account.sid}")
    // private String accountSid;

    // @Value("${twilio.auth.token}")
    // private String authToken;

    // @Value("${twilio.whatsapp.number}")
    // private String twilioWhatsappNumber;

    // public void sendBookingSuccessSMS(String toPhoneNumber, String bookingId) {
    //     Twilio.init(accountSid, authToken);
        
    //     // WhatsApp Sandbox template format (Order Notifications)
    //     String messageBody = "Your order " + bookingId + " for Hotel Booking has been confirmed.";

    //     try {
    //         System.out.println("Attempting to send WhatsApp message...");
            
    //         Message whatsapp = Message.creator(
    //                 new PhoneNumber("whatsapp:" + toPhoneNumber), 
    //                 new PhoneNumber("whatsapp:" + twilioWhatsappNumber), 
    //                 messageBody
    //         ).create();
            
    //         System.out.println("WhatsApp Sent Successfully! SID: " + whatsapp.getSid());
            
    //     } catch (Exception e) {
    //         System.out.println("WhatsApp Failed: " + e.getMessage());
    //     }
    // }
}