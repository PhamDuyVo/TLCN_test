package com.cinema.booking.repository;

import com.cinema.booking.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select s from Showtime s where s.id = :id")
    java.util.Optional<Showtime> lockById(@org.springframework.data.repository.query.Param("id") Long id);
    List<Showtime> findByMovieId(Long movieId);
    List<Showtime> findByMovieIdAndStartTimeBetween(Long movieId, LocalDateTime start, LocalDateTime end);
}
