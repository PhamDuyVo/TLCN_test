package com.cinema.booking.controller;

import com.cinema.booking.dto.ApiResponse;
import com.cinema.booking.dto.AuthDtos.UserDto;
import com.cinema.booking.dto.MovieDtos.MovieDetailDto;
import com.cinema.booking.entity.*;
import com.cinema.booking.repository.*;
import com.cinema.booking.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final MovieRepository movieRepository;
    private final MovieService movieService;
    private final CinemaRepository cinemaRepository;
    private final HallRepository hallRepository;
    private final ShowtimeRepository showtimeRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    @GetMapping("/movies")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<MovieDetailDto>>> getAdminMovies() {
        List<MovieDetailDto> movies = movieService.getAllMovies("all");
        return ResponseEntity.ok(ApiResponse.success(movies));
    }

    @PostMapping("/movies")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MovieDetailDto>> createMovie(@RequestBody Movie movie) {
        return ResponseEntity.ok(ApiResponse.success("Thêm phim mới thành công!", movieService.saveMovie(null, movie)));
    }

    @PutMapping("/movies/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MovieDetailDto>> updateMovie(@PathVariable Long id, @RequestBody Movie movieDetails) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật phim thành công!", movieService.saveMovie(id, movieDetails)));
    }

    @DeleteMapping("/movies/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa phim thành công!", null));
    }

    @GetMapping("/cinemas")
    public ResponseEntity<ApiResponse<List<Cinema>>> getCinemas() {
        return ResponseEntity.ok(ApiResponse.success(cinemaRepository.findAll()));
    }

    @GetMapping("/cinemas/{cinemaId}/rooms")
    public ResponseEntity<ApiResponse<List<Hall>>> getRoomsByCinema(@PathVariable Long cinemaId) {
        return ResponseEntity.ok(ApiResponse.success(hallRepository.findByCinemaId(cinemaId)));
    }

    @PostMapping("/showtimes")
    public ResponseEntity<ApiResponse<Showtime>> createShowtime(@RequestBody Map<String, Object> payload) {
        Long movieId = Long.valueOf(payload.get("movieId").toString());
        Long hallId = Long.valueOf(payload.get("hallId").toString());
        LocalDateTime startTime = LocalDateTime.parse(payload.get("startTime").toString());
        LocalDateTime endTime = LocalDateTime.parse(payload.get("endTime").toString());
        BigDecimal basePrice = new BigDecimal(payload.get("basePrice").toString());

        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new IllegalArgumentException("Phim không tồn tại"));
        Hall hall = hallRepository.findById(hallId)
                .orElseThrow(() -> new IllegalArgumentException("Phòng chiếu không tồn tại"));

        Showtime showtime = Showtime.builder()
                .movie(movie)
                .hall(hall)
                .startTime(startTime)
                .endTime(endTime)
                .basePrice(basePrice)
                .status("scheduled")
                .build();

        Showtime saved = showtimeRepository.save(showtime);
        return ResponseEntity.ok(ApiResponse.success("Thêm suất chiếu thành công!", saved));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getUsers() {
        List<User> users = userRepository.findAll();
        List<UserDto> dtos = users.stream().map(u -> UserDto.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .role(u.getRole().name())
                .status(u.getStatus().name())
                .createdAt(u.getCreatedAt())
                .build()).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<String>> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));

        String statusStr = payload.get("status");
        if (statusStr != null) {
            user.setStatus(User.UserStatus.valueOf(statusStr.toUpperCase()));
            userRepository.save(user);
        }
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái người dùng thành công!"));
    }

    @GetMapping("/stats/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalMovies = movieRepository.count();
        long totalBookings = bookingRepository.count();

        List<Booking> paidBookings = bookingRepository.findAll().stream()
                .filter(b -> "PAID".equalsIgnoreCase(b.getStatus()))
                .collect(Collectors.toList());

        BigDecimal totalRevenue = paidBookings.stream()
                .map(Booking::getFinalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalMovies", totalMovies);
        stats.put("totalBookings", totalBookings);
        stats.put("totalRevenue", totalRevenue);

        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
