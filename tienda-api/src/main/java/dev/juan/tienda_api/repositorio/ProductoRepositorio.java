package dev.juan.tienda_api.repositorio;

import org.springframework.data.jpa.repository.JpaRepository;

import dev.juan.tienda_api.modelo.Producto;

public interface ProductoRepositorio extends JpaRepository<Producto, Long> {
}
