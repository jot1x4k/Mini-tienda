import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoCard } from './producto-card';
import { Producto } from '../producto/producto';

describe('ProductoCard', () => {
  let component: ProductoCard;
  let fixture: ComponentFixture<ProductoCard>;
  let pantalla: HTMLElement;

  const manzana: Producto = {
    id: 1,
    nombre: 'Manzana',
    precio: 20.5,
    stock: 3,
    imagen: '/imagenes/manzana.jpg',
    descuento: 0,
  };

  // Ayudante: muestra la tarjeta con el producto indicado
  async function mostrar(producto: Producto) {
    fixture.componentRef.setInput('producto', producto);
    await fixture.whenStable();
  }

  // Ayudante: busca un botón por su texto
  function boton(texto: string): HTMLButtonElement {
    const botones = Array.from(pantalla.querySelectorAll('button'));
    return botones.find((b) => b.textContent?.trim() === texto) as HTMLButtonElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoCard);
    component = fixture.componentInstance;
    pantalla = fixture.nativeElement;
  });

  it('muestra el nombre y el precio del producto', async () => {
    await mostrar(manzana);

    expect(pantalla.querySelector('h3')?.textContent).toBe('Manzana');
    expect(pantalla.textContent).toContain('Precio: $20.5');
  });

  // Las pruebas se agregan aquí, en los pasos siguientes
  it('con stock 1 muestra el stock y deja comprar', async () => {
    await mostrar({ ...manzana, stock: 1 });

    expect(pantalla.textContent).toContain('Stock: 1');
    expect(pantalla.textContent).not.toContain('Agotado');
    expect(boton('Comprar').disabled).toBe(false);
  });

  it('con stock 0 muestra Agotado y deshabilita Comprar', async () => {
    await mostrar({ ...manzana, stock: 0 });

    expect(pantalla.textContent).toContain('Agotado');
    expect(pantalla.textContent).not.toContain('Stock:');
    expect(boton('Comprar').disabled).toBe(true);
  });

  it('al hacer clic en Comprar emite el id del producto', async () => {
    await mostrar(manzana);
    let idEmitido: number | undefined;
    component.comprar.subscribe((id) => (idEmitido = id));

    boton('Comprar').click();

    expect(idEmitido).toBe(1);
  });

  it('al hacer clic en +5 stock emite el producto completo', async () => {
    await mostrar(manzana);
    let emitido: Producto | undefined;
    component.reponer.subscribe((p) => (emitido = p));

    boton('+5 stock').click();

    expect(emitido).toEqual(manzana);
  });

  it('al hacer clic en Eliminar emite el id del producto', async () => {
    await mostrar(manzana);
    let idEmitido: number | undefined;
    component.eliminar.subscribe((id) => (idEmitido = id));

    boton('Eliminar').click();

    expect(idEmitido).toBe(1);
  });
});
