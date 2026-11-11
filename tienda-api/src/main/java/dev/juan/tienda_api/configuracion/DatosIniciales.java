package dev.juan.tienda_api.configuracion;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import dev.juan.tienda_api.modelo.Producto;
import dev.juan.tienda_api.repositorio.ProductoRepositorio;

@Component
public class DatosIniciales implements CommandLineRunner {
    private final ProductoRepositorio repositorio;

    public DatosIniciales(ProductoRepositorio repositorio) {
        this.repositorio = repositorio;
    }

    @Override
    public void run(String... args) {
        if (repositorio.count() == 0) {
            repositorio.saveAll(List.of(
                new Producto("Manzana", 20.5, 3, "/assets/img/manzana.jpg"),
                new Producto("Piña", 15.36, 5, "/assets/img/pina.jpg"),
                new Producto("Pera", 5.45, 2, "/assets/img/pera.jpg"),
                new Producto("Papaya", 6.15, 0, "/assets/img/papaya.jpg")
            ));
            System.out.println("Productos iniciales cargados");
        } else {
            System.out.println("Ya se habian cargado los productos iniciales anteriormente");
        }
    }
}
