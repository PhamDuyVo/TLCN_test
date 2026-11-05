package com.cinema.booking.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import java.util.Map;

@Configuration
@EnableScheduling
public class CloudinaryConfig {
    @Bean
    public Cloudinary cloudinary(@Value("${CLOUDINARY_CLOUD_NAME:}") String name,
            @Value("${CLOUDINARY_API_KEY:${API_KEY:}}") String key,
            @Value("${CLOUDINARY_API_SECRET:${API_SECRET:}}") String secret) {
        return new Cloudinary(Map.of("cloud_name", name, "api_key", key, "api_secret", secret,
                "secure", true, "connect_timeout", 10000, "read_timeout", 30000));
    }
}
