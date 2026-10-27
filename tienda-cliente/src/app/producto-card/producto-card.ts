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

  // Evento propio del componente. El <number> indica que enviará un número (el id)
  comprar = output<number>();

  alHacerClic() {
    // emit() dispara el evento y envía el id hacia el componente padre
    this.comprar.emit(this.producto().id);
  }
}
