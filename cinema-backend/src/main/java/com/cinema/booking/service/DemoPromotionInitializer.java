package com.cinema.booking.service;
import com.cinema.booking.entity.Promotion;
import com.cinema.booking.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Component @Profile("demo") @RequiredArgsConstructor
public class DemoPromotionInitializer implements CommandLineRunner {
 private final PromotionRepository promotions;
 @Override @Transactional public void run(String... args) {
  seed("CHAOBANMOI","amount","20000","100000","20000");
  seed("VIP20","percent","20","150000","50000");
 }
 private void seed(String code,String type,String value,String minimum,String cap) {
  if(promotions.existsByCode(code)) return;
  promotions.save(Promotion.builder().code(code).description("Demo voucher: "+code).discountType(type)
   .discountValue(new BigDecimal(value)).minOrderAmount(new BigDecimal(minimum)).maxDiscountAmount(new BigDecimal(cap))
   .startDate(LocalDateTime.now().minusDays(1)).endDate(LocalDateTime.now().plusYears(1)).usageLimit(1000).build());
 }
}
