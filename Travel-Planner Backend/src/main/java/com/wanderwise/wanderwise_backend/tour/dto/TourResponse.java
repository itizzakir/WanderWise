package com.wanderwise.wanderwise_backend.tour.dto;

import com.wanderwise.wanderwise_backend.tour.Tour;
import java.util.List;

public record TourResponse(
        Long id,
        String destination,
        String country,
        String category,
        String description,
        Integer duration,
        String img,
        String slug,
        List<String> plan,
        WeatherProfile weatherProfile
) {
    public static TourResponse fromEntity(Tour tour) {
        return new TourResponse(
                tour.getId(),
                tour.getDestination(),
                tour.getCountry(),
                tour.getCategory(),
                tour.getDescription(),
                tour.getDuration(),
                tour.getImg(),
                tour.getSlug(),
                tour.getPlan(),
                new WeatherProfile(
                        tour.getWeatherProfile().getBaseTemp(),
                        tour.getWeatherProfile().getBaseHumidity(),
                        tour.getWeatherProfile().getBaseWind(),
                        tour.getWeatherProfile().getDefaultCondition()
                )
        );
    }

    public record WeatherProfile(
            Integer baseTemp,
            Integer baseHumidity,
            Integer baseWind,
            String defaultCondition
    ) {
    }
}
