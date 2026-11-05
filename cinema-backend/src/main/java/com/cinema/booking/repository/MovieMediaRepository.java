package com.cinema.booking.repository;

import com.cinema.booking.entity.MovieMedia;
import com.cinema.booking.entity.MovieMedia.State;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import java.time.Instant;
import java.util.*;

public interface MovieMediaRepository extends JpaRepository<MovieMedia, String> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select m from MovieMedia m where m.id = :id")
    Optional<MovieMedia> lockById(@Param("id") String id);
    List<MovieMedia> findByMovieIdAndState(Long movieId, State state);
    @Query("select m.id from MovieMedia m where m.state in :states and m.cleanupAfter < :now order by m.cleanupAfter")
    List<String> cleanupCandidates(@Param("states") Collection<State> states, @Param("now") Instant now, Pageable page);
}
