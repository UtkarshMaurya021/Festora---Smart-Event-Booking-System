package com.festora.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class SchemaFixRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public SchemaFixRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE booking MODIFY COLUMN status VARCHAR(50)");
            System.out.println("✅ [SCHEMA FIX] Successfully altered booking.status to VARCHAR(50)");
        } catch (Exception e) {
            System.out.println("ℹ️ [SCHEMA FIX] booking.status alter notice: " + e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE payment MODIFY COLUMN status VARCHAR(50)");
            System.out.println("✅ [SCHEMA FIX] Successfully altered payment.status to VARCHAR(50)");
        } catch (Exception e) {
            System.out.println("ℹ️ [SCHEMA FIX] payment.status alter notice: " + e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE payment MODIFY COLUMN payment_method VARCHAR(50)");
            System.out.println("✅ [SCHEMA FIX] Successfully altered payment.payment_method to VARCHAR(50)");
        } catch (Exception e) {
            System.out.println("ℹ️ [SCHEMA FIX] payment.payment_method alter notice: " + e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE event MODIFY COLUMN status VARCHAR(50)");
            System.out.println("✅ [SCHEMA FIX] Successfully altered event.status to VARCHAR(50)");
        } catch (Exception e) {
            System.out.println("ℹ️ [SCHEMA FIX] event.status alter notice: " + e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE ticket MODIFY COLUMN status VARCHAR(50)");
            System.out.println("✅ [SCHEMA FIX] Successfully altered ticket.status to VARCHAR(50)");
        } catch (Exception e) {
            System.out.println("ℹ️ [SCHEMA FIX] ticket.status alter notice: " + e.getMessage());
        }
    }
}
