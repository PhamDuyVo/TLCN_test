package com.cinema.booking.controller;

import com.cinema.booking.dto.ApiResponse;
import com.cinema.booking.dto.MovieDtos.MovieDetailDto;
import com.cinema.booking.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MovieDetailDto>>> getAllMovies(@RequestParam(required = false) String status) {
        List<MovieDetailDto> movies = movieService.getAllMovies(status);
        return ResponseEntity.ok(ApiResponse.success(movies));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieDetailDto>> getMovieById(@PathVariable Long id) {
        MovieDetailDto movie = movieService.getMovieById(id);
        return ResponseEntity.ok(ApiResponse.success(movie));
    }
}
