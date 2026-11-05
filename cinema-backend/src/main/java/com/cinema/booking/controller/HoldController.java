package com.cinema.booking.controller;
import com.cinema.booking.dto.ApiResponse;
import com.cinema.booking.dto.BookingDtos.*;
import com.cinema.booking.security.UserPrincipal;
import com.cinema.booking.service.HoldService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/showtimes/{id}/hold") @RequiredArgsConstructor
public class HoldController {
 private final HoldService service;
 @GetMapping public ResponseEntity<?> get(@PathVariable Long id,@AuthenticationPrincipal UserPrincipal u) { return u==null?unauthorized():ResponseEntity.ok(ApiResponse.success(service.get(id,u.getId()))); }
 @PutMapping public ResponseEntity<?> put(@PathVariable Long id,@AuthenticationPrincipal UserPrincipal u,@RequestBody HoldRequest r) { return u==null?unauthorized():ResponseEntity.ok(ApiResponse.success(service.put(id,u.getId(),r.seatIds()))); }
 @DeleteMapping public ResponseEntity<?> delete(@PathVariable Long id,@AuthenticationPrincipal UserPrincipal u) { return u==null?unauthorized():ResponseEntity.ok(ApiResponse.success(service.delete(id,u.getId()))); }
 private ResponseEntity<?> unauthorized() { return ResponseEntity.status(401).body(ApiResponse.error("Authentication required")); }
}
