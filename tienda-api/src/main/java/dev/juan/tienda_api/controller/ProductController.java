package dev.juan.tienda_api.controller;
 
import java.util.List;
 
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import dev.juan.tienda_api.model.Product;
import dev.juan.tienda_api.service.ProductService;
import jakarta.validation.Valid;
 
@RestController
@RequestMapping("/api/products") // prefijo común de todas las rutas de esta clase
public class ProductController {
 
    private final ProductService servicio;
 
    public ProductController(ProductService servicio) {
        this.servicio = servicio;
    }
 
    // GET /api/Products
    @GetMapping
    public List<Product> listar() {
        return servicio.listar();
    }
 
    // GET /api/Products/3  -> {id} toma el valor 3
    @GetMapping("/{id}")
    public Product buscar(@PathVariable Long id) {
        return servicio.buscarPorId(id);
    }
 
    // POST /api/Products  con un JSON en el cuerpo
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Product crear(@Valid @RequestBody Product Product) {
        return servicio.crear(Product);
    }
 
    // PUT /api/Products/3  con un JSON en el cuerpo
    @PutMapping("/{id}")
    public Product actualizar(@PathVariable Long id,
                               @Valid @RequestBody Product Product) {
        return servicio.actualizar(id, Product);
    }
 
    // DELETE /api/Products/3
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        servicio.eliminar(id);
    }
 
    // POST /api/Products/3/comprar
    @PostMapping("/{id}/comprar")
    public Product comprar(@PathVariable Long id) {
        return servicio.comprar(id);
    }
}
