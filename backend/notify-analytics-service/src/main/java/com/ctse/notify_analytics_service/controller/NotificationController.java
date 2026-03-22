package com.ctse.notify_analytics_service.controller;

import com.ctse.notify_analytics_service.model.BookingPayload;
import com.ctse.notify_analytics_service.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    // private final NotificationService notificationService;

    // public NotificationController(NotificationService notificationService) {
    //     this.notificationService = notificationService;
    // }

    // @PostMapping("/booking-success")
    // public ResponseEntity<String> handleBookingSuccess(@RequestBody BookingPayload data) {
    //     System.out.println("Webhook hit for Booking: " + data.getId());
        
    //     String myPhoneNumber = "+94718640652"; 
        
    //     notificationService.sendBookingSuccessSMS(myPhoneNumber, data.getId());
    //     return ResponseEntity.ok("Notification Processed");
    // }
}