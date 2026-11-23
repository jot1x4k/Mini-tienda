import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoForm } from './producto-form';
import { Producto } from '../producto/producto';

describe('ProductoForm', () => {
  let component: ProductoForm;
  let fixture: ComponentFixture<ProductoForm>;
  let pantalla: HTMLElement;

  // Ayudante: escribe un valor en el campo indicado, como lo haría el usuario
  function escribir(nombreCampo: string, valor: string) {
    const campo = pantalla.querySelector(`input[name="${nombreCampo}"]`) as HTMLInputElement;
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoForm);
    component = fixture.componentInstance;
    pantalla = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('al guardar emite los datos escritos en el formulario', async () => {
    let emitido: Omit<Producto, 'id'> | undefined;
    component.guardar.subscribe((datos) => (emitido = datos));

    escribir('nombre', 'Mango');
    escribir('precio', '8.9');
    escribir('stock', '10');
    escribir('imagen', '/imagenes/mango.jpg');
    (pantalla.querySelector('button[type="submit"]') as HTMLButtonElement).click();

    expect(emitido).toEqual({
      nombre: 'Mango',
      precio: 8.9,
      stock: 10,
      imagen: '/imagenes/mango.jpg',
      descuento: 0,
    });
  });

  it('después de guardar deja el formulario limpio', async () => {
    escribir('nombre', 'Mango');
    escribir('precio', '8.9');
    (pantalla.querySelector('button[type="submit"]') as HTMLButtonElement).click();

    expect(component.nombre()).toBe('');
    expect(component.precio()).toBe(0);
    expect(component.stock()).toBe(0);
    expect(component.imagen()).toBe('');
  });
});
