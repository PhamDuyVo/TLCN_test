package com.cinema.booking.service;
import com.cinema.booking.entity.Promotion;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;
class PromotionServiceTest {
 private final LocalDateTime now=LocalDateTime.of(2030,1,1,12,0);
 private Promotion voucher() { return Promotion.builder().code("TEST").discountType("percent").discountValue(new BigDecimal("20")).startDate(now.minusDays(1)).endDate(now.plusDays(1)).build(); }
 @Test void appliesPercentCapAndNeverExceedsOrder() {
  Promotion p=voucher();p.setMaxDiscountAmount(new BigDecimal("15"));
  assertEquals(new BigDecimal("15.00"),PromotionService.calculate(p,new BigDecimal("100"),now));
  p.setDiscountType("amount");p.setDiscountValue(new BigDecimal("500"));p.setMaxDiscountAmount(null);
  assertEquals(new BigDecimal("100.00"),PromotionService.calculate(p,new BigDecimal("100"),now));
 }
 @Test void rejectsDateMinimumQuotaAndInactive() {
  Promotion p=voucher();p.setStartDate(now.plusSeconds(1));assertThrows(IllegalArgumentException.class,()->PromotionService.calculate(p,BigDecimal.TEN,now));
  p.setStartDate(now.minusDays(1));p.setEndDate(now);assertThrows(IllegalArgumentException.class,()->PromotionService.calculate(p,BigDecimal.TEN,now));
  p.setEndDate(now.plusDays(1));p.setMinOrderAmount(new BigDecimal("20"));assertThrows(IllegalArgumentException.class,()->PromotionService.calculate(p,BigDecimal.TEN,now));
  p.setMinOrderAmount(BigDecimal.ZERO);p.setUsageLimit(1);p.setUsedCount(1);assertThrows(IllegalArgumentException.class,()->PromotionService.calculate(p,BigDecimal.TEN,now));
  p.setUsedCount(0);p.setStatus("inactive");assertThrows(IllegalArgumentException.class,()->PromotionService.calculate(p,BigDecimal.TEN,now));
 }
}
