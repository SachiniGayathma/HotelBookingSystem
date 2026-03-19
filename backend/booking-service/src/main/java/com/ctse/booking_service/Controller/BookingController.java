package com.ctse.booking_service.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BookingController {
    @GetMapping("/test")
    public String test() {
        return "Booking service running!";
    }
}