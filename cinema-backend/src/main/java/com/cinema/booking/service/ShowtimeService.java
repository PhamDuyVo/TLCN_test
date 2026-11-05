package com.cinema.booking.service;

import com.cinema.booking.dto.MovieDtos.*;
import com.cinema.booking.entity.*;
import com.cinema.booking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ShowtimeService {

    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final TicketRepository ticketRepository;
    private final BookingRepository bookingRepository;
    private final CinemaRepository cinemaRepository;
    private final ShowtimeSeatRepository inventory;

    public List<ShowtimeDto> getShowtimesByMovie(Long movieId, String dateStr) {
        List<Showtime> showtimes;
        if (dateStr != null && !dateStr.isBlank()) {
            LocalDate date = LocalDate.parse(dateStr);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.atTime(LocalTime.MAX);
            showtimes = showtimeRepository.findByMovieIdAndStartTimeBetween(movieId, start, end);
        } else {
            showtimes = showtimeRepository.findByMovieId(movieId);
        }

        return showtimes.stream().map(this::mapToShowtimeDto).collect(Collectors.toList());
    }

    public ShowtimeSeatsDto getShowtimeSeats(Long showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy suất chiếu ID: " + showtimeId));

        List<Seat> allSeats = seatRepository.findByHallIdOrderBySeatRowAscSeatColAsc(showtime.getHall().getId());

        Set<Long> bookedSeatIds=ticketRepository.findByShowtimeId(showtimeId).stream().filter(HoldService::activeTicket).map(t->t.getSeat().getId()).collect(Collectors.toSet());
        Set<Long> holdingSeatIds=new HashSet<>();
        LocalDateTime now=LocalDateTime.now();
        for(ShowtimeSeat row:inventory.findByShowtimeId(showtimeId)) {
            if("booked".equals(row.getStatus())) bookedSeatIds.add(row.getSeatId());
            else if(HoldService.live(row,now)) holdingSeatIds.add(row.getSeatId());
        }

        BigDecimal basePrice = showtime.getBasePrice();
        List<SeatDto> seatDtos = allSeats.stream().map(seat -> {
            String status = "AVAILABLE";
            if (bookedSeatIds.contains(seat.getId())) {
                status = "BOOKED";
            } else if (holdingSeatIds.contains(seat.getId())) {
                status = "HOLDING";
            }

            if(!"active".equalsIgnoreCase(seat.getStatus())) status="UNAVAILABLE";
            BigDecimal surcharge = seat.getSeatType() != null ? seat.getSeatType().getSurcharge() : BigDecimal.ZERO;
            BigDecimal finalPrice = basePrice.add(surcharge);

            return SeatDto.builder()
                    .id(seat.getId())
                    .seatNumber(seat.getSeatNumber())
                    .seatRow(seat.getSeatRow())
                    .seatCol(seat.getSeatCol())
                    .seatType(seat.getSeatType() != null ? seat.getSeatType().getName() : "standard")
                    .surcharge(surcharge)
                    .finalPrice(finalPrice)
                    .status(status)
                    .build();
        }).collect(Collectors.toList());

        return ShowtimeSeatsDto.builder()
                .showtime(mapToShowtimeDto(showtime))
                .seats(seatDtos)
                .build();
    }

    public ShowtimeDto mapToShowtimeDto(Showtime s) {
        String cinemaName = "";
        Long cinemaId = null;
        if (s.getHall() != null && s.getHall().getCinemaId() != null) {
            cinemaId = s.getHall().getCinemaId();
            cinemaName = cinemaRepository.findById(cinemaId).map(Cinema::getName).orElse("Rạp UTE");
        }

        return ShowtimeDto.builder()
                .id(s.getId())
                .movieId(s.getMovie().getId())
                .movieTitle(s.getMovie().getTitle())
                .moviePoster(s.getMovie().getPosterUrl())
                .cinemaId(cinemaId)
                .cinemaName(cinemaName)
                .hallId(s.getHall() != null ? s.getHall().getId() : null)
                .hallName(s.getHall() != null ? s.getHall().getName() : "")
                .screenType(s.getHall() != null ? s.getHall().getScreenType() : "2D")
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .basePrice(s.getBasePrice())
                .status(s.getStatus())
                .build();
    }
}
