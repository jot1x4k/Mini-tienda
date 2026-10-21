
package dev.juan.tienda_api.config;

import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ManejadorErrores {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> manejarEstado(
            ResponseStatusException ex) {

        String mensaje = ex.getReason() != null
                ? ex.getReason()
                : "Error en la petición";

        System.out.println("Error capturado: " + mensaje);

        return ResponseEntity
                .status(ex.getStatusCode())
                .body(Map.of("mensaje", mensaje));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> manejarValidacion(
            MethodArgumentNotValidException ex) {

        String mensaje = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getDefaultMessage())
                .collect(Collectors.joining(". "));

        return ResponseEntity.badRequest()
                .body(Map.of("mensaje", mensaje));
    }
}
