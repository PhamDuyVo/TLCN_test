package com.cinema.booking.controller;

import com.cinema.booking.dto.ApiResponse;
import com.cinema.booking.entity.FoodCombo;
import com.cinema.booking.service.FoodComboService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/combos")
@RequiredArgsConstructor
public class FoodComboController {

    private final FoodComboService foodComboService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FoodCombo>>> getAllCombos() {
        List<FoodCombo> combos = foodComboService.getAllCombos();
        return ResponseEntity.ok(ApiResponse.success(combos));
    }
}
