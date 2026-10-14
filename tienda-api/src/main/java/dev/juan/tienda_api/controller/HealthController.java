package dev.juan.tienda_api.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;


@RestController 
public class HealthController {
    @GetMapping("/api/health")
    public String getHealth() {
        return "Hello, World!";
    }
    
}
