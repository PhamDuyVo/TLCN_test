package com.cinema.booking.controller;

import com.cinema.booking.dto.ApiResponse;
import com.cinema.booking.dto.BookingDtos.BookingDetailDto;
import com.cinema.booking.dto.BookingDtos.CreateBookingRequest;
import com.cinema.booking.security.UserPrincipal;
import com.cinema.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/quote")
    public ResponseEntity<?> quote(@AuthenticationPrincipal UserPrincipal user, @RequestBody CreateBookingRequest request) {
        if(user==null) return ResponseEntity.status(401).body(ApiResponse.error("Authentication required"));
        return ResponseEntity.ok(ApiResponse.success(bookingService.quote(user.getId(),request)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingDetailDto>> createBooking(@AuthenticationPrincipal UserPrincipal currentUser,
                                                                       @RequestBody CreateBookingRequest request) {
        if(currentUser==null) return ResponseEntity.status(401).body(ApiResponse.error("Authentication required"));
        Long userId = currentUser.getId();
        BookingDetailDto booking = bookingService.createBooking(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Khởi tạo đơn đặt vé thành công!", booking));
    }

    @GetMapping("/{code}")
    public ResponseEntity<ApiResponse<BookingDetailDto>> getBookingDetail(@PathVariable String code, @AuthenticationPrincipal UserPrincipal currentUser) {
        if(currentUser==null) return ResponseEntity.status(401).body(ApiResponse.error("Authentication required"));
        BookingDetailDto detail = bookingService.getBookingDetail(currentUser.getId(), code);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    @GetMapping("/my-tickets")
    public ResponseEntity<ApiResponse<List<BookingDetailDto>>> getMyBookings(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Vui lòng đăng nhập để xem vé đã mua."));
        }
        List<BookingDetailDto> myBookings = bookingService.getMyBookings(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(myBookings));
    }
}
