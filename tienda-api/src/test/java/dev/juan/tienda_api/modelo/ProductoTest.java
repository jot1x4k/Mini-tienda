package dev.juan.tienda_api.modelo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ProductoTest {
    @Test
    @DisplayName("El constructor guarda los datos y deja el id vacío")
    void constructorGuardaLosDatos() {
        // Preparar y actuar: se crea el producto
        Producto producto = new Producto("Manzana", 20.5, 3, "/imagenes/manzana.jpg");
        // Verificar: cada dato quedó en su lugar
        assertEquals("Manzana", producto.getNombre());
        assertEquals(20.5, producto.getPrecio());
        assertEquals(3, producto.getStock());
        assertEquals("/imagenes/manzana.jpg", producto.getImagen());
        assertNull(producto.getId()); // el id lo asigna la base de datos
    }
}
