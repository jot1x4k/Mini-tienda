package dev.juan.tienda_api.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dev.juan.tienda_api.model.Product;
import dev.juan.tienda_api.repository.ProductRepository;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository repository;

    public ProductController(ProductRepository repository) {
        this.repository = repository;
    }

    @GetMapping("")
    public List<Product> findAllProducts() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }

    @PostMapping("")
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product product) {
        Product saved_product = repository.save(product);
        return new ResponseEntity<>(saved_product, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @Valid @RequestBody Product product) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setImage(product.getImage());
                    existing.setNombre(product.getNombre());
                    existing.setPrecio(product.getPrecio());
                    existing.setStock(product.getStock());

                    Product updatedProduct = repository.save(existing);

                    return ResponseEntity.ok(updatedProduct);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping ("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        return repository.findById(id)
        .map(product -> {
            repository.delete(product);
            return ResponseEntity.noContent().<Void>build();
        })
        .orElse(ResponseEntity.notFound().build());
    }

}
