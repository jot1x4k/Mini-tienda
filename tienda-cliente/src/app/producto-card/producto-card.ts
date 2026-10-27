import { Component, input, output, computed } from '@angular/core';
import { Producto } from '../producto/producto';

@Component({
  selector: 'app-producto-card',
  imports: [],
  templateUrl: './producto-card.html',
  styleUrl: './producto-card.css',
})
export class ProductoCard {
  producto = input.required<Producto>();
  comprar = output<number>();
  reponer = output<Producto>(); // NUEVO
  eliminar = output<number>(); // NUEVO

  aplicarDescuento = output<{ id: number; descuento: number }>();
  descuentoNuevo = 0;

  total = computed(
    () => this.producto().precio - this.producto().precio * (this.producto().descuento / 100),
  );

  aplicarDescuentoClick() {
    const descuento = this.descuentoNuevo;

    if (!Number.isFinite(descuento) || descuento < 0 || descuento > 50) {
      alert('El descuento debe estar entre 0 y 50%.');
      return;
    }

    this.aplicarDescuento.emit({
      id: this.producto().id,
      descuento,
    });
  }

  alHacerClic() {
    this.comprar.emit(this.producto().id);
  }
}
