package com.cinema.booking.repository;

import com.cinema.booking.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    boolean existsByCode(String code);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select p from Promotion p where p.code = :code")
    Optional<Promotion> lockByCode(@org.springframework.data.repository.query.Param("code") String code);
    Optional<Promotion> findByCodeAndStatus(String code, String status);
}
