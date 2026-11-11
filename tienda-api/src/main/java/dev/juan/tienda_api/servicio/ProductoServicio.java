package dev.juan.tienda_api.servicio;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import dev.juan.tienda_api.modelo.Producto;
import dev.juan.tienda_api.repositorio.ProductoRepositorio;
import jakarta.transaction.Transactional;

@Service
public class ProductoServicio {
    private final ProductoRepositorio repositorio;

    public ProductoServicio(ProductoRepositorio repositorio) {
        this.repositorio = repositorio;
    }

    public List<Producto> listar() {
        return repositorio.findAll();
    }

    public Producto buscarPorId(Long id) {
        // findById devuelve un Optional: puede traer el producto o venir vacío
        return repositorio.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No existe el producto con id " + id));
    }

    public Producto crear(Producto producto) {
        producto.setId(null); // el id lo asigna la base de datos, nunca el cliente
        return repositorio.save(producto);
    }

    public Producto actualizar(Long id, Producto datos) {
        Producto existente = buscarPorId(id); // si no existe, lanza 404
        existente.setNombre(datos.getNombre());
        existente.setPrecio(datos.getPrecio());
        existente.setStock(datos.getStock());
        existente.setImagen(datos.getImagen());
        return repositorio.save(existente);
    }

    public void eliminar(Long id) {
        Producto existente = buscarPorId(id);
        repositorio.delete(existente);
    }

    // La regla del negocio que antes estaba en Angular
    @Transactional
    public Producto comprar(Long id) {
        Producto producto = buscarPorId(id);
        if (producto.getStock() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Lo sentimos, ya no hay stock");
        }
        producto.setStock(producto.getStock() - 1);
        return repositorio.save(producto);
    }

    public Producto aplicarDescuento(Long id, Integer descuento) {
        Producto producto = buscarPorId(id);
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
