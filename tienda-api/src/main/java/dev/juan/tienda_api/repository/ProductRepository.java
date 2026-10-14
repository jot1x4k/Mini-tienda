package dev.juan.tienda_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import dev.juan.tienda_api.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
