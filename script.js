/* ===== scale the exact 1920-wide canvas to the viewport width ===== */
const STAGE_W = 1920, STAGE_H = 2540;
const stage = document.getElementById("stage");
const wrap = document.getElementById("scaleWrap");

const TOP_TRIM = 120;   // canvas px of empty space pulled up under the nav
const clCtaWrap = document.getElementById("clCtaWrap");
const clFootWrap = document.getElementById("clFootWrap");
const closingCta = document.getElementById("closingCta");
const closingFooter = document.getElementById("closingFooter");
function fit(){
  const scale = window.innerWidth / STAGE_W;
  stage.style.transform = "scale(" + scale + ")";
  wrap.style.height = (STAGE_H * scale - TOP_TRIM * scale) + "px";
  wrap.style.marginTop = (-TOP_TRIM * scale + 50) + "px";
  closingCta.style.transform = "scale(" + scale + ")";
  clCtaWrap.style.height = (789 * scale) + "px";
  closingFooter.style.transform = "scale(" + scale + ")";
  clFootWrap.style.height = (211 * scale) + "px";
}

/* ===== top-nav routing: Home (brand) <-> Portfolio gallery ===== */
const navHome = document.getElementById("navHome");
const navPortfolio = document.getElementById("navPortfolio");
const portfolioView = document.getElementById("portfolioView");
const portfolioGallery = document.getElementById("portfolioGallery");
const closing = document.getElementById("closing");
let gallery = [];   // [{ base, hover }]

function renderPortfolio(){
  portfolioGallery.innerHTML = gallery.map((g, i) =>
    '<div class="pf-item" style="animation-delay:' + (i * 0.06).toFixed(2) + 's">' +
      '<img class="pf-base" src="' + g.base + '" alt="Merch item ' + (i + 1) + '" loading="lazy">' +
      '<img class="pf-hover" src="' + g.hover + '" alt="" aria-hidden="true" loading="lazy">' +
    '</div>'
  ).join("");
}
function openPortfolio(){
  renderPortfolio();
  wrap.style.display = "none";
  portfolioView.style.display = "block";
  navPortfolio.textContent = "Home";      // the tab becomes Home while viewing the gallery
  closing.classList.add("is-light");      // white footer on the portfolio page
  clCtaWrap.style.display = "none";       // no Launch Your Merch / button on portfolio
  window.scrollTo(0, 0);
}
function closePortfolio(){
  portfolioView.style.display = "none";
  wrap.style.display = "";
  navPortfolio.textContent = "Portfolio";
  closing.classList.remove("is-light");
  clCtaWrap.style.display = "";
  window.scrollTo(0, 0);
}
navPortfolio.addEventListener("click", e => {
  e.preventDefault();
  if (portfolioView.style.display === "block") closePortfolio();
  else openPortfolio();
});
navHome.addEventListener("click", e => { e.preventDefault(); closePortfolio(); });
window.addEventListener("resize", fit);
fit();

/* ===== product showcase marquee (images from the shared spreadsheet) ===== */
const HEADER_IMG = "https://i.ibb.co/vvvjGb6Q/high-resolution-back-view-unisex-hoodie-mockup-for-branding-print-designs-02152-1.jpg";
const HEADER_IMG_HOVER = "https://i.ibb.co/bjMVQY36/tshirt-mockup-412-D75-1791123280978.png";

const marqueeTrack = document.getElementById("marqueeTrack");
const TILE_PITCH = 419;        // 356 tile width + 63 gap
const MARQUEE_SPEED = 105;     // px per second (keeps the scroll speed constant)

// one tile per image, repeated enough times for a seamless loop, so every image shows equally
function buildMarquee(images, hovers){
  images = (images && images.length) ? images : [HEADER_IMG];
  hovers = (hovers && hovers.length) ? hovers : [HEADER_IMG_HOVER];
  const N = images.length;
  const loop = TILE_PITCH * N;
  const copies = Math.max(3, Math.ceil(3840 / loop) + 1);

  marqueeTrack.innerHTML = "";
  for (let c = 0; c < copies; c++){
    for (let u = 0; u < N; u++){
      const tile = document.createElement("div");
      tile.className = "mcard";
      tile.style.setProperty("--img", 'url("' + images[u] + '")');
      tile.style.setProperty("--img-h", 'url("' + (hovers[u % hovers.length] || images[u]) + '")');
      marqueeTrack.appendChild(tile);
    }
  }
  marqueeTrack.style.setProperty("--loop", loop + "px");
  marqueeTrack.style.setProperty("--dur", (loop / MARQUEE_SPEED) + "s");
  gallery = images.map((u, i) => ({ base: u, hover: hovers[i % hovers.length] || u }));
}
buildMarquee([HEADER_IMG], [HEADER_IMG_HOVER]);   // fallback until the sheet loads

