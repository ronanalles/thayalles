const menu = document.querySelector("#menu");
const menuButton = document.querySelector("#menu-open");
const desktop = window.matchMedia("(min-width: 48rem)");

if (typeof menu.showModal === "function") {
  menuButton.hidden = false;
  menuButton.addEventListener("click", () => {
    menu.showModal();
    menuButton.setAttribute("aria-expanded", "true");
  });
  menu.addEventListener("close", () => menuButton.setAttribute("aria-expanded", "false"));
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a") || (event.target === menu && event.clientY < menu.getBoundingClientRect().top)) {
      menu.close();
    }
  });
  desktop.addEventListener("change", ({ matches }) => {
    if (matches && menu.open) menu.close();
  });

  const grip = menu.querySelector(".sheet-grip");
  let dragStart = null;
  grip.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    dragStart = event.clientY;
    grip.setPointerCapture(event.pointerId);
    menu.classList.add("is-dragging");
  });
  grip.addEventListener("pointermove", (event) => {
    if (dragStart === null || !event.isPrimary) return;
    menu.style.setProperty("--sheet-drag", Math.max(0, event.clientY - dragStart) + "px");
  });
  function finishDrag(event) {
    if (dragStart === null || !event.isPrimary) return;
    const shouldClose = event.type === "pointerup" && event.clientY - dragStart > 65;
    dragStart = null;
    menu.classList.remove("is-dragging");
    menu.style.removeProperty("--sheet-drag");
    if (shouldClose && menu.open) menu.close();
  }
  grip.addEventListener("pointerup", finishDrag);
  grip.addEventListener("pointercancel", finishDrag);
  grip.addEventListener("lostpointercapture", finishDrag);
}

if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches && "IntersectionObserver" in window) {
  const reveal = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    }
  }, { rootMargin: "0px 0px 22px", threshold: 0.04 });
  document.querySelectorAll(".reveal").forEach((element) => reveal.observe(element));
  document.documentElement.classList.add("motion-ready");
}

const header = document.querySelector(".header");
const bookingDock = document.querySelector(".booking-dock");
const heroBooking = document.querySelector("#hero-booking");
const serviceNav = document.querySelector(".service-nav");
const categoryLinks = [...serviceNav.querySelectorAll("a")];
const feet = document.querySelector("#spa-pes");
let activeCategory = null;
let frame = null;

function updatePage() {
  frame = null;
  const headerBottom = header.getBoundingClientRect().bottom;
  const feetTop = feet.getBoundingClientRect().top;
  const categoryBottom = serviceNav.getBoundingClientRect().bottom;
  const heroBookingBottom = heroBooking.getBoundingClientRect().bottom;
  header.classList.toggle("is-scrolled", window.scrollY > 8);
  bookingDock.classList.toggle("is-idle", heroBookingBottom > headerBottom + 5);

  const currentCategory = desktop.matches
    ? (location.hash === "#spa-pes" ? 1 : 0)
    : (feetTop <= categoryBottom + 24 ? 1 : 0);
  if (currentCategory !== activeCategory) {
    categoryLinks[activeCategory]?.removeAttribute("aria-current");
    categoryLinks[currentCategory].setAttribute("aria-current", "location");
    activeCategory = currentCategory;
  }
}

function scheduleUpdate() {
  if (frame === null) frame = requestAnimationFrame(updatePage);
}

window.addEventListener("scroll", scheduleUpdate, { passive: true });
window.addEventListener("resize", scheduleUpdate);
window.addEventListener("hashchange", scheduleUpdate);
window.addEventListener("pageshow", scheduleUpdate);
updatePage();
