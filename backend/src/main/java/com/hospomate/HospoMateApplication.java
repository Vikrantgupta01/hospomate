package com.hospomate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableScheduling
@EnableCaching
public class HospoMateApplication {

	public static void main(String[] args) {
		SpringApplication.run(HospoMateApplication.class, args);
	}

}
