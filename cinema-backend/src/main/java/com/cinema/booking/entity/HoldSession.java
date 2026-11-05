package com.cinema.booking.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity @Table(name="booking_hold_sessions",uniqueConstraints=@UniqueConstraint(columnNames={"showtime_id","user_id"}))
@Getter @Setter @NoArgsConstructor
public class HoldSession {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(name="showtime_id",nullable=false) private Long showtimeId;
 @Column(name="user_id",nullable=false) private Long userId;
 @Column(name="expires_at",nullable=false) private LocalDateTime expiresAt;
}
