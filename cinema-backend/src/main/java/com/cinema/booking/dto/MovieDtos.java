package com.cinema.booking.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class MovieDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MovieDetailDto {
        private Long id;
        private String title;
        private String originalTitle;
        private Integer durationMinutes;
        private LocalDate releaseDate;
        private LocalDate endDate;
        private String ageRating;
        private String posterUrl;
        private String bannerUrl;
        private String trailerUrl;
        private String description;
        private String director;
        private String cast;
        private String status;
        private List<String> genres;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShowtimeDto {
        private Long id;
        private Long movieId;
        private String movieTitle;
        private String moviePoster;
        private Long cinemaId;
        private String cinemaName;
        private Long hallId;
        private String hallName;
        private String screenType;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private BigDecimal basePrice;
        private String status;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SeatDto {
        private Long id;
        private String seatNumber;
        private String seatRow;
        private Integer seatCol;
        private String seatType;
        private BigDecimal surcharge;
        private BigDecimal finalPrice;
        private String status; // AVAILABLE, HOLDING, BOOKED
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShowtimeSeatsDto {
        private ShowtimeDto showtime;
        private List<SeatDto> seats;
    }
}
