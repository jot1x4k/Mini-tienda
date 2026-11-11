package dev.juan.tienda_api.configuracion;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ConfiguracionCors implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registro) {
        registro.addMapping("/api/**")                    // todas las rutas de la API
                .allowedOrigins("http://localhost:4200")  // solo el frontend Angular
                .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
