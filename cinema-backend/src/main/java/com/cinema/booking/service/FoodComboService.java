package com.cinema.booking.service;

import com.cinema.booking.entity.FoodCombo;
import com.cinema.booking.repository.FoodComboRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FoodComboService {

    private final FoodComboRepository foodComboRepository;

    public List<FoodCombo> getAllCombos() {
        return foodComboRepository.findByStatus("active");
    }
}
