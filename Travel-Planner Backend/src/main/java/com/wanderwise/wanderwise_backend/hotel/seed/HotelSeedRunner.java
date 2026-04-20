package com.wanderwise.wanderwise_backend.hotel.seed;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wanderwise.wanderwise_backend.hotel.Hotel;
import com.wanderwise.wanderwise_backend.hotel.HotelRepository;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
public class HotelSeedRunner implements CommandLineRunner {

    private final HotelRepository hotelRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        List<HotelSeedItem> seedItems = readSeedItems();
        if (seedItems.isEmpty()) {
            log.warn("No hotels loaded from seed/hotels.json");
            return;
        }

        List<Hotel> existingHotels = hotelRepository.findAll();
        Map<String, Hotel> existingBySlug = new HashMap<>();
        for (Hotel hotel : existingHotels) {
            existingBySlug.put(hotel.getSlug(), hotel);
        }

        int upsertCount = 0;
        for (HotelSeedItem item : seedItems) {
            String slug = Hotel.buildSlug(item.name(), item.destination(), item.country());
            Hotel hotel = existingBySlug.getOrDefault(slug, new Hotel());

            hotel.setSlug(slug);
            hotel.setName(item.name());
            hotel.setDestination(item.destination());
            hotel.setCountry(item.country());
            hotel.setAddress(item.address());
            hotel.setPricePerNight(item.pricePerNight());
            hotel.setCurrency(item.currency());
            hotel.setRating(item.rating());
            hotel.setImg(item.img());
            hotel.setAmenities(item.amenities() != null ? new ArrayList<>(item.amenities()) : new ArrayList<>());

            hotelRepository.save(hotel);
            upsertCount += 1;
        }

        log.info("Hotels seed sync complete. Upserted {} records.", upsertCount);
    }

    private List<HotelSeedItem> readSeedItems() throws IOException {
        Resource resource = new ClassPathResource("seed/hotels.json");
        if (!resource.exists()) {
            return List.of();
        }

        try (InputStream inputStream = resource.getInputStream()) {
            byte[] bytes = inputStream.readAllBytes();

            try {
                List<HotelSeedItem> hotels = objectMapper.readValue(bytes, new TypeReference<>() {
                });
                log.info("Loaded {} hotels from seed/hotels.json", hotels.size());
                return hotels;
            } catch (JsonParseException utf8Exception) {
                // Fallback for locally edited files accidentally saved with Windows-1252 encoding.
                String fallbackPayload = new String(bytes, Charset.forName("windows-1252"));
                List<HotelSeedItem> hotels = objectMapper.readValue(fallbackPayload, new TypeReference<>() {
                });
                log.warn("Loaded hotels seed using windows-1252 fallback encoding. Save hotels.json as UTF-8.");
                return hotels;
            }
        }
    }
}
