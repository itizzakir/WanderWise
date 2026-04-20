package com.wanderwise.wanderwise_backend.tour;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embedded;
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
        name = "tours",
        indexes = {
                @Index(name = "idx_tour_destination", columnList = "destination"),
                @Index(name = "idx_tour_destination_country", columnList = "destination,country")
        }
)
public class Tour {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 140)
    private String destination;

    @Column(nullable = false, length = 140)
    private String country;

    @Column(nullable = false, length = 60)
    private String category;

    @Column(nullable = false, length = 1200)
    private String description;

    @Column(nullable = false)
    private Integer duration;

    @Column(nullable = false, length = 1600)
    private String img;

    @Column(nullable = false, unique = true, length = 220)
    private String slug;

    @Builder.Default
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "tour_plan", joinColumns = @JoinColumn(name = "tour_id"))
    @Column(name = "plan_line", nullable = false, length = 400)
    private List<String> plan = new ArrayList<>();

    @Embedded
    private TourWeatherProfile weatherProfile;

    @PrePersist
    @PreUpdate
    public void normalizeFields() {
        destination = destination != null ? destination.trim() : "";
        country = country != null ? country.trim() : "";
        category = category != null ? category.trim() : "Adventure";
        description = description != null ? description.trim() : "";
        img = img != null ? img.trim() : "";

        if (duration == null || duration < 1) {
            duration = 1;
        }

        if (plan == null) {
            plan = new ArrayList<>();
        }

        if (weatherProfile == null) {
            weatherProfile = TourWeatherProfile.builder()
                    .baseTemp(20)
                    .baseHumidity(50)
                    .baseWind(10)
                    .defaultCondition("Partly Cloudy")
                    .build();
        } else {
            if (weatherProfile.getBaseTemp() == null) {
                weatherProfile.setBaseTemp(20);
            }
            if (weatherProfile.getBaseHumidity() == null) {
                weatherProfile.setBaseHumidity(50);
            }
            if (weatherProfile.getBaseWind() == null) {
                weatherProfile.setBaseWind(10);
            }
            if (weatherProfile.getDefaultCondition() == null || weatherProfile.getDefaultCondition().isBlank()) {
                weatherProfile.setDefaultCondition("Partly Cloudy");
            }
        }

        if (slug == null || slug.isBlank()) {
            slug = buildSlug(destination, country);
        }
    }

    public static String buildSlug(String destination, String country) {
        String input = (destination == null ? "" : destination) + "-" + (country == null ? "" : country);
        String slugValue = input
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+|-+$)", "");

        return slugValue.isEmpty() ? "tour" : slugValue;
    }
}
