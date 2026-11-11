package dev.juan.tienda_api.servicio;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import dev.juan.tienda_api.modelo.Producto;
import dev.juan.tienda_api.repositorio.ProductoRepositorio;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

// Activa Mockito: crea los @Mock y los entrega al @InjectMocks antes de cada
// prueba
@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {
    // Repositorio FALSO: tiene los mismos métodos, pero no toca la base de datos
    @Mock
    private ProductoRepositorio repositorio;
    // Servicio REAL: Mockito lo construye pasándole el repositorio falso
    @InjectMocks
    private ProductoServicio servicio;

    // Ayudante: crea un producto de prueba con el id y el stock indicados
    private Producto crearProducto(Long id, int stock) {
        Producto producto = new Producto("Manzana", 20.5, stock, "/imagenes/manzana.jpg");
        producto.setId(id);
        return producto;
    }

    // Las pruebas se agregan aquí, en los pasos siguientes

    // CP-01
    @Test
    @DisplayName("CP-01 buscarPorId devuelve el producto cuando existe")
    void buscarPorIdDevuelveElProducto() {
        // Preparar: el repositorio falso tiene la manzana con id 1
        Producto manzana = crearProducto(1L, 3);
        when(repositorio.findById(1L)).thenReturn(Optional.of(manzana));
        // Actuar
        Producto resultado = servicio.buscarPorId(1L);
        // Verificar
        assertEquals(1L, resultado.getId());
        assertEquals("Manzana", resultado.getNombre());
    }

    // CP-02
    @Test
    @DisplayName("CP-02 buscarPorId lanza 404 cuando el producto no existe")
    void buscarPorIdLanza404() {
        // Preparar: el repositorio falso no encuentra el producto 99
        when(repositorio.findById(99L)).thenReturn(Optional.empty());
        // Actuar y verificar: se espera un error
        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> servicio.buscarPorId(99L));
        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
        assertEquals("No existe el producto con id 99", error.getReason());
    }

    // CP-03 y CP-04: un valor límite (1), un valor típico (2) y un valor alto (50)
    @ParameterizedTest(name = "stock {0} queda en {1}")
    @CsvSource({ "1, 0", "2, 1", "50, 49" })
    @DisplayName("CP-03 y CP-04 comprar con stock descuenta una unidad y guarda")
    void comprarConStockDescuentaUnaUnidad(int stockInicial, int stockEsperado) {
        // Preparar
        Producto producto = crearProducto(1L, stockInicial);
        when(repositorio.findById(1L)).thenReturn(Optional.of(producto));
        when(repositorio.save(producto)).thenReturn(producto);
        // Actuar
        Producto resultado = servicio.comprar(1L);
        // Verificar
        assertEquals(stockEsperado, resultado.getStock());
        verify(repositorio).save(producto);
    }

    // CP-05: el valor límite (0) y un valor por fuera de la partición (-1)
    @ParameterizedTest(name = "stock {0} no permite comprar")
    @ValueSource(ints = { 0, -1 })
    @DisplayName("CP-05 comprar sin stock lanza 409 y no guarda")
    void comprarSinStockLanza409(int stock) {
        // Preparar
        Producto producto = crearProducto(1L, stock);
        when(repositorio.findById(1L)).thenReturn(Optional.of(producto));
        // Actuar y verificar
        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> servicio.comprar(1L));
        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        assertEquals(stock, producto.getStock());
        // el stock no cambió
        verify(repositorio, never()).save(any(Producto.class)); // no se guardó nada
    }

    // CP-06
    @Test
    @DisplayName("CP-06 comprar un producto que no existe lanza 404 y no guarda")
    void comprarProductoInexistente() {
        // Preparar
        when(repositorio.findById(99L)).thenReturn(Optional.empty());
        // Actuar y verificar
        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> servicio.comprar(99L));
        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
        verify(repositorio, never()).save(any(Producto.class));
    }

    // CP-07
    @Test
    @DisplayName("CP-07 crear ignora el id enviado y deja que lo asigne la base de datos")
    void crearIgnoraElIdEnviado() {
        // Preparar: alguien envía un producto con un id inventado
        Producto nuevo = crearProducto(77L, 10);
        when(repositorio.save(nuevo)).thenReturn(nuevo);
        // Actuar
        Producto resultado = servicio.crear(nuevo);
        // Verificar
        assertNull(resultado.getId());
        verify(repositorio).save(nuevo);
    }

    // CP-08
    @Test
    @DisplayName("CP-08 actualizar guarda los datos nuevos y conserva el id")
    void actualizarCopiaLosDatosNuevos() {
        // Preparar
        Producto existente = crearProducto(1L, 3);
        Producto datosNuevos = new Producto("Manzana roja", 22.0, 8, "/imagenes/manzana-roja.jpg");
        when(repositorio.findById(1L)).thenReturn(Optional.of(existente));
        // Actuar
        servicio.actualizar(1L, datosNuevos);
        // Verificar: se atrapa el producto que el servicio le pasó a save()
        ArgumentCaptor<Producto> captor = ArgumentCaptor.forClass(Producto.class);
        verify(repositorio).save(captor.capture());
        Producto guardado = captor.getValue();
        assertEquals(1L, guardado.getId());
        assertEquals("Manzana roja", guardado.getNombre());
        assertEquals(22.0, guardado.getPrecio());
        assertEquals(8, guardado.getStock());
        assertEquals("/imagenes/manzana-roja.jpg", guardado.getImagen());
    }

    // CP-09
    @Test
    @DisplayName("CP-09 actualizar un producto que no existe lanza 404 y no guarda")
    void actualizarProductoInexistente() {
        // Preparar
        Producto datosNuevos = new Producto("Mango", 8.9, 10, "/imagenes/mango.jpg");
        when(repositorio.findById(99L)).thenReturn(Optional.empty());
        // Actuar y verificar
        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> servicio.actualizar(99L, datosNuevos));
        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
        verify(repositorio, never()).save(any(Producto.class));
    }

    // CP-10
    @Test
    @DisplayName("CP-10 eliminar un producto existente le pide al repositorio borrarlo")
    void eliminarProductoExistente() {
        // Preparar
        Producto pera = crearProducto(3L, 2);
        when(repositorio.findById(3L)).thenReturn(Optional.of(pera));
        // Actuar
        servicio.eliminar(3L);
        // Verificar
        verify(repositorio).delete(pera);
    }

    // CP-11
    @Test
    @DisplayName("CP-11 eliminar un producto que no existe lanza 404 y no borra nada")
    void eliminarProductoInexistente() {
        // Preparar
        when(repositorio.findById(99L)).thenReturn(Optional.empty());
        // Actuar y verificar
        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> servicio.eliminar(99L));
        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
        verify(repositorio, never()).delete(any(Producto.class));
    }

    // CP-12
    @Test
    @DisplayName("CP-12 listar devuelve los productos que trae el repositorio")
    void listarDevuelveLosProductos() {
        // Preparar
        when(repositorio.findAll())
                .thenReturn(List.of(crearProducto(1L, 3), crearProducto(2L, 5)));
        // Actuar
        List<Producto> resultado = servicio.listar();
        // Verificar
        assertEquals(2, resultado.size());
        assertEquals(5, resultado.get(1).getStock());
    }

}
