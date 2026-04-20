package com.wanderwise.wanderwise_backend.hotel;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "hotels",
        indexes = {
                @Index(name = "idx_hotel_destination_country", columnList = "destination,country"),
                @Index(name = "idx_hotel_price_per_night", columnList = "price_per_night")
        }
)
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 180)
    private String name;

    @Column(nullable = false, length = 120)
    private String destination;

    @Column(nullable = false, length = 120)
    private String country;

    @Column(nullable = false, length = 450)
    private String address;

    @Column(name = "price_per_night", nullable = false, precision = 12, scale = 2)
    private BigDecimal pricePerNight;

    @Column(nullable = false, length = 10)
    private String currency;

    @Column(nullable = false, precision = 2, scale = 1)
    private BigDecimal rating;

    @Column(nullable = false, length = 1600)
    private String img;

    @Column(nullable = false, unique = true, length = 280)
    private String slug;

    @Builder.Default
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "hotel_amenities", joinColumns = @JoinColumn(name = "hotel_id"))
    @Column(name = "amenity", nullable = false, length = 80)
    private List<String> amenities = new ArrayList<>();

    @PrePersist
    @PreUpdate
    public void normalizeFields() {
        name = name != null ? name.trim() : "";
        destination = destination != null ? destination.trim() : "";
        country = country != null ? country.trim() : "";
        address = address != null ? address.trim() : "";
        img = img != null ? img.trim() : "";
        currency = currency == null || currency.isBlank() ? "INR" : currency.trim().toUpperCase();

        if (pricePerNight == null || pricePerNight.compareTo(BigDecimal.ZERO) <= 0) {
            pricePerNight = new BigDecimal("18000.00");
        }

        if (rating == null || rating.compareTo(BigDecimal.ONE) < 0 || rating.compareTo(new BigDecimal("5.0")) > 0) {
            rating = new BigDecimal("4.0");
        }

        if (amenities == null) {
            amenities = new ArrayList<>();
        } else {
            amenities = new ArrayList<>(amenities.stream()
                    .filter(entry -> entry != null && !entry.isBlank())
                    .map(String::trim)
                    .toList());
        }

        if (slug == null || slug.isBlank()) {
            slug = buildSlug(name, destination, country);
        }
    }

    public static String buildSlug(String name, String destination, String country) {
        String input = (name == null ? "" : name) + "-" + (destination == null ? "" : destination)
                + "-" + (country == null ? "" : country);
        String slugValue = input
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+|-+$)", "");

        return slugValue.isEmpty() ? "hotel" : slugValue;
    }
}
