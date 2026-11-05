package com.cinema.booking.service;

import com.cinema.booking.dto.MovieDtos.MovieDetailDto;
import com.cinema.booking.entity.Genre;
import com.cinema.booking.entity.Movie;
import com.cinema.booking.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MovieService {

    private final MovieRepository movieRepository;
    private final MediaService mediaService;
    private final jakarta.persistence.EntityManager entityManager;

    @Transactional
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public MovieDetailDto saveMovie(Long id, Movie input) {
        if (input.getTitle() == null || input.getTitle().isBlank() || input.getTitle().length() > 200
                || input.getDurationMinutes() == null || input.getDurationMinutes() <= 0 || input.getReleaseDate() == null
                || (input.getEndDate() != null && input.getEndDate().isBefore(input.getReleaseDate()))
                || !java.util.Set.of("now_showing", "coming_soon", "ended").contains(input.getStatus() == null ? "" : input.getStatus()))
            throw new IllegalArgumentException("Thông tin phim không hợp lệ");
        Movie movie = id == null ? new Movie() : entityManager.find(Movie.class, id, jakarta.persistence.LockModeType.PESSIMISTIC_WRITE);
        if (movie == null) throw new IllegalArgumentException("Phim không tồn tại");
        movie.setTitle(input.getTitle().trim());
        movie.setOriginalTitle(input.getOriginalTitle());
        movie.setDurationMinutes(input.getDurationMinutes());
        movie.setReleaseDate(input.getReleaseDate());
        movie.setEndDate(input.getEndDate());
        movie.setAgeRating(input.getAgeRating());
        movie.setDescription(input.getDescription());
        movie.setDirector(input.getDirector());
        movie.setCast(input.getCast());
        movie.setStatus(input.getStatus());
        // Media URLs are changed only through verified media endpoints. Preserve legacy URLs.
        return mapToDto(movieRepository.save(movie));
    }

    @Transactional
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public void deleteMovie(Long id) {
        mediaService.retireMovie(id);
        movieRepository.deleteById(id);
        movieRepository.flush(); // FK failures roll back retirement as well as movie deletion.
    }


    public List<MovieDetailDto> getAllMovies(String status) {
        List<Movie> movies;
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("all")) {
            movies = movieRepository.findByStatus(status);
        } else {
            movies = movieRepository.findAll();
        }
        return movies.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public MovieDetailDto getMovieById(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phim với ID: " + id));
        return mapToDto(movie);
    }

    public MovieDetailDto mapToDto(Movie m) {
        return MovieDetailDto.builder()
                .id(m.getId())
                .title(m.getTitle())
                .originalTitle(m.getOriginalTitle())
                .durationMinutes(m.getDurationMinutes())
                .releaseDate(m.getReleaseDate())
                .endDate(m.getEndDate())
                .ageRating(m.getAgeRating())
                .posterUrl(m.getPosterUrl())
                .bannerUrl(m.getBannerUrl())
                .trailerUrl(m.getTrailerUrl())
                .description(m.getDescription())
                .director(m.getDirector())
                .cast(m.getCast())
                .status(m.getStatus())
                .genres(m.getGenres().stream().map(Genre::getName).collect(Collectors.toList()))
                .build();
    }
}
