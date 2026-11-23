import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { App } from './app';
import { Producto } from './producto/producto';
import { ProductoApi } from './servicios/producto-api';

describe('App', () => {
  // Datos de prueba: los mismos cuatro productos del backend
  const catalogo: Producto[] = [
    {
      id: 1,
      nombre: 'Manzana',
      precio: 20.5,
      stock: 3,
      imagen: '/imagenes/manzana.jpg',
      descuento: 0,
    },
    { id: 2, nombre: 'Piña', precio: 15.36, stock: 5, imagen: '/imagenes/pina.jpg', descuento: 0 },
    { id: 3, nombre: 'Pera', precio: 5.45, stock: 2, imagen: '/imagenes/pera.jpg', descuento: 0 },
    {
      id: 4,
      nombre: 'Papaya',
      precio: 6.15,
      stock: 0,
      imagen: '/imagenes/papaya.jpg',
      descuento: 0,
    },
  ];

  // Servicio FALSO: tiene los mismos métodos que ProductoApi, pero no hace peticiones
  let apiFalsa: {
    listar: ReturnType<typeof vi.fn>;
    comprar: ReturnType<typeof vi.fn>;
    crear: ReturnType<typeof vi.fn>;
    actualizar: ReturnType<typeof vi.fn>;
    eliminar: ReturnType<typeof vi.fn>;
    aplicarDescuento: ReturnType<typeof vi.fn>;
  };

  // Ayudante: crea el componente principal y espera a que se dibuje
  async function crearApp() {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return fixture;
  }

  beforeEach(async () => {
    apiFalsa = {
      listar: vi.fn(() => of(catalogo)),
      comprar: vi.fn(),
      crear: vi.fn(),
      actualizar: vi.fn(),
      eliminar: vi.fn(),
      aplicarDescuento: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: ProductoApi, useValue: apiFalsa }],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers(); // devuelve el reloj real si una prueba lo cambió
    vi.restoreAllMocks(); // quita los espías, como el de window.confirm
  });

  it('muestra el título de la tienda', async () => {
    const fixture = await crearApp();
    const pantalla = fixture.nativeElement as HTMLElement;

    expect(pantalla.querySelector('h1')?.textContent).toContain('Tienda de productos');
  });

  it('al iniciar carga el catálogo y dibuja una tarjeta por producto', async () => {
    const fixture = await crearApp();
    const pantalla = fixture.nativeElement as HTMLElement;

    expect(apiFalsa.listar).toHaveBeenCalledTimes(1);
    expect(pantalla.querySelectorAll('app-producto-card').length).toBe(4);
  });

  // Las pruebas se agregan aquí, en los pasos siguientes
  it('si el servidor no responde muestra un mensaje de error', async () => {
    apiFalsa.listar.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));

    const fixture = await crearApp();
    const pantalla = fixture.nativeElement as HTMLElement;

    expect(pantalla.querySelector('.aviso-error')?.textContent).toContain(
      'No se pudo conectar con el servidor',
    );
    expect(pantalla.textContent).toContain('No hay productos registrados.');
  });

  it('al comprar agrega el producto al carrito y actualiza el stock', async () => {
    apiFalsa.comprar.mockReturnValue(of({ ...catalogo[0], stock: 2 }));
    const fixture = await crearApp();
    const app = fixture.componentInstance;

    app.agregarAlCarrito(1);
    await fixture.whenStable();

    expect(apiFalsa.comprar).toHaveBeenCalledWith(1);
    expect(app.carrito().length).toBe(1);
    expect(app.total()).toBe(20.5);
    expect(app.productos()[0].stock).toBe(2);
    expect(app.mensaje()).toBe('Manzana agregado al carrito');
  });

  it('si el servidor responde 409 muestra su mensaje y no toca el carrito', async () => {
    apiFalsa.comprar.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { mensaje: 'Lo sentimos, ya no hay stock' },
          }),
      ),
    );
    const fixture = await crearApp();
    const app = fixture.componentInstance;

    app.agregarAlCarrito(4);
    await fixture.whenStable();

    expect(app.carrito().length).toBe(0);
    expect(app.mensaje()).toBe('Lo sentimos, ya no hay stock');
    expect(app.esError()).toBe(true);
  });

  it('al eliminar con confirmación quita el producto de la lista', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    apiFalsa.eliminar.mockReturnValue(of(undefined));
    const fixture = await crearApp();
    const app = fixture.componentInstance;

    app.eliminarProducto(3);
    await fixture.whenStable();

    expect(apiFalsa.eliminar).toHaveBeenCalledWith(3);
    expect(app.productos().length).toBe(3);
    expect(app.productos().some((p) => p.id === 3)).toBe(false);
  });

  it('si el usuario cancela la confirmación no elimina nada', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const fixture = await crearApp();
    const app = fixture.componentInstance;

    app.eliminarProducto(3);

    expect(apiFalsa.eliminar).not.toHaveBeenCalled();
    expect(app.productos().length).toBe(4);
  });

  it('al crear un producto lo agrega a la lista y muestra un mensaje', async () => {
    const nuevo: Producto = {
      id: 5,
      nombre: 'Mango',
      precio: 8.9,
      stock: 10,
      imagen: '/imagenes/mango.jpg',
      descuento: 0,
    };
    apiFalsa.crear.mockReturnValue(of(nuevo));
    const fixture = await crearApp();
    const app = fixture.componentInstance;

    app.crearProducto({
      nombre: nuevo.nombre,
      precio: nuevo.precio,
      stock: nuevo.stock,
      imagen: nuevo.imagen,
      descuento: nuevo.descuento,
    });
    await fixture.whenStable();

    expect(apiFalsa.crear).toHaveBeenCalledOnce();
    expect(app.productos().length).toBe(5);
    expect(app.productos()[4]).toEqual(nuevo);
    expect(app.mensaje()).toBe('Mango creado');
  });

  it('si falla la creación muestra el mensaje del servidor', async () => {
    apiFalsa.crear.mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ status: 400, error: { mensaje: 'Datos inválidos' } }),
      ),
    );
    const fixture = await crearApp();
    const app = fixture.componentInstance;

    app.crearProducto({
      nombre: 'Mango',
      precio: 8.9,
      stock: 10,
      imagen: '/imagenes/mango.jpg',
      descuento: 0,
    });
    await fixture.whenStable();

    expect(app.productos().length).toBe(4);
    expect(app.mensaje()).toBe('Datos inválidos');
    expect(app.esError()).toBe(true);
  });

  it('al reponer stock actualiza el producto y muestra un mensaje', async () => {
    const actualizado = { ...catalogo[0], stock: 8 };
    apiFalsa.actualizar.mockReturnValue(of(actualizado));
    const fixture = await crearApp();
    const app = fixture.componentInstance;

    app.reponerStock(catalogo[0]);
    await fixture.whenStable();

    expect(apiFalsa.actualizar).toHaveBeenCalledWith(actualizado);
    expect(app.productos()[0].stock).toBe(8);
    expect(app.mensaje()).toBe('Stock de Manzana actualizado');
  });

  it('si falla la reposición muestra el mensaje por defecto', async () => {
    apiFalsa.actualizar.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    const fixture = await crearApp();
    const app = fixture.componentInstance;

    app.reponerStock(catalogo[0]);
    await fixture.whenStable();

    expect(app.mensaje()).toBe('No se pudo actualizar');
    expect(app.esError()).toBe(true);
  });

  it('si falla la eliminación muestra el mensaje por defecto', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    apiFalsa.eliminar.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    const fixture = await crearApp();
    const app = fixture.componentInstance;

    app.eliminarProducto(3);
    await fixture.whenStable();

    expect(app.productos().length).toBe(4);
    expect(app.mensaje()).toBe('No se pudo eliminar');
    expect(app.esError()).toBe(true);
  });

  it('al aplicar un descuento recarga la lista y muestra un mensaje', async () => {
    apiFalsa.aplicarDescuento.mockReturnValue(of(undefined));
    const fixture = await crearApp();
    const app = fixture.componentInstance;

    app.actualizarDescuento({ id: 1, descuento: 10 });
    await fixture.whenStable();

    expect(apiFalsa.aplicarDescuento).toHaveBeenCalledWith(1, 10);
    expect(apiFalsa.listar).toHaveBeenCalledTimes(2);
    expect(app.mensaje()).toBe('Descuento aplicado');
  });

  it('si falla el descuento muestra el mensaje por defecto', async () => {
    apiFalsa.aplicarDescuento.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );
    const fixture = await crearApp();
    const app = fixture.componentInstance;

    app.actualizarDescuento({ id: 1, descuento: 10 });
    await fixture.whenStable();

    expect(app.mensaje()).toBe('No se pudo actualizar el descuento');
    expect(app.esError()).toBe(true);
  });

  it('el mensaje desaparece a los 3 segundos', async () => {
    const fixture = await crearApp();
    const app = fixture.componentInstance;
    vi.useFakeTimers(); // a partir de aquí, el reloj lo controla la prueba

    app.mostrarMensaje('Hola', false);
    expect(app.mensaje()).toBe('Hola');

    vi.advanceTimersByTime(2999);
    expect(app.mensaje()).toBe('Hola');

    vi.advanceTimersByTime(1);
    expect(app.mensaje()).toBe('');

    vi.useRealTimers();
  });
});
