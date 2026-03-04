package com.ctse.hotel_service.Entities;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;
import org.springframework.data.mongodb.core.index.Indexed;

import java.util.List;

@Document(collection = "hotels")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Hotel {

    @Id
    private String id;

    @Indexed(unique = true)
    private String hotelCode; // e.g., HTL-001

    private String name;
    private String city;
    private String address;
    private double latitude;
    private double longitude;
    private String description;

    private List<String> amenities;
    private List<String> images;

    private List<Room> rooms;
    
}
