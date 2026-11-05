package com.cinema.booking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cinema_id", nullable = false)
    private Long cinemaId;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "room_type", length = 30)
    @Builder.Default
    private String screenType = "2D"; // 2D, 3D, IMAX

    @Column(name = "total_seats", nullable = false)
    @Builder.Default
    private Integer totalSeats = 0;

    @Column(length = 20)
    @Builder.Default
    private String status = "active";
}
