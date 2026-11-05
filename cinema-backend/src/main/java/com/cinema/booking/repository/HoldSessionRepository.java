package com.cinema.booking.repository;
import com.cinema.booking.entity.HoldSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface HoldSessionRepository extends JpaRepository<HoldSession,Long> {
 Optional<HoldSession> findByShowtimeIdAndUserId(Long showtimeId,Long userId);
}
