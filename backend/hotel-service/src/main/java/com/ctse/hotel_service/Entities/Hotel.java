package com.ctse.hotel_service.Entities;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

import java.util.List;

@Document(collection = "hotels")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Hotel {

    @Id
    private String id;

    private String name;
    private String location;
    private String description;

    private List<String> amenities;
    private List<String> images;

    private List<Room> rooms;
    
}
