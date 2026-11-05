package com.cinema.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_code", nullable = false, unique = true, length = 50)
    private String bookingCode;

    @Column(name = "customer_id")
    private Long userId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "showtime_id", nullable = false)
    private Showtime showtime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_id")
    private Promotion promotion;

    @Column(name = "guest_name", length = 100)
    private String customerName;

    @Column(name = "guest_email", length = 150)
    private String customerEmail;

    @Column(name = "guest_phone", length = 20)
    private String customerPhone;

    @Transient
    private BigDecimal totalAmount;
    @Column(name="seat_amount",nullable=false) @Builder.Default private BigDecimal seatAmount=BigDecimal.ZERO;
    @Column(name="combo_amount",nullable=false) @Builder.Default private BigDecimal comboAmount=BigDecimal.ZERO;
    public BigDecimal getTotalAmount() { return seatAmount.add(comboAmount); }


    @Column(name = "discount_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "final_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal finalAmount;

    @Transient
    @Builder.Default
    private String paymentMethod = "PAY_AT_COUNTER";

    @Column(length = 20)
    @Builder.Default
    private String status = "pending_payment"; // PENDING, PAID, CANCELLED, EXPIRED

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Ticket> tickets = new ArrayList<>();

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BookingCombo> combos = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Transient
    private LocalDateTime updatedAt;
}
