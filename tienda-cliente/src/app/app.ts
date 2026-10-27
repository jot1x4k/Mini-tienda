import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Producto } from './producto/producto';
import { ProductoCard } from './producto-card/producto-card';
import { ProductoApi } from './servicios/producto-api';
 
@Component({
  selector: 'app-root',
  imports: [ProductoCard],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private api = inject(ProductoApi);
 
  productos = signal<Producto[]>([]); // ahora empieza vacía
  cargando = signal(true);
  carrito = signal<Producto[]>([]);
  mensaje = signal('');
  esError = signal(false);
 
  total = computed(() =>
    this.carrito().reduce((suma, item) => suma + item.precio, 0)
  );
 
  // ngOnInit se ejecuta una vez, cuando el componente aparece en pantalla
  ngOnInit() {
    this.cargarProductos();
  }
 
  cargarProductos() {
    this.cargando.set(true);
    this.api.listar().subscribe({
      next: (lista) => {
        this.productos.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.mostrarMensaje('No se pudo conectar con el servidor', true);
      }
    });
  }
 
  agregarAlCarrito(id: number) {
    // Conservar aquí el código que ya tenía este método; se cambia en el Paso 20
  }

   mostrarMensaje(texto: string, error: boolean) {
    this.mensaje.set(texto);
    this.esError.set(error);
    setTimeout(() => this.mensaje.set(''), 3000);
  }
}
