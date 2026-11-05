package com.cinema.booking.repository;
import com.cinema.booking.entity.ShowtimeSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ShowtimeSeatRepository extends JpaRepository<ShowtimeSeat,Long> {
 List<ShowtimeSeat> findByShowtimeId(Long id);
}
