import { Component, input, output, computed } from '@angular/core';
import { Producto } from '../producto/producto';
 
@Component({
  selector: 'app-producto-card',
  imports: [],
  templateUrl: './producto-card.html',
  styleUrl: './producto-card.css'
})
export class ProductoCard {
  producto = input.required<Producto>();
  comprar = output<number>();
  reponer = output<Producto>();   // NUEVO
  eliminar = output<number>();    // NUEVO
  aplicarDescuento = output<number>();

  total = computed(() => this.producto().precio - (this.producto().precio * (this.producto().descuento / 100))
  );
 
  alHacerClic() {
    this.comprar.emit(this.producto().id);
  }
}
