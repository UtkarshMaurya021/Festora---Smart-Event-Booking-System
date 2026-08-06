package com.festora.payment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PaymentMicroserviceApplication {

    public static void main(String[] args) {
        SpringApplication.run(PaymentMicroserviceApplication.class, args);
        System.out.println("=================================================");
        System.out.println("⚡ FESTORA RAZORPAY PAYMENT MICROSERVICE STARTED");
        System.out.println("   Running on Port: 8081");
        System.out.println("   Health check: http://localhost:8081/api/razorpay/health");
        System.out.println("=================================================");
    }
}
