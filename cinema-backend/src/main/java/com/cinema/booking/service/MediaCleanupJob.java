package com.cinema.booking.service;

import com.cinema.booking.entity.MovieMedia.State;
import com.cinema.booking.repository.MovieMediaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;
import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class MediaCleanupJob {
    private final MovieMediaRepository repository;
    private final CloudinaryGateway cloud;
    private final TransactionTemplate transactions;

    @Scheduled(fixedDelayString = "${CLOUDINARY_CLEANUP_INTERVAL_MS:60000}")
    public void cleanup() {
        for (String id : repository.cleanupCandidates(List.of(State.PENDING, State.OBSOLETE), Instant.now(), PageRequest.of(0, 25))) {
            try { cleanupOne(id); }
            catch (Exception e) { log.warn("Media cleanup transaction failed for {}; will retry", id); }
        }
    }
    public void cleanupOne(String id) {
        transactions.executeWithoutResult(tx -> {
            var media = repository.lockById(id).orElse(null);
            if (media == null || (media.getState() != State.PENDING && media.getState() != State.OBSOLETE)
                    || !media.getCleanupAfter().isBefore(Instant.now())) return;
            try {
                // resource_type is not signed by Cloudinary. Sweep only this server-owned UUID
                // in both media namespaces, plus raw filenames for the signed allowed formats.
                for (String type : List.of("image", "video")) cloud.destroy(media.getPublicId(), type);
                cloud.destroy(media.getPublicId(), "raw");
                for (String ext : List.of("jpg", "png", "webp", "mp4"))
                    cloud.destroy(media.getPublicId() + "." + ext, "raw");
                media.setState(State.CLEANED);
            } catch (Exception e) {
                media.setAttempts(media.getAttempts() + 1);
                media.setCleanupAfter(Instant.now().plusSeconds(Math.min(21600, 60L << Math.min(media.getAttempts(), 8))));
                log.warn("Media cleanup deferred for {} (attempt {})", id, media.getAttempts());
            }
        });
    }
}
