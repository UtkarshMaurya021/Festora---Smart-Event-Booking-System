package com.festora;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FestoraBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(FestoraBackendApplication.class, args);
	}
}
