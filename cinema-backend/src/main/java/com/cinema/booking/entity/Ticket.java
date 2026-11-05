package com.cinema.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking_seats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seat;

    @Column(name = "showtime_id", nullable = false)
    private Long showtimeId;

    @Column(name = "qr_code", nullable = false, unique = true, length = 50)
    private String ticketCode;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Transient
    private String qrPayload;

    @Column(name="ticket_status",length=20)
    @Builder.Default
    private String status = "valid"; // PENDING, PAID, CHECKED_IN, CANCELLED

    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt;

    @Column(name = "checked_in_by_staff_id")
    private Long checkedInBy;

    @Transient
    private LocalDateTime createdAt;
}
