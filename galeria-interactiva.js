const grids = document.querySelectorAll('.rejilla-paraiso, .rejilla-coleccion-barrio');

document.querySelectorAll('.mapa-urbanidad').forEach((cover) => {
  const markers = Array.from(cover.querySelectorAll('.marcador-objeto-urbanidad'));
  const positions = [];

  const moveMarkers = () => {
    positions.length = 0;
    markers.forEach((marker) => {
      let position;
      let attempts = 0;
      do {
        position = {
          x: 8 + Math.random() * 84,
          y: 8 + Math.random() * 84
        };
        attempts += 1;
      } while (
        attempts < 50
        && positions.some((other) => Math.hypot(position.x - other.x, position.y - other.y) < 24)
      );

      positions.push(position);
      marker.style.setProperty('--posicion-x', `${position.x}%`);
      marker.style.setProperty('--posicion-y', `${position.y}%`);
    });
  };

  moveMarkers();
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.setInterval(moveMarkers, 1000);
  }
});

grids.forEach((grid, galleryIndex) => {
  const entries = Array.from(grid.querySelectorAll('figure'));
  const dialog = document.createElement('dialog');
  dialog.className = 'visor-galeria';
  dialog.setAttribute('aria-label', 'Visor de fotografías');
  dialog.setAttribute('aria-labelledby', `titulo-visor-galeria-${galleryIndex + 1}`);
  dialog.innerHTML = `
    <div class="visor-galeria-contenido">
      <div class="visor-galeria-barra">
        <p class="visor-galeria-contador" aria-live="polite"></p>
        <button class="visor-galeria-cerrar" type="button" aria-label="Cerrar visor">&times;</button>
      </div>
      <img class="visor-galeria-imagen" alt="">
      <div class="visor-galeria-flechas">
        <button class="visor-galeria-flecha visor-galeria-anterior" type="button" aria-label="Fotografía anterior">&lsaquo;</button>
        <button class="visor-galeria-flecha visor-galeria-siguiente" type="button" aria-label="Fotografía siguiente">&rsaquo;</button>
      </div>
      <div class="visor-galeria-pie">
        <h2 id="titulo-visor-galeria-${galleryIndex + 1}"></h2>
        <dl class="metadatos-fotografia"></dl>
      </div>
    </div>`;
  document.body.append(dialog);

  const image = dialog.querySelector('.visor-galeria-imagen');
  const counter = dialog.querySelector('.visor-galeria-contador');
  const heading = dialog.querySelector('.visor-galeria-pie h2');
  const metadata = dialog.querySelector('.visor-galeria-pie .metadatos-fotografia');
  let activeIndex = 0;

  entries.forEach((entry) => {
    const details = document.createElement('dl');
    details.className = 'metadatos-fotografia';
    for (const [key, label] of [['year', 'Año'], ['author', 'Autor']]) {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      const value = document.createElement('dd');
      term.textContent = label;
      value.textContent = entry.dataset[key] || 'Por agregar';
      row.append(term, value);
      details.append(row);
    }
    entry.append(details);
  });

  const showEntry = (index) => {
    activeIndex = (index + entries.length) % entries.length;
    const entry = entries[activeIndex];
    const link = entry.querySelector('a');
    const thumbnail = link.querySelector('img');
    const details = entry.querySelector('.metadatos-fotografia');

    image.src = link.href;
    image.alt = thumbnail.alt;
    counter.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(entries.length).padStart(2, '0')}`;
    heading.textContent = entry.querySelector('figcaption').textContent;
    metadata.replaceChildren(...Array.from(details.children, (row) => row.cloneNode(true)));
  };

  grid.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link || !grid.contains(link)) return;
    event.preventDefault();
    showEntry(entries.indexOf(link.closest('figure')));
    dialog.showModal();
  });

  dialog.querySelector('.visor-galeria-cerrar').addEventListener('click', () => dialog.close());
  dialog.querySelector('.visor-galeria-anterior').addEventListener('click', () => showEntry(activeIndex - 1));
  dialog.querySelector('.visor-galeria-siguiente').addEventListener('click', () => showEntry(activeIndex + 1));
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') showEntry(activeIndex - 1);
    if (event.key === 'ArrowRight') showEntry(activeIndex + 1);
  });
});
