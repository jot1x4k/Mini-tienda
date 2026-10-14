package dev.juan.tienda_api.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dev.juan.tienda_api.model.Product;
import dev.juan.tienda_api.repository.ProductRepository;


@RestController
@RequestMapping("/api/products")
public class ProductController {
    
    private final ProductRepository repository;

    public ProductController(ProductRepository repository) {
        this.repository = repository;
    }

    @GetMapping("") 
    public List<Product> findAllProducts(){
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }
    
}
