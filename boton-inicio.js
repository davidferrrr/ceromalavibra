const botonInicio = document.createElement('a');
botonInicio.className = 'boton-flotante-inicio';
botonInicio.href = 'index.html';
botonInicio.setAttribute('aria-label', 'Volver al inicio');

const iconoInicio = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
iconoInicio.setAttribute('viewBox', '0 0 24 24');
iconoInicio.setAttribute('aria-hidden', 'true');
iconoInicio.setAttribute('fill', 'none');
iconoInicio.setAttribute('stroke', 'currentColor');
iconoInicio.setAttribute('stroke-linecap', 'round');
iconoInicio.setAttribute('stroke-linejoin', 'round');
iconoInicio.setAttribute('stroke-width', '1.8');

const formaInicio = document.createElementNS('http://www.w3.org/2000/svg', 'path');
formaInicio.setAttribute('d', 'M3 10.5 12 3l9 7.5M5.5 9v11h13V9M9 20v-6h6v6');
iconoInicio.append(formaInicio);

const textoInicio = document.createElement('span');
textoInicio.textContent = 'Inicio';
botonInicio.append(iconoInicio, textoInicio);

const botonArriba = document.createElement('button');
botonArriba.className = 'boton-flotante-arriba';
botonArriba.type = 'button';
botonArriba.setAttribute('aria-label', 'Volver arriba');

const iconoArriba = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
iconoArriba.setAttribute('viewBox', '0 0 24 24');
iconoArriba.setAttribute('aria-hidden', 'true');
iconoArriba.setAttribute('fill', 'none');
iconoArriba.setAttribute('stroke', 'currentColor');
iconoArriba.setAttribute('stroke-linecap', 'round');
iconoArriba.setAttribute('stroke-linejoin', 'round');
iconoArriba.setAttribute('stroke-width', '1.8');

const formaArriba = document.createElementNS('http://www.w3.org/2000/svg', 'path');
formaArriba.setAttribute('d', 'M12 19V5m-7 7 7-7 7 7');
iconoArriba.append(formaArriba);

const textoArriba = document.createElement('span');
textoArriba.textContent = 'Arriba';
botonArriba.append(iconoArriba, textoArriba);
botonArriba.addEventListener('click', () => {
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  window.scrollTo({ top: 0, behavior });
});

document.body.append(botonArriba, botonInicio);
