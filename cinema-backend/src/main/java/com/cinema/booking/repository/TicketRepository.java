package com.cinema.booking.repository;

import com.cinema.booking.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByTicketCode(String ticketCode);
    List<Ticket> findByShowtimeId(Long showtimeId);
    List<Ticket> findByBookingId(Long bookingId);
    List<Ticket> findByShowtimeIdAndSeatIdIn(Long showtimeId, List<Long> seatIds);
}
