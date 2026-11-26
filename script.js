
/* ==========================================
   OLHARES — GALERIA COLABORATIVA
   DEMONSTRAÇÃO VISUAL
========================================== */

const $ = id => document.getElementById(id);

let room = "INSPIRACAO";
let photos = [];

let editing = null;
let baseImage = null;
let rotation = 0;
let toastTimer = null;


/* ==========================================
   GALERIA INICIAL
========================================== */

function loadInitialGallery() {

  const cards = document.querySelectorAll(
    "#photoGrid .photo-card"
  );

  photos = Array.from(cards).map((card, index) => {

    const image = card.querySelector("img");
    const title = card.querySelector(".photo-info strong");
    const description = card.querySelector(".photo-info small");

    return {
      id: "sample-" + index,
      src: image.src,
      title: title.textContent,
      description: description.textContent,
      type: card.dataset.type || "original",
      name: "Participante",
      parent: null
    };
  });

  renderGallery();
}


/* ==========================================
   NOTIFICAÇÕES
========================================== */

function toast(message) {

  const element = $("toast");

  element.textContent = message;
  element.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    element.classList.remove("show");
  }, 2800);
}


/* ==========================================
   GERAR CÓDIGOS
========================================== */

function generateCode() {

  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "FOTO-";

  for (let i = 0; i < 6; i++) {
    code += characters[
      Math.floor(Math.random() * characters.length)
    ];
  }

  return code;
}


/* ==========================================
   CRIAR SALA
========================================== */

function createRoom() {

  room = generateCode();

  $("activeRoom").textContent = "Sala " + room;
  $("galleryTitle").textContent = "Galeria " + room;

  toast("Sua sala foi criada! Código: " + room);

  const codeInput = $("roomCodeInput");

  codeInput.value = room;

  // Demonstração: o código pode ser compartilhado,
  // mas ainda não cria uma sala online.

}


/* ==========================================
   ENTRAR EM UMA SALA
========================================== */

function joinRoom() {

  const code = $("roomCodeInput")
    .value
    .trim()
    .toUpperCase();

  if (!code) {
    toast("Digite um código para continuar.");
    return;
  }

  room = code;

  $("activeRoom").textContent = "Sala " + room;
  $("galleryTitle").textContent = "Galeria " + room;

  toast("Você entrou na sala demonstrativa " + room + ".");
}


/* ==========================================
   COMPARTILHAR A SALA
========================================== */

async function shareRoom() {

  const text =
    "Venha conhecer minha sala na Galeria Colaborativa: " + room;

  try {

    if (navigator.share) {

      await navigator.share({
        title: "Galeria Colaborativa",
        text: text
      });

    } else {

      await navigator.clipboard.writeText(text);

      toast("Convite copiado!");

    }

  } catch (error) {

    console.log("Compartilhamento cancelado.");

  }
}


/* ==========================================
   FILTROS
========================================== */

function setupFilters() {

  document.querySelectorAll(".filter").forEach(button => {

    button.addEventListener("click", () => {

      document.querySelectorAll(".filter").forEach(item => {
        item.classList.remove("active");
      });

      button.classList.add("active");

      const filter = button.dataset.filter;

      document.querySelectorAll(".photo-card").forEach(card => {

        const type = card.dataset.type;

        const visible =
          filter === "all" ||
          filter === type;

        card.style.display = visible ? "" : "none";

      });

    });

  });

}


/* ==========================================
   RENDERIZAR GALERIA
========================================== */

function escapeHTML(value) {

  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);

}


function renderGallery() {

  const grid = $("photoGrid");

  $("photoCount").textContent =
    photos.length.toString().padStart(2, "0") +
    " fotografias";

  if (!photos.length) {

    grid.innerHTML = `
      <div class="empty">
        Nenhuma fotografia disponível.
        Envie a primeira imagem!
      </div>
    `;

    return;
  }

  grid.innerHTML = photos.map((photo, index) => {

    const type = photo.type || "original";

    const tag = type === "edited"
      ? "NOVA VERSÃO"
      : "ORIGINAL";

    return `

      <article class="photo-card" data-type="${type}">

        <div class="card-image">

          <img
            src="${escapeHTML(photo.src)}"
            alt="${escapeHTML(photo.title)}"
            loading="lazy"
          >

          <span class="photo-tag ${type === "edited" ? "edited-tag" : ""}">
            ${tag}
          </span>

          <button
            class="image-open"
            data-action="open"
            data-id="${escapeHTML(photo.id)}"
            aria-label="Ampliar fotografia"
          >
            ↗
          </button>

        </div>

        <div class="photo-info">

          <div>

            <strong>${escapeHTML(photo.title)}</strong>

            <small>${escapeHTML(photo.description)}</small>

          </div>

          <span class="card-number">
            ${String(index + 1).padStart(2, "0")}
          </span>

        </div>

        <div class="photo-extra-actions">

          <button
            data-action="edit"
            data-id="${escapeHTML(photo.id)}"
          >
            ✧ Editar
          </button>

          <button
            data-action="download"
            data-id="${escapeHTML(photo.id)}"
          >
            ↓ Baixar
          </button>

        </div>

      </article>

    `;

  }).join("");

  applyCurrentFilter();

}


