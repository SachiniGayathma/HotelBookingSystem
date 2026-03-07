package com.ctse.hotel_service.Exceptions;

public class InvalidRoomTypeException extends RuntimeException {
    public InvalidRoomTypeException(String message) {
        super(message);
    }
}
