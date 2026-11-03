const PDFJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";
const PDFJS_WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

const featuredButton = document.getElementById("abrir-escrito-destacado");
const externadoButton = document.getElementById("abrir-escrito-externado");
const autogestionButton = document.getElementById("abrir-escrito-autogestion");
const urbanAcupunctureButton = document.getElementById("abrir-escrito-urban-acupuncture");
const asentamientosButton = document.getElementById("abrir-escrito-asentamientos");
const canvas = document.getElementById("pagina-pdf");
const pageFrame = document.getElementById("pagina-libro");
const emptyMessage = document.getElementById("indicacion-libro");
const status = document.getElementById("estado-lector");
const pageCount = document.getElementById("contador-paginas");
const previousButton = document.getElementById("pagina-anterior");
const nextButton = document.getElementById("pagina-siguiente");
const context = canvas.getContext("2d");

let pdfDocument = null;
let currentPage = 0;
let loadSequence = 0;
let renderSequence = 0;
let activeRenderTask = null;
let pdfjs = null;
let resizeTimeout;

function setStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle("error", isError);
}

function updateControls() {
  previousButton.disabled = !pdfDocument || currentPage <= 1;
  nextButton.disabled = !pdfDocument || currentPage >= pdfDocument.numPages;
  pageCount.textContent = pdfDocument
    ? `Página ${currentPage} de ${pdfDocument.numPages}`
    : "Página 0 de 0";
}

async function renderPage(direction = "next") {
  if (!pdfDocument || currentPage < 1) {
    return;
  }

  const sequence = ++renderSequence;
  try {
    if (activeRenderTask) {
      activeRenderTask.cancel();
      try {
        await activeRenderTask.promise;
      } catch (error) {
        if (error.name !== "RenderingCancelledException") {
          throw error;
        }
      }
    }

    const page = await pdfDocument.getPage(currentPage);
    if (sequence !== renderSequence) {
      return;
    }

    const baseViewport = page.getViewport({ scale: 1 });
    const availableWidth = Math.max(240, pageFrame.clientWidth - 32);
    const availableHeight = Math.max(280, pageFrame.clientHeight - 32);
    const scale = Math.min(availableWidth / baseViewport.width, availableHeight / baseViewport.height);
    const viewport = page.getViewport({ scale });
    const pixelRatio = Math.min(3, Math.max(2, window.devicePixelRatio || 1));

    canvas.width = Math.floor(viewport.width * pixelRatio);
    canvas.height = Math.floor(viewport.height * pixelRatio);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;
    emptyMessage.hidden = true;
    canvas.hidden = false;

    pageFrame.classList.remove("pasando-siguiente", "pasando-anterior");
    void pageFrame.offsetWidth;
    pageFrame.classList.add(direction === "next" ? "pasando-siguiente" : "pasando-anterior");

    const task = page.render({
      canvasContext: context,
      viewport,
      transform: pixelRatio === 1 ? null : [pixelRatio, 0, 0, pixelRatio, 0, 0]
    });
    activeRenderTask = task;
    await task.promise;

    if (sequence === renderSequence) {
      updateControls();
    }
  } catch (error) {
    if (error.name !== "RenderingCancelledException" && sequence === renderSequence) {
      console.error("No se pudo dibujar la página del escrito:", error);
      setStatus("No se pudo mostrar esta página. Intenta volver a seleccionarla.", true);
    }
  } finally {
    if (sequence === renderSequence) {
      activeRenderTask = null;
    }
  }
}

async function openPdf(file) {
  const sequence = ++loadSequence;
  const safeName = file?.name || "documento.pdf";
  setStatus(`Abriendo “${safeName}”…`);

  try {
    if (!pdfjs) {
      pdfjs = await import(PDFJS_URL);
      pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
    }

    const data = new Uint8Array(await file.arrayBuffer());
    const loadedDocument = await pdfjs.getDocument({ data }).promise;
    if (sequence !== loadSequence) {
      return;
    }

    pdfDocument = loadedDocument;
    currentPage = 1;
    pageFrame.setAttribute("aria-label", `Libro: ${safeName}`);
    setStatus(`“${safeName}” está listo para leer.`);
    await renderPage();
  } catch (error) {
    if (sequence !== loadSequence) {
      return;
    }
    console.error("No se pudo abrir el escrito PDF:", error);
    pdfDocument = null;
    currentPage = 0;
    canvas.hidden = true;
    emptyMessage.hidden = false;
    setStatus("No se pudo abrir el PDF. Comprueba que el enlace o el archivo esté disponible y vuelve a intentarlo.", true);
  }

  updateControls();
}

async function loadFeaturedPdf(button, path, name) {
  button.disabled = true;
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`No se pudo cargar el escrito (${response.status}).`);
    }
    const data = await response.arrayBuffer();
    await openPdf({
      name,
      arrayBuffer: async () => data
    });
  } catch (error) {
    console.error("No se pudo cargar el escrito:", error);
    setStatus("No se pudo cargar el escrito. Revisa que el sitio esté abierto con Go Live.", true);
  } finally {
    button.disabled = false;
  }
}

featuredButton.addEventListener("click", () => {
  loadFeaturedPdf(
    featuredButton,
    "escritos/CardonaMartinezJohnHames2015.pdf",
    "Emigrantes urbanos — John Hames Cardona Martínez"
  );
});

externadoButton.addEventListener("click", () => {
  loadFeaturedPdf(
    externadoButton,
    "escritos/DHA-spa-2018-Dialogos_ente_lo_teorico_y_experiencial_reasentamiento_poblacional_ciudad_informal_y_construccion_territorial.pdf",
    "Diálogos entre lo teórico y lo experiencial"
  );
});

autogestionButton.addEventListener("click", () => {
  loadFeaturedPdf(
    autogestionButton,
    "escritos/Manual_construccion_autogestion_comunitaria_1991.pdf",
    "Manual para la construcción por autogestión comunitaria — SENA, 1991"
  );
});

urbanAcupunctureButton.addEventListener("click", () => {
  loadFeaturedPdf(
    urbanAcupunctureButton,
    "escritos/Urban_acupuncture_Ciudad_Bolivar_Natalia_Silva_Mora_2013.pdf",
    "Urban acupuncture as a slum upgrading process — Natalia Silva Mora, 2013"
  );
});

asentamientosButton.addEventListener("click", () => {
  loadFeaturedPdf(
    asentamientosButton,
    "escritos/Asentamientos_humanos_construccion_autogestionada_SENA_1989.pdf",
    "Asentamientos humanos y construcción autogestionada — SENA, 1989"
  );
});

previousButton.addEventListener("click", () => {
  if (pdfDocument && currentPage > 1) {
    currentPage -= 1;
    renderPage("previous");
  }
});

nextButton.addEventListener("click", () => {
  if (pdfDocument && currentPage < pdfDocument.numPages) {
    currentPage += 1;
    renderPage("next");
  }
});

document.addEventListener("keydown", event => {
  if (event.altKey || event.ctrlKey || event.metaKey) {
    return;
  }
  if (event.key === "ArrowLeft" && !previousButton.disabled) {
    previousButton.click();
  } else if (event.key === "ArrowRight" && !nextButton.disabled) {
    nextButton.click();
  }
});

window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimeout);
  resizeTimeout = window.setTimeout(() => renderPage(), 150);
});

updateControls();
