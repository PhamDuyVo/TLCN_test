package com.cinema.booking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "promotions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(length = 255)
    private String description;

    @Transient
    private Integer discountPercent;
    @Column(name="discount_type",nullable=false) @Builder.Default private String discountType="percent";
    @Column(name="discount_value",nullable=false) private BigDecimal discountValue;
    public Integer getDiscountPercent() { return "percent".equals(discountType) && discountValue!=null ? discountValue.intValue() : discountPercent; }
    public void setDiscountPercent(Integer value) { discountPercent=value; discountType="percent"; discountValue=value==null?null:BigDecimal.valueOf(value); }
    @PrePersist @PreUpdate void mapLegacyPercent() { if(discountValue==null && discountPercent!=null) discountValue=BigDecimal.valueOf(discountPercent); }


    @Column(name = "max_discount_amount", precision = 10, scale = 2)
    private BigDecimal maxDiscountAmount;

    @Column(name = "min_order_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "used_count")
    @Builder.Default
    private Integer usedCount = 0;

    @Column(length = 20)
    @Builder.Default
    private String status = "active";
}
