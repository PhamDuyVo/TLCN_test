package com.cinema.booking.repository;

import com.cinema.booking.entity.FoodCombo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodComboRepository extends JpaRepository<FoodCombo, Long> {
    @org.springframework.data.jpa.repository.Query(value="SELECT is_available FROM combos WHERE id = :id", nativeQuery=true)
    Boolean isAvailable(@org.springframework.data.repository.query.Param("id") Long id);
    List<FoodCombo> findByStatus(String status);
}
