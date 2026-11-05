package com.cinema.booking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "seat_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name; // standard, vip, couple

    @Column(name = "price_extra", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal surcharge = BigDecimal.ZERO;
}
