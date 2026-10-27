import { Component, input, output } from '@angular/core';
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
 
  alHacerClic() {
    this.comprar.emit(this.producto().id);
  }
}
