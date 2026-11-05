package com.cinema.booking.config;

import com.cinema.booking.entity.FoodCombo;
import com.cinema.booking.repository.FoodComboRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

/** Optional demo data only. Never creates or changes accounts. */
@Component
@Profile("demo")
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final FoodComboRepository combos;
    @Override @Transactional
    public void run(String... args) {
        add("Bắp rang", "Một phần bắp rang", "45000");
        add("Nước ngọt", "Một ly nước ngọt", "30000");
        add("Combo đôi", "Một bắp lớn và hai nước", "99000");
    }
    private void add(String name, String description, String price) {
        if (combos.findAll().stream().noneMatch(c -> name.equals(c.getName()))) {
            combos.save(FoodCombo.builder().name(name).description(description)
                .price(new BigDecimal(price)).status("active").build());
        }
    }
}
