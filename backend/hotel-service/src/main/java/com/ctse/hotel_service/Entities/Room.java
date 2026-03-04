package com.ctse.hotel_service.Entities;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Room {
    private String roomType;  // SINGLE, DOUBLE, SUITE
    private double pricePerNight;
    private int totalRooms;
    private int availableRooms;
    
}
