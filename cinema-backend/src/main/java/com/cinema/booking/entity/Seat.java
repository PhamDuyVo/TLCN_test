package com.cinema.booking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "seats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false)
    private Long hallId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seat_type_id", nullable = false)
    private SeatType seatType;

    @Transient
    private String seatNumber; // A1, A2, B1...

    @Column(name = "row_label", nullable = false, length = 5)
    private String seatRow; // A, B, C...

    @Column(name = "seat_number", nullable = false)
    private Integer seatCol;

    public String getSeatNumber() { return seatRow + seatCol; }

    @Column(length = 20)
    @Builder.Default
    private String status = "active";
}
