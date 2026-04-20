package com.wanderwise.wanderwise_backend.tour.seed;

import java.util.List;

public record TourSeedItem(
        String country,
        String destination,
        String category,
        String description,
        Integer duration,
        String img,
        List<String> plan,
        WeatherProfileSeed weatherProfile
) {
    public record WeatherProfileSeed(
            Integer baseTemp,
            Integer baseHumidity,
            Integer baseWind,
            String defaultCondition
    ) {
    }
}
