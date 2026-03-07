package com.ctse.hotel_service.Entities;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Room {
    @NotNull
    private RoomType roomType; // SINGLE, DOUBLE, SUITE
    private double pricePerNight;
    private int totalRooms;
    private int availableRooms;

}