/* ==========================================
   MANTER FILTRO ATIVO
========================================== */

function applyCurrentFilter() {

  const activeFilter = document.querySelector(
    ".filter.active"
  );

  if (!activeFilter) return;

  const filter = activeFilter.dataset.filter;

  document.querySelectorAll(".photo-card").forEach(card => {

    const type = card.dataset.type;

    card.style.display =
      filter === "all" || filter === type
        ? ""
        : "none";

  });

}


/* ==========================================
   ADICIONAR FOTOGRAFIAS
========================================== */

function uploadPhotos(event) {

  const files = Array.from(event.target.files || []);

  event.target.value = "";

  if (!files.length) return;

  files.forEach(file => {

    if (!file.type.startsWith("image/")) {
      toast("Escolha somente arquivos de imagem.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast("A imagem deve ter até 10 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {

      photos.unshift({

        id: "upload-" + Date.now() + Math.random(),

        src: reader.result,

        title: file.name.replace(/\.[^/.]+$/, ""),

        description: "Por você · Fotografia original",

        type: "original",

        name: "Você",

        parent: null

      });

      renderGallery();

      toast("Fotografia adicionada à demonstração!");

    };

    reader.readAsDataURL(file);

  });

}


/* ==========================================
   ABRIR VISUALIZADOR
========================================== */

function openLightbox(id) {

  const photo = photos.find(item => item.id === id);

  if (!photo) return;

  $("lightboxImage").src = photo.src;

  $("lightbox").classList.add("show");

}


function closeLightbox() {

  $("lightbox").classList.remove("show");

  $("lightboxImage").src = "";

}


/* ==========================================
   ABRIR EDITOR
========================================== */

function openEditor(id) {

  editing = photos.find(item => item.id === id);

  if (!editing) return;

  baseImage = new Image();

  baseImage.crossOrigin = "anonymous";

  baseImage.onload = () => {

    rotation = 0;

    $("brightness").value = 100;
    $("contrast").value = 100;

    $("overlayText").value = "";
    $("editorName").value = "";

    $("editorModal").classList.add("show");

    drawEditor();

  };

  baseImage.onerror = () => {

    toast("Não foi possível abrir esta fotografia.");

    baseImage = null;

  };

  baseImage.src = editing.src;

}


/* ==========================================
   DESENHAR EDITOR
========================================== */

function drawEditor() {

  if (!baseImage) return;

  const canvas = $("editorCanvas");

  const ctx = canvas.getContext("2d");

  const width = baseImage.naturalWidth;
  const height = baseImage.naturalHeight;

  if (rotation % 180 !== 0) {

    canvas.width = height;
    canvas.height = width;

  } else {

    canvas.width = width;
    canvas.height = height;

  }

  ctx.save();

  ctx.translate(
    canvas.width / 2,
    canvas.height / 2
  );

  ctx.rotate(rotation * Math.PI / 180);

  ctx.filter =
    `brightness(${$("brightness").value}%) contrast(${$("contrast").value}%)`;

  ctx.drawImage(
    baseImage,
    -width / 2,
    -height / 2,
    width,
    height
  );

  ctx.filter = "none";

  const text = $("overlayText").value;

  if (text) {

    ctx.font =
      `bold ${Math.max(24, canvas.width / 16)}px sans-serif`;

    ctx.textAlign = "center";

    ctx.lineWidth = Math.max(2, canvas.width / 300);

    ctx.strokeStyle = "#000a";
    ctx.fillStyle = "#ffffff";

    ctx.strokeText(
      text,
      0,
      canvas.height * .36
    );

    ctx.fillText(
      text,
      0,
      canvas.height * .36
    );

  }

  ctx.restore();

}


/* ==========================================
   GIRAR IMAGEM
========================================== */

function rotateImage() {

  if (!baseImage) return;

  rotation = (rotation + 90) % 360;

  drawEditor();

}


/* ==========================================
   REDEFINIR
========================================== */

function resetEditor() {

  if (!baseImage) return;

  rotation = 0;

  $("brightness").value = 100;
  $("contrast").value = 100;
  $("overlayText").value = "";

  drawEditor();

}


/* ==========================================
   SALVAR NOVA VERSÃO
========================================== */

function saveVersion() {

  if (!editing) return;

  const canvas = $("editorCanvas");

  const name =
    $("editorName").value.trim() || "Anônimo";

  try {

    const newPhoto = {

      id: "edited-" + Date.now(),

      src: canvas.toDataURL("image/jpeg", .9),

      title: "Nova interpretação",

      description: "Por " + name + " · Edição colaborativa",

      type: "edited",

      name: name,

      parent: editing.id

    };

    photos.unshift(newPhoto);

    closeEditor();

    renderGallery();

    toast("Sua nova versão foi criada!");

  } catch (error) {

    console.error(error);

    toast("Não foi possível salvar essa edição.");

  }

}


/* ==========================================
   FECHAR EDITOR
========================================== */

function closeEditor() {

  $("editorModal").classList.remove("show");

  editing = null;
  baseImage = null;

}


/* ==========================================
   DOWNLOAD
========================================== */

function downloadPhoto(id) {

  const photo = photos.find(item => item.id === id);

  if (!photo) return;

  const link = document.createElement("a");

  link.href = photo.src;

  link.download = "olhares-" + photo.id + ".jpg";

  link.click();

  toast("Download iniciado!");

}


/* ==========================================
   EVENTOS DA GALERIA
========================================== */

$("photoGrid").addEventListener("click", event => {

  const button = event.target.closest("[data-action]");

  if (!button) return;

  const id = button.dataset.id;

  const action = button.dataset.action;

  if (action === "open") {
    openLightbox(id);
  }

  if (action === "edit") {
    openEditor(id);
  }

  if (action === "download") {
    downloadPhoto(id);
  }

});


/* ==========================================
   BOTÕES PRINCIPAIS
========================================== */

$("createRoom").addEventListener("click", createRoom);

$("navCreate").addEventListener("click", () => {
  createRoom();
  document.querySelector("#galeria").scrollIntoView({
    behavior: "smooth"
  });
});

$("heroCreate").addEventListener("click", () => {
  createRoom();
  document.querySelector("#galeria").scrollIntoView({
    behavior: "smooth"
  });
});

$("finalCreate").addEventListener("click", () => {
  createRoom();
  document.querySelector("#galeria").scrollIntoView({
    behavior: "smooth"
  });
});

$("joinRoom").addEventListener("click", joinRoom);

$("roomCodeInput").addEventListener("keydown", event => {

  if (event.key === "Enter") {
    joinRoom();
  }

});


/* ==========================================
   BOTÃO DE ENVIO
========================================== */

$("uploadButton").addEventListener("click", () => {
  $("fileInput").click();
});

$("fileInput").addEventListener("change", uploadPhotos);


/* ==========================================
   EDITOR
========================================== */

$("brightness").addEventListener("input", drawEditor);

$("contrast").addEventListener("input", drawEditor);

$("overlayText").addEventListener("input", drawEditor);

$("rotateImage").addEventListener("click", rotateImage);

$("resetEditor").addEventListener("click", resetEditor);

$("saveVersion").addEventListener("click", saveVersion);

$("closeEditor").addEventListener("click", closeEditor);


/* ==========================================
   VISUALIZADOR
========================================== */

$("closeLightbox").addEventListener("click", closeLightbox);

$("lightbox").addEventListener("click", event => {

  if (event.target === $("lightbox")) {
    closeLightbox();
  }

});


/* ==========================================
   MENU MOBILE
========================================== */

$("mobileMenu").addEventListener("click", () => {

  document.querySelector(".nav-links")
    .classList.toggle("mobile-open");

});

document.querySelectorAll(".nav-links a").forEach(link => {

  link.addEventListener("click", () => {

    document.querySelector(".nav-links")
      .classList.remove("mobile-open");

  });

});


/* ==========================================
   TECLADO
========================================== */

document.addEventListener("keydown", event => {

  if (event.key === "Escape") {

    closeEditor();
    closeLightbox();

  }

});


/* ==========================================
   INICIALIZAR
========================================== */

loadInitialGallery();

setupFilters();

console.log("Olhares — demonstração iniciada com sucesso.");
