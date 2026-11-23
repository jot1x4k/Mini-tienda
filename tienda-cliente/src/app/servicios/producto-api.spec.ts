import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ProductoApi } from './producto-api';
import { Producto } from '../producto/producto';

describe('ProductoApi', () => {
  let servicio: ProductoApi;
  let httpFalso: HttpTestingController;
  const url = 'http://localhost:8080/api/productos';

  const manzana: Producto = {
    id: 1,
    nombre: 'Manzana',
    precio: 20.5,
    stock: 3,
    imagen: '/imagenes/manzana.jpg',
    descuento: 0,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(), // el HttpClient real...
        provideHttpClientTesting(), // ...pero conectado a un servidor falso
      ],
    });
    servicio = TestBed.inject(ProductoApi);
    httpFalso = TestBed.inject(HttpTestingController);
  });

  it('se crea', () => {
    expect(servicio).toBeTruthy();
  });

  // Las pruebas se agregan aquí, en los pasos siguientes
  it('listar hace GET a /api/productos y entrega la lista', () => {
    let recibido: Producto[] = [];

    // Actuar: se llama al método y se suscribe
    servicio.listar().subscribe((lista) => (recibido = lista));

    // Verificar la petición
    const peticion = httpFalso.expectOne(url);
    expect(peticion.request.method).toBe('GET');

    // El servidor falso responde
    peticion.flush([manzana]);

    // Verificar lo que recibió quien se suscribió
    expect(recibido.length).toBe(1);
    expect(recibido[0].nombre).toBe('Manzana');

    // No quedó ninguna petición sin responder
    httpFalso.verify();
  });

  it('crear hace POST con el producto en el cuerpo', () => {
    const nuevo = {
      nombre: 'Mango',
      precio: 8.9,
      stock: 10,
      imagen: '/imagenes/mango.jpg',
      descuento: 0,
    };

    servicio.crear(nuevo).subscribe();

    const peticion = httpFalso.expectOne(url);
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toEqual(nuevo);
    peticion.flush({ id: 5, ...nuevo });
    httpFalso.verify();
  });

  it('actualizar hace PUT a /api/productos/{id}', () => {
    servicio.actualizar(manzana).subscribe();

    const peticion = httpFalso.expectOne(`${url}/1`);
    expect(peticion.request.method).toBe('PUT');
    expect(peticion.request.body).toEqual(manzana);
    peticion.flush(manzana);
    httpFalso.verify();
  });

  it('eliminar hace DELETE a /api/productos/{id}', () => {
    servicio.eliminar(3).subscribe();

    const peticion = httpFalso.expectOne(`${url}/3`);
    expect(peticion.request.method).toBe('DELETE');
    peticion.flush(null, { status: 204, statusText: 'No Content' });
    httpFalso.verify();
  });

  it('comprar hace POST a /api/productos/{id}/comprar', () => {
    let recibido: Producto | undefined;

    servicio.comprar(1).subscribe((p) => (recibido = p));

    const peticion = httpFalso.expectOne(`${url}/1/comprar`);
    expect(peticion.request.method).toBe('POST');
    peticion.flush({ ...manzana, stock: 2 });

    expect(recibido?.stock).toBe(2);
    httpFalso.verify();
  });

  it('comprar entrega el error 409 con el mensaje del servidor', () => {
    let error: HttpErrorResponse | undefined;

    servicio.comprar(4).subscribe({
      next: () => {
        throw new Error('No debía responder con éxito');
      },
      error: (e: HttpErrorResponse) => (error = e),
    });

    const peticion = httpFalso.expectOne(`${url}/4/comprar`);
    peticion.flush(
      { mensaje: 'Lo sentimos, ya no hay stock' },
      { status: 409, statusText: 'Conflict' },
    );

    expect(error?.status).toBe(409);
    expect(error?.error.mensaje).toBe('Lo sentimos, ya no hay stock');
    httpFalso.verify();
  });
});
