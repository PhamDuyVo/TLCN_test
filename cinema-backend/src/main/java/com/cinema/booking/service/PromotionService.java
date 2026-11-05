package com.cinema.booking.service;

import com.cinema.booking.dto.BookingDtos.PromotionApplyRequest;
import com.cinema.booking.dto.BookingDtos.PromotionApplyResponse;
import com.cinema.booking.entity.FoodCombo;
import com.cinema.booking.entity.Promotion;
import com.cinema.booking.repository.FoodComboRepository;
import com.cinema.booking.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRepository promotionRepository;

    public PromotionApplyResponse applyPromotion(PromotionApplyRequest request) {
        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new IllegalArgumentException("Mã khuyến mãi không được để trống.");
        }

        Promotion promo = promotionRepository.findByCodeAndStatus(request.getCode().trim().toUpperCase(), "active")
                .orElseThrow(() -> new IllegalArgumentException("Mã khuyến mãi không hợp lệ hoặc đã hết hạn."));

        BigDecimal orderAmount=request.getOrderAmount();
        BigDecimal discount=calculate(promo,orderAmount,LocalDateTime.now());
        BigDecimal finalAmount=orderAmount.subtract(discount);

        return PromotionApplyResponse.builder()
                .code(promo.getCode())
                .discountPercent(promo.getDiscountPercent())
                .discountAmount(discount)
                .finalAmount(finalAmount)
                .build();
    }
    public static BigDecimal calculate(Promotion promo, BigDecimal amount, LocalDateTime now) {
        if(amount==null || amount.signum()<0) throw new IllegalArgumentException("Invalid order amount");
        if(!"active".equalsIgnoreCase(promo.getStatus()) || promo.getStartDate()==null || promo.getEndDate()==null
            || now.isBefore(promo.getStartDate()) || !now.isBefore(promo.getEndDate())) throw new IllegalArgumentException("Voucher is not currently valid");
        if(promo.getUsageLimit()!=null && promo.getUsedCount()>=promo.getUsageLimit()) throw new IllegalArgumentException("Voucher usage limit reached");
        if(promo.getMinOrderAmount()!=null && amount.compareTo(promo.getMinOrderAmount())<0) throw new IllegalArgumentException("Voucher minimum spend not met");
        BigDecimal value=promo.getDiscountValue();
        if(value==null && promo.getDiscountPercent()!=null) value=BigDecimal.valueOf(promo.getDiscountPercent());
        if(value==null || value.signum()<0) throw new IllegalArgumentException("Invalid voucher value");
        BigDecimal discount;
        if("percent".equals(promo.getDiscountType())) {
            if(value.compareTo(BigDecimal.valueOf(100))>0) throw new IllegalArgumentException("Invalid voucher percent");
            discount=amount.multiply(value).divide(BigDecimal.valueOf(100),2,RoundingMode.HALF_UP);
        } else if("amount".equals(promo.getDiscountType())) discount=value;
        else throw new IllegalArgumentException("Unsupported voucher type");
        if(promo.getMaxDiscountAmount()!=null) discount=discount.min(promo.getMaxDiscountAmount().max(BigDecimal.ZERO));
        return discount.min(amount).setScale(2,RoundingMode.HALF_UP);
    }
}
