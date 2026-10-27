import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Producto } from './producto/producto';
import { ProductoCard } from './producto-card/producto-card';
import { ProductoForm } from './producto-form/producto-form';
import { ProductoApi } from './servicios/producto-api';
 
@Component({
  selector: 'app-root',
  imports: [ProductoCard, ProductoForm],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private api = inject(ProductoApi);
 
  productos = signal<Producto[]>([]);
  cargando = signal(true);
  carrito = signal<Producto[]>([]);
  mensaje = signal('');
  esError = signal(false);
 
  total = computed(() =>
    this.carrito().reduce((suma, item) => suma + (item.precio - (item.precio * (item.descuento / 100))), 0)
  );
 
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
    this.api.comprar(id).subscribe({
      next: (actualizado) => {
        this.carrito.update(items => [...items, actualizado]);
        this.reemplazarEnLista(actualizado);
        this.mostrarMensaje(actualizado.nombre + ' agregado al carrito', false);
      },
      error: (err: HttpErrorResponse) =>
        this.mostrarMensaje(this.textoError(err, 'No se pudo completar la compra'), true)
    });
  }
 
  crearProducto(datos: Omit<Producto, 'id'>) {
    this.api.crear(datos).subscribe({
      next: (creado) => {
        this.productos.update(lista => [...lista, creado]);
        this.mostrarMensaje(creado.nombre + ' creado', false);
      },
      error: (err: HttpErrorResponse) =>
        this.mostrarMensaje(this.textoError(err, 'No se pudo crear el producto'), true)
    });
  }
 
  reponerStock(producto: Producto) {
    const cambiado = { ...producto, stock: producto.stock + 5 };
    this.api.actualizar(cambiado).subscribe({
      next: (actualizado) => {
        this.reemplazarEnLista(actualizado);
        this.mostrarMensaje('Stock de ' + actualizado.nombre + ' actualizado', false);
      },
      error: (err: HttpErrorResponse) =>
        this.mostrarMensaje(this.textoError(err, 'No se pudo actualizar'), true)
    });
  }
 
  eliminarProducto(id: number) {
    if (!confirm('¿Seguro que desea eliminar este producto?')) {
      return;
    }
    this.api.eliminar(id).subscribe({
      next: () => {
        this.productos.update(lista => lista.filter(p => p.id !== id));
        this.mostrarMensaje('Producto eliminado', false);
      },
      error: (err: HttpErrorResponse) =>
        this.mostrarMensaje(this.textoError(err, 'No se pudo eliminar'), true)
    });
  }
 
  mostrarMensaje(texto: string, error: boolean) {
    this.mensaje.set(texto);
    this.esError.set(error);
    setTimeout(() => this.mensaje.set(''), 3000);
  }
 
  private reemplazarEnLista(actualizado: Producto) {
    this.productos.update(lista =>
      lista.map(p => p.id === actualizado.id ? actualizado : p)
    );
  }
 
  private textoError(err: HttpErrorResponse, porDefecto: string): string {
    return err.error?.mensaje ?? porDefecto;
  }
}
