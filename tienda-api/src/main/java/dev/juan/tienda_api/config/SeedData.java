package dev.juan.tienda_api.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import dev.juan.tienda_api.model.Product;
import dev.juan.tienda_api.repository.ProductRepository;

@Component 
public class SeedData implements CommandLineRunner {
    private final ProductRepository repository;

    public SeedData(ProductRepository repository) {
        this.repository = repository;
    }

    @Override 
    public void run(String... args) {
        if(repository.count() == 0) {
            repository.saveAll(List.of(
                new Product("Manzana", 20.5, 3, "assets/img/manzana.jpg"),
                new Product("Piña", 15.36, 5, "assets/img/piña.jpg"),
                new Product("Pera", 5.45, 2, "assets/img/pera.jpg"),
                new Product("Papaya", 6.15, 0, "assets/img/papaya.jpg")
            ));
            System.out.println("Productos iniciales cargados");
        } else {
            System.out.println("Ya se habian cargado los productos iniciales anteriormente");
        }
    }
}
