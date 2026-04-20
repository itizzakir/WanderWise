package com.wanderwise.wanderwise_backend.tour.seed;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wanderwise.wanderwise_backend.tour.Tour;
import com.wanderwise.wanderwise_backend.tour.TourRepository;
import com.wanderwise.wanderwise_backend.tour.TourWeatherProfile;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class TourSeedRunner implements CommandLineRunner {

    private final TourRepository tourRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        List<TourSeedItem> seedItems = readSeedItems();
        if (seedItems.isEmpty()) {
            log.warn("No tours loaded from seed/all-tours.json");
            return;
        }

        Set<String> seedSlugs = new HashSet<>();
        for (TourSeedItem item : seedItems) {
            seedSlugs.add(Tour.buildSlug(item.destination(), item.country()));
        }

        List<Tour> existingTours = tourRepository.findAll();
        Map<String, Tour> existingBySlug = new HashMap<>();
        for (Tour tour : existingTours) {
            existingBySlug.put(tour.getSlug(), tour);
        }

        int removedTomorrowlandVariantCount = 0;
        for (Tour tour : existingTours) {
            if (isTomorrowlandTour(tour) && !seedSlugs.contains(tour.getSlug())) {
                tourRepository.delete(tour);
                removedTomorrowlandVariantCount += 1;
            }
        }

        int upsertCount = 0;
        for (TourSeedItem item : seedItems) {
            String slug = Tour.buildSlug(item.destination(), item.country());
            Tour tour = existingBySlug.getOrDefault(slug, new Tour());

            tour.setSlug(slug);
            tour.setDestination(item.destination());
            tour.setCountry(item.country());
            tour.setCategory(item.category());
            tour.setDescription(item.description());
            tour.setDuration(item.duration());
            tour.setImg(item.img());
            tour.setPlan(item.plan() != null ? new ArrayList<>(item.plan()) : new ArrayList<>());
            tour.setWeatherProfile(toWeatherProfile(item.weatherProfile()));

            tourRepository.save(tour);
            upsertCount += 1;
        }

        log.info(
                "Tours seed sync complete. Upserted {} records; removed {} outdated Tomorrowland variants.",
                upsertCount,
                removedTomorrowlandVariantCount
        );
    }

    private List<TourSeedItem> readSeedItems() throws IOException {
        Resource resource = new ClassPathResource("seed/all-tours.json");
        if (!resource.exists()) {
            return List.of();
        }

        try (InputStream inputStream = resource.getInputStream()) {
            List<TourSeedItem> seededTours = objectMapper.readValue(inputStream, new TypeReference<>() {
            });
            log.info("Loaded {} tours from seed/all-tours.json", seededTours.size());
            return seededTours;
        }
    }

    private TourWeatherProfile toWeatherProfile(TourSeedItem.WeatherProfileSeed weatherProfile) {
        if (weatherProfile == null) {
            return TourWeatherProfile.builder()
                    .baseTemp(20)
                    .baseHumidity(50)
                    .baseWind(10)
                    .defaultCondition("Partly Cloudy")
                    .build();
        }

        return TourWeatherProfile.builder()
                .baseTemp(weatherProfile.baseTemp())
                .baseHumidity(weatherProfile.baseHumidity())
                .baseWind(weatherProfile.baseWind())
                .defaultCondition(weatherProfile.defaultCondition())
                .build();
    }

    private boolean isTomorrowlandTour(Tour tour) {
        return tour.getDestination() != null
                && tour.getDestination().toLowerCase(Locale.ROOT).contains("tomorrowland");
    }
}
