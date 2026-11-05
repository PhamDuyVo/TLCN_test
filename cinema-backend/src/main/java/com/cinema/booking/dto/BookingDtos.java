package com.cinema.booking.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class BookingDtos {
    public record HoldRequest(List<Long> seatIds) {}
    public record HoldDto(Long showtimeId, List<Long> seatIds, LocalDateTime expiresAt, LocalDateTime serverTime, String status) {}
    public record QuoteDto(BigDecimal seatAmount, BigDecimal comboAmount, BigDecimal totalAmount,
        BigDecimal discountAmount, BigDecimal finalAmount, LocalDateTime expiresAt, String paymentMethod) {}


    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateBookingRequest {
        private Long showtimeId;
        private List<Long> seatIds;
        private List<ComboItemRequest> combos;
        private String promotionCode;
        private String paymentMethod; // VNPAY, MOMO
        private String customerName;
        private String customerEmail;
        private String customerPhone;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComboItemRequest {
        private Long comboId;
        private Integer quantity;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BookingDetailDto {
        private Long id;
        private String bookingCode;
        private String movieTitle;
        private String moviePoster;
        private String cinemaName;
        private String hallName;
        private LocalDateTime showtimeStart;
        private List<String> seatNumbers;
        private BigDecimal totalAmount;
        private BigDecimal discountAmount;
        private BigDecimal finalAmount;
        private String paymentMethod;
        private String status;
        private String paymentUrl;
        private LocalDateTime expiresAt;
        private List<TicketDto> tickets;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TicketDto {
        private Long id;
        private String ticketCode;
        private String seatNumber;
        private BigDecimal price;
        private String qrPayload;
        private String status;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PromotionApplyRequest {
        private String code;
        private BigDecimal orderAmount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PromotionApplyResponse {
        private String code;
        private Integer discountPercent;
        private BigDecimal discountAmount;
        private BigDecimal finalAmount;
    }
}
