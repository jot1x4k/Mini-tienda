package dev.juan.tienda_api.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import dev.juan.tienda_api.model.Product;
import dev.juan.tienda_api.repository.ProductRepository;
import jakarta.transaction.Transactional;

@Service
public class ProductService {
    private final ProductRepository repositorio;

    public ProductService(ProductRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<Product> listar() {
        return repositorio.findAll();
    }

    public Product buscarPorId(Long id) {
        // findById devuelve un Optional: puede traer el Product o venir vacío
        return repositorio.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No existe el Product con id " + id));
    }

    public Product crear(Product Product) {
        Product.setId(null); // el id lo asigna la base de datos, nunca el cliente
        return repositorio.save(Product);
    }

    public Product actualizar(Long id, Product datos) {
        Product existente = buscarPorId(id); // si no existe, lanza 404
        existente.setNombre(datos.getNombre());
        existente.setPrecio(datos.getPrecio());
        existente.setStock(datos.getStock());
        existente.setImage(datos.getImage());
        return repositorio.save(existente);
    }

    public void eliminar(Long id) {
        Product existente = buscarPorId(id);
        repositorio.delete(existente);
    }

    // La regla del negocio que antes estaba en Angular
    @Transactional
    public Product comprar(Long id) {
        Product producto = buscarPorId(id);
        if (producto.getStock() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Lo sentimos, ya no hay stock");
        }
        producto.setStock(producto.getStock() - 1);
        return repositorio.save(producto);
    }

    public Product aplicarDescuento(Long id, Integer descuento) {
        Product producto = buscarPorId(id);
        if (producto.getStock() <= 0 && descuento > 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "No se puede poner en oferta un producto agotado");
        }

        if (descuento < 0 || descuento > 50) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "El valor del descuento debe estar entre 0 y 50");
        }

        producto.setDescuento(descuento);
        return repositorio.save(producto);
    }

}
