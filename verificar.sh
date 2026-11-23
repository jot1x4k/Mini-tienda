#!/usr/bin/env bash
# verificar.sh: ejecuta las tres puertas de calidad en orden
# y se detiene en la primera que falle.
 
echo "1/3 Backend: pruebas y cobertura (JaCoCo)"
(cd tienda-api && ./mvnw -B verify) || { echo "FALLO: backend"; exit 1; }
 
echo "2/3 Frontend: pruebas y cobertura (Vitest)"
(cd tienda-cliente && npx ng test --watch=false --coverage) || { echo "FALLO: frontend"; exit 1; }
 
echo "3/3 Punta a punta (Playwright)"
(cd tienda-cliente && npx playwright test) || { echo "FALLO: punta a punta"; exit 1; }
 
echo "TODO EN VERDE"
