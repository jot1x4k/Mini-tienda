package dev.juan.tienda_api.controlador;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
public class ControladorSalud {
    @GetMapping("/api/salud")
    public String obtenerSalud() {
        return "Hola, mundo";
    }

}
