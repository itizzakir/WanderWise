package com.wanderwise.wanderwise_backend.tour;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
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
@Embeddable
public class TourWeatherProfile {

    @Column(name = "weather_base_temp")
    private Integer baseTemp;

    @Column(name = "weather_base_humidity")
    private Integer baseHumidity;

    @Column(name = "weather_base_wind")
    private Integer baseWind;

    @Column(name = "weather_default_condition", length = 80)
    private String defaultCondition;
}
