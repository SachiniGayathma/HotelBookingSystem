package com.ctse.hotel_service.Entities;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;
import org.springframework.data.mongodb.core.index.Indexed;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

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

    @NotBlank
    private String name;

    @NotBlank
    private String city;

    @NotBlank
    private String address;

    private double latitude;
    
    private double longitude;

    @NotBlank
    private String description;

    private List<Amenity> amenities;

    private List<String> images;

    private List<Room> rooms;

}
