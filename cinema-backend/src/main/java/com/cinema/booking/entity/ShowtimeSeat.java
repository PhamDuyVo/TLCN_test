package com.cinema.booking.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity @Table(name="showtime_seats", uniqueConstraints=@UniqueConstraint(columnNames={"showtime_id","seat_id"}))
@Getter @Setter @NoArgsConstructor
public class ShowtimeSeat {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(name="showtime_id",nullable=false) private Long showtimeId;
 @Column(name="seat_id",nullable=false) private Long seatId;
 private String status;
 @Column(name="held_by_user_id") private Long heldByUserId;
 @Column(name="hold_expires_at") private LocalDateTime holdExpiresAt;
}
