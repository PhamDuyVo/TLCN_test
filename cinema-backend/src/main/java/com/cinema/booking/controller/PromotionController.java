package com.cinema.booking.controller;

import com.cinema.booking.dto.ApiResponse;
import com.cinema.booking.dto.BookingDtos.PromotionApplyRequest;
import com.cinema.booking.dto.BookingDtos.PromotionApplyResponse;
import com.cinema.booking.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<PromotionApplyResponse>> applyPromotion(@RequestBody PromotionApplyRequest request) {
        PromotionApplyResponse response = promotionService.applyPromotion(request);
        return ResponseEntity.ok(ApiResponse.success("Áp dụng mã khuyến mãi thành công!", response));
    }
}
