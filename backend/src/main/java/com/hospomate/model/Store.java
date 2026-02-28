package com.hospomate.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "stores")
public class Store {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String name;

    private String address;
    private String imageUrl;
    private Double latitude;
    private Double longitude;

    @Column(name = "opening_time")
    private java.time.LocalTime openingTime = java.time.LocalTime.of(9, 0);

    @Column(name = "closing_time")
    private java.time.LocalTime closingTime = java.time.LocalTime.of(22, 0);

    @Column(precision = 10, scale = 2)
    private BigDecimal revenuePerLabourHourThreshold = new BigDecimal("50.00");

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public BigDecimal getRevenuePerLabourHourThreshold() {
        return revenuePerLabourHourThreshold;
    }

    public void setRevenuePerLabourHourThreshold(BigDecimal revenuePerLabourHourThreshold) {
        this.revenuePerLabourHourThreshold = revenuePerLabourHourThreshold;
    }

    public java.time.LocalTime getOpeningTime() {
        return openingTime;
    }

    public void setOpeningTime(java.time.LocalTime openingTime) {
        this.openingTime = openingTime;
    }

    public java.time.LocalTime getClosingTime() {
        return closingTime;
    }

    public void setClosingTime(java.time.LocalTime closingTime) {
        this.closingTime = closingTime;
    }
}
