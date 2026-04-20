package com.wanderwise.wanderwise_backend.ai.support;

import com.wanderwise.wanderwise_backend.hotel.Hotel;
import com.wanderwise.wanderwise_backend.hotel.HotelRepository;
import com.wanderwise.wanderwise_backend.ai.recommendation.dto.HotelRecommendationDto;
import com.wanderwise.wanderwise_backend.ai.recommendation.dto.TourRecommendationDto;
import com.wanderwise.wanderwise_backend.tour.Tour;
import com.wanderwise.wanderwise_backend.tour.TourRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TravelDataSupportService {

    private static final Set<String> STOP_WORDS = Set.of(
            "a", "an", "the", "and", "or", "for", "to", "from", "with", "about", "near", "best", "good",
            "show", "find", "plan", "trip", "travel", "need", "want", "please", "tell", "me", "my", "our",
            "is", "are", "of", "in", "on", "at", "do", "you", "have", "any", "there", "that", "this"
    );

    private static final Set<String> FOLLOW_UP_HINTS = Set.of(
            "cheaper", "budget", "luxury", "there", "same", "that", "those", "more", "another", "options"
    );

    private final HotelRepository hotelRepository;
    private final TourRepository tourRepository;

    @Transactional(readOnly = true)
    public TravelKnowledgeContext findKnowledgeForChat(
            String message,
            boolean includeHotels,
            boolean includeTours,
            TravelConversationStore.ConversationSnapshot snapshot
    ) {
        String normalizedMessage = normalizeText(message);
        Set<String> keywords = new LinkedHashSet<>(extractKeywords(normalizedMessage));

        boolean hasExplicitLocation = hasExplicitLocationMention(normalizedMessage);
        if (!hasExplicitLocation && shouldBorrowPreviousLocation(normalizedMessage, snapshot)) {
            keywords.addAll(extractKeywords(normalizeText(snapshot.lastDestination())));
            keywords.addAll(extractKeywords(normalizeText(snapshot.lastCountry())));
        }

        List<Hotel> hotels = includeHotels
                ? scoreHotels(hotelRepository.findAllByOrderByDestinationAscPricePerNightAsc(), normalizedMessage, keywords)
                : List.of();
        List<Tour> tours = includeTours
                ? scoreTours(tourRepository.findAllByOrderByDestinationAsc(), normalizedMessage, keywords)
                : List.of();

        String matchedDestination = hotels.stream().findFirst().map(Hotel::getDestination)
                .orElseGet(() -> tours.stream().findFirst().map(Tour::getDestination).orElse(snapshot.lastDestination()));
        String matchedCountry = hotels.stream().findFirst().map(Hotel::getCountry)
                .orElseGet(() -> tours.stream().findFirst().map(Tour::getCountry).orElse(snapshot.lastCountry()));

        return new TravelKnowledgeContext(hotels, tours, matchedDestination, matchedCountry);
    }

    @Transactional(readOnly = true)
    public RecommendationBundle buildRecommendationBundle(
            String destination,
            BigDecimal budget,
            int numberOfDays,
            List<String> preferences
    ) {
        String normalizedDestination = normalizeText(destination);
        Set<String> preferenceKeywords = preferences == null
                ? Set.of()
                : preferences.stream()
                        .filter(item -> item != null && !item.isBlank())
                        .flatMap(item -> extractKeywords(normalizeText(item)).stream())
                        .collect(Collectors.toCollection(LinkedHashSet::new));

        int nights = Math.max(1, numberOfDays - 1);
        BigDecimal hotelBudgetCap = budget == null
                ? null
                : budget.multiply(new BigDecimal("0.60")).setScale(2, RoundingMode.HALF_UP);

        List<HotelRecommendationDto> hotelRecommendations = hotelRepository.findAllByOrderByDestinationAscPricePerNightAsc()
                .stream()
                .map(hotel -> scoreHotelForRecommendation(hotel, normalizedDestination, preferenceKeywords, hotelBudgetCap, nights))
                .sorted(Comparator.comparingInt(ScoredHotelRecommendation::score).reversed())
                .limit(3)
                .map(ScoredHotelRecommendation::dto)
                .toList();

        List<TourRecommendationDto> tourRecommendations = tourRepository.findAllByOrderByDestinationAsc()
                .stream()
                .map(tour -> scoreTourForRecommendation(tour, normalizedDestination, preferenceKeywords, numberOfDays))
                .sorted(Comparator.comparingInt(ScoredTourRecommendation::score).reversed())
                .limit(3)
                .map(ScoredTourRecommendation::dto)
                .toList();

        return new RecommendationBundle(
                hotelRecommendations,
                tourRecommendations,
                buildItinerary(tourRecommendations, numberOfDays, destination, preferences)
        );
    }

    public List<String> buildItinerary(
            List<TourRecommendationDto> tours,
            int numberOfDays,
            String destination,
            List<String> preferences
    ) {
        int safeDays = Math.max(1, numberOfDays);
        List<String> itinerary = new ArrayList<>();
        Set<String> seen = new LinkedHashSet<>();

        for (TourRecommendationDto tour : tours) {
            for (String planItem : tour.plan()) {
                String normalized = normalizeText(planItem);
                if (seen.add(normalized)) {
                    itinerary.add(planItem);
                }
                if (itinerary.size() == safeDays) {
                    return renameDays(itinerary);
                }
            }
        }

        String primaryPreference = preferences != null && !preferences.isEmpty()
                ? preferences.get(0)
                : "local highlights";

        while (itinerary.size() < safeDays) {
            itinerary.add("Day " + (itinerary.size() + 1) + ": Explore " + destination + " with a focus on " + primaryPreference);
        }

        return renameDays(itinerary);
    }

    private List<Hotel> scoreHotels(List<Hotel> hotels, String normalizedMessage, Set<String> keywords) {
        return hotels.stream()
                .map(hotel -> new ScoredHotelEntity(hotel, scoreHotel(hotel, normalizedMessage, keywords)))
                .filter(item -> item.score() > 0)
                .sorted(Comparator
                        .comparingInt(ScoredHotelEntity::score).reversed()
                        .thenComparing(item -> item.hotel().getPricePerNight()))
                .limit(3)
                .map(ScoredHotelEntity::hotel)
                .toList();
    }

    private List<Tour> scoreTours(List<Tour> tours, String normalizedMessage, Set<String> keywords) {
        return tours.stream()
                .map(tour -> new ScoredTourEntity(tour, scoreTour(tour, normalizedMessage, keywords)))
                .filter(item -> item.score() > 0)
                .sorted(Comparator
                        .comparingInt(ScoredTourEntity::score).reversed()
                        .thenComparing(item -> item.tour().getDuration()))
                .limit(3)
                .map(ScoredTourEntity::tour)
                .toList();
    }

    private int scoreHotel(Hotel hotel, String normalizedMessage, Set<String> keywords) {
        int score = 0;
        String destination = normalizeText(hotel.getDestination());
        String country = normalizeText(hotel.getCountry());
        String name = normalizeText(hotel.getName());
        String address = normalizeText(hotel.getAddress());
        String amenities = normalizeText(String.join(" ", hotel.getAmenities()));

        if (!destination.isBlank() && normalizedMessage.contains(destination)) {
            score += 14;
        }
        if (!country.isBlank() && normalizedMessage.contains(country)) {
            score += 10;
        }
        if (!name.isBlank() && normalizedMessage.contains(name)) {
            score += 8;
        }

        for (String keyword : keywords) {
            if (destination.contains(keyword)) {
                score += 5;
            }
            if (country.contains(keyword)) {
                score += 4;
            }
            if (name.contains(keyword)) {
                score += 4;
            }
            if (address.contains(keyword)) {
                score += 2;
            }
            if (amenities.contains(keyword)) {
                score += 3;
            }
        }

        if (hotel.getRating() != null) {
            score += hotel.getRating().setScale(0, RoundingMode.HALF_UP).intValue();
        }

        return score;
    }

    private int scoreTour(Tour tour, String normalizedMessage, Set<String> keywords) {
        int score = 0;
        String destination = normalizeText(tour.getDestination());
        String country = normalizeText(tour.getCountry());
        String category = normalizeText(tour.getCategory());
        String description = normalizeText(tour.getDescription());
        String planText = normalizeText(String.join(" ", tour.getPlan()));

        if (!destination.isBlank() && normalizedMessage.contains(destination)) {
            score += 14;
        }
        if (!country.isBlank() && normalizedMessage.contains(country)) {
            score += 10;
        }
        if (!category.isBlank() && normalizedMessage.contains(category)) {
            score += 6;
        }

        for (String keyword : keywords) {
            if (destination.contains(keyword)) {
                score += 5;
            }
            if (country.contains(keyword)) {
                score += 4;
            }
            if (category.contains(keyword)) {
                score += 4;
            }
            if (description.contains(keyword)) {
                score += 3;
            }
            if (planText.contains(keyword)) {
                score += 2;
            }
        }

        return score;
    }

    private ScoredHotelRecommendation scoreHotelForRecommendation(
            Hotel hotel,
            String normalizedDestination,
            Set<String> preferenceKeywords,
            BigDecimal hotelBudgetCap,
            int nights
    ) {
        int score = 0;
        List<String> reasons = new ArrayList<>();
        String destination = normalizeText(hotel.getDestination());
        String country = normalizeText(hotel.getCountry());
        String amenities = normalizeText(String.join(" ", hotel.getAmenities()));

        if (locationMatches(normalizedDestination, destination, country)) {
            score += 20;
            reasons.add("Strong destination match");
        }

        int preferenceHits = 0;
        for (String keyword : preferenceKeywords) {
            if (amenities.contains(keyword) || destination.contains(keyword) || country.contains(keyword)) {
                preferenceHits++;
            }
        }
        if (preferenceHits > 0) {
            score += preferenceHits * 5;
            reasons.add("Matches " + preferenceHits + " preference keyword(s)");
        }

        BigDecimal totalStayCost = hotel.getPricePerNight().multiply(BigDecimal.valueOf(nights));
        if (hotelBudgetCap != null) {
            if (totalStayCost.compareTo(hotelBudgetCap) <= 0) {
                score += 8;
                reasons.add("Fits the hotel share of your budget");
            } else {
                score -= 6;
                reasons.add("Slightly above the ideal hotel budget");
            }
        }

        if (hotel.getRating() != null) {
            score += hotel.getRating().setScale(0, RoundingMode.HALF_UP).intValue();
        }

        String matchReason = reasons.isEmpty() ? "Balanced pick for the selected trip inputs" : String.join(". ", reasons);
        HotelRecommendationDto dto = new HotelRecommendationDto(
                hotel.getId(),
                hotel.getName(),
                hotel.getDestination(),
                hotel.getCountry(),
                hotel.getAddress(),
                hotel.getPricePerNight(),
                totalStayCost,
                hotel.getCurrency(),
                hotel.getRating(),
                hotel.getImg(),
                hotel.getAmenities(),
                matchReason
        );

        return new ScoredHotelRecommendation(dto, score);
    }

    private ScoredTourRecommendation scoreTourForRecommendation(
            Tour tour,
            String normalizedDestination,
            Set<String> preferenceKeywords,
            int numberOfDays
    ) {
        int score = 0;
        List<String> reasons = new ArrayList<>();
        String destination = normalizeText(tour.getDestination());
        String country = normalizeText(tour.getCountry());
        String category = normalizeText(tour.getCategory());
        String description = normalizeText(tour.getDescription());
        String planText = normalizeText(String.join(" ", tour.getPlan()));

        if (locationMatches(normalizedDestination, destination, country)) {
            score += 20;
            reasons.add("Strong destination match");
        }

        int preferenceHits = 0;
        for (String keyword : preferenceKeywords) {
            if (category.contains(keyword) || description.contains(keyword) || planText.contains(keyword)) {
                preferenceHits++;
            }
        }
        if (preferenceHits > 0) {
            score += preferenceHits * 5;
            reasons.add("Aligned with " + preferenceHits + " preference keyword(s)");
        }

        int durationDifference = Math.abs(tour.getDuration() - numberOfDays);
        score += Math.max(0, 8 - durationDifference);
        if (durationDifference <= 2) {
            reasons.add("Trip length is close to your requested stay");
        }

        TourRecommendationDto dto = new TourRecommendationDto(
                tour.getId(),
                tour.getDestination(),
                tour.getCountry(),
                tour.getCategory(),
                tour.getDescription(),
                tour.getDuration(),
                tour.getImg(),
                tour.getSlug(),
                tour.getPlan(),
                reasons.isEmpty() ? "Useful base itinerary for this trip" : String.join(". ", reasons)
        );

        return new ScoredTourRecommendation(dto, score);
    }

    private boolean hasExplicitLocationMention(String normalizedMessage) {
        if (normalizedMessage == null || normalizedMessage.isBlank()) {
            return false;
        }

        return hotelRepository.findAllByOrderByDestinationAscPricePerNightAsc()
                .stream()
                .map(Hotel::getDestination)
                .map(this::normalizeText)
                .filter(value -> value.length() > 2)
                .anyMatch(normalizedMessage::contains)
                || tourRepository.findAllByOrderByDestinationAsc()
                .stream()
                .map(Tour::getDestination)
                .map(this::normalizeText)
                .filter(value -> value.length() > 2)
                .anyMatch(normalizedMessage::contains);
    }

    private boolean shouldBorrowPreviousLocation(
            String normalizedMessage,
            TravelConversationStore.ConversationSnapshot snapshot
    ) {
        if (snapshot == null || (snapshot.lastDestination() == null && snapshot.lastCountry() == null)) {
            return false;
        }

        return extractKeywords(normalizedMessage).isEmpty()
                || FOLLOW_UP_HINTS.stream().anyMatch(normalizedMessage::contains);
    }

    private boolean locationMatches(String normalizedInput, String destination, String country) {
        if (normalizedInput == null || normalizedInput.isBlank()) {
            return false;
        }

        return destination.contains(normalizedInput)
                || country.contains(normalizedInput)
                || normalizedInput.contains(destination)
                || normalizedInput.contains(country);
    }

    private List<String> extractKeywords(String input) {
        if (input == null || input.isBlank()) {
            return List.of();
        }

        return List.of(input.split("\\s+"))
                .stream()
                .map(String::trim)
                .filter(token -> token.length() > 2)
                .filter(token -> !STOP_WORDS.contains(token))
                .distinct()
                .toList();
    }

    private String normalizeText(String value) {
        if (value == null) {
            return "";
        }

        return value.toLowerCase(Locale.ENGLISH)
                .replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private List<String> renameDays(List<String> items) {
        List<String> normalized = new ArrayList<>();
        for (int index = 0; index < items.size(); index++) {
            String text = items.get(index).replaceFirst("(?i)^day\\s+\\d+\\s*:\\s*", "").trim();
            normalized.add("Day " + (index + 1) + ": " + text);
        }
        return normalized;
    }

    private record ScoredHotelEntity(Hotel hotel, int score) {
    }

    private record ScoredTourEntity(Tour tour, int score) {
    }

    private record ScoredHotelRecommendation(HotelRecommendationDto dto, int score) {
    }

    private record ScoredTourRecommendation(TourRecommendationDto dto, int score) {
    }

    public record TravelKnowledgeContext(
            List<Hotel> hotels,
            List<Tour> tours,
            String matchedDestination,
            String matchedCountry
    ) {
        public boolean hasMatches() {
            return !hotels.isEmpty() || !tours.isEmpty();
        }

        public String toPromptBlock() {
            if (!hasMatches()) {
                return "No matching hotels or tours were found in the local database.";
            }

            String hotelBlock = hotels.stream()
                    .map(hotel -> "Hotel: %s | %s, %s | %s/night | Amenities: %s"
                            .formatted(
                                    hotel.getName(),
                                    hotel.getDestination(),
                                    hotel.getCountry(),
                                    hotel.getPricePerNight(),
                                    String.join(", ", hotel.getAmenities())
                            ))
                    .collect(Collectors.joining("\n"));

            String tourBlock = tours.stream()
                    .map(tour -> "Tour: %s, %s | %s days | Category: %s | Highlights: %s"
                            .formatted(
                                    tour.getDestination(),
                                    tour.getCountry(),
                                    tour.getDuration(),
                                    tour.getCategory(),
                                    String.join("; ", tour.getPlan())
                            ))
                    .collect(Collectors.joining("\n"));

            return (hotelBlock + "\n" + tourBlock).trim();
        }
    }

    public record RecommendationBundle(
            List<HotelRecommendationDto> hotels,
            List<TourRecommendationDto> tours,
            List<String> itinerary
    ) {
    }
}