/* ===== Premium Storefronts carousel (slides come from the sheet; these are fallbacks) ===== */
const DEFAULT_SLIDES = [
  { color: "#D9D9D9", label: "Storefront 01" },
  { color: "#055B43", label: "Storefront 02" },
  { color: "#F25619", label: "Storefront 03" },
  { color: "#3B5BDB", label: "Storefront 04" },
  { color: "#9775FA", label: "Storefront 05" }
];

const track = document.getElementById("carouselTrack");
const dotsWrap = document.getElementById("carouselDots");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
let index = 0;
let slideCount = 0;

/* ===== storefront slides: full-resolution images, no reveal animation ===== */
function makeSlide(spec, i){
  const slide = document.createElement("div");
  slide.className = "sf-slide";
  const label = spec.label || ("Storefront " + String(i + 1).padStart(2, "0"));

  if (spec.image){
    const img = document.createElement("img");
    img.className = "sf-img";
    img.alt = label;
    img.decoding = "async";
    img.src = spec.image;                 // native resolution, rendered crisp by the browser
    slide.appendChild(img);
  } else {
    slide.classList.add("sf-placeholder");
    slide.style.background = spec.color || "#D9D9D9";
    const span = document.createElement("span");
    span.className = "sf-label";
    span.textContent = label;
    slide.appendChild(span);
  }

  const dot = document.createElement("button");
  dot.className = "sf-dot";
  dot.setAttribute("aria-label", "Go to " + label);
  dot.addEventListener("click", () => goTo(i));

  track.appendChild(slide);
  dotsWrap.appendChild(dot);
}

function buildCarousel(specs){
  track.innerHTML = ""; dotsWrap.innerHTML = "";
  index = 0; slideCount = specs.length;
  specs.forEach((s, i) => makeSlide(s, i));
  render();
}

function render(){
  track.style.transform = "translateX(-" + (index * 100) + "%)";
  [...dotsWrap.children].forEach((d, i) => d.classList.toggle("is-active", i === index));
  // no looping: hide the arrow once there's nothing more in that direction
  prevBtn.style.display = index === 0 ? "none" : "";
  nextBtn.style.display = index === slideCount - 1 ? "none" : "";
}

function goTo(i){
  index = Math.max(0, Math.min(slideCount - 1, i)); // clamp, don't wrap
  render();
}
nextBtn.addEventListener("click", () => goTo(index + 1));
prevBtn.addEventListener("click", () => goTo(index - 1));

buildCarousel(DEFAULT_SLIDES);          // placeholders until the sheet loads

/* ===== live sync with the shared Google Sheet ===== */
const SHEET_ID = "1cueUnlwC3t7wtnW-LLcy8zhPRxu36pDh6gBA1kfft1o";
let lastSheetSig = "";

function applySheet(data){
  // header marquee: one tile per image (+hover), so all images show equally
  if (data.header.length){
    buildMarquee(data.header, data.hover);
    if (portfolioView.style.display === "block") renderPortfolio();
  }
  // storefront carousel: real images when provided, otherwise keep the placeholders
  if (data.storefront.length){
    buildCarousel(data.storefront.map((u, i) => ({ image: u, label: "Storefront " + String(i + 1).padStart(2, "0") })));
  }
}

function fetchSheet(){
  const cb = "__sheet_" + Math.random().toString(36).slice(2);
  const s = document.createElement("script");
  window[cb] = function(resp){
    try {
      const rows = (resp.table && resp.table.rows) || [];
      const col = (i) => rows.map(r => r.c[i] && r.c[i].v).filter(v => v != null && String(v).trim() !== "").map(String);
      const data = { header: col(0), hover: col(1), storefront: col(2) };
      const sig = JSON.stringify(data);
      if (sig !== lastSheetSig){ lastSheetSig = sig; applySheet(data); }
    } catch (e) {}
    delete window[cb]; s.remove();
  };
  s.onerror = () => { delete window[cb]; s.remove(); };
  s.src = "https://docs.google.com/spreadsheets/d/" + SHEET_ID +
          "/gviz/tq?tqx=out:json;responseHandler:" + cb + "&headers=1&gid=0&_=" + Date.now();
  document.body.appendChild(s);
}
fetchSheet();                           // initial pull
setInterval(fetchSheet, 20000);         // keep in sync every 20s
