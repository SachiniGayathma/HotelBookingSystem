package com.ctse.hotel_service.Entities;

import jakarta.validation.constraints.NotNull;

public class Room {
    @NotNull
    private RoomType roomType; // SINGLE, DOUBLE, SUITE
    private double pricePerNight;
    private int totalRooms;
    private int availableRooms;

    public Room() {
    }

    public Room(RoomType roomType, double pricePerNight, int totalRooms, int availableRooms) {
        this.roomType = roomType;
        this.pricePerNight = pricePerNight;
        this.totalRooms = totalRooms;
        this.availableRooms = availableRooms;
    }

    public RoomType getRoomType() {
        return roomType;
    }

    public void setRoomType(RoomType roomType) {
        this.roomType = roomType;
    }

    public double getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(double pricePerNight) {
        this.pricePerNight = pricePerNight;
    }

    public int getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(int totalRooms) {
        this.totalRooms = totalRooms;
    }

    public int getAvailableRooms() {
        return availableRooms;
    }

    public void setAvailableRooms(int availableRooms) {
        this.availableRooms = availableRooms;
    }

}
