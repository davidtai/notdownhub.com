import "./style.css";

/* ── theme: three-way (system / light / dark) ────────────────
   The pre-paint inline script in index.html has already applied
   the resolved class to <html> to avoid a flash. Here we only
   wire the toggle UI and keep "system" live via matchMedia.     */

type Pref = "light" | "dark" | "system";

const root = document.documentElement;
const mql = window.matchMedia("(prefers-color-scheme: dark)");

function currentPref(): Pref {
  const v = root.dataset.themePref as Pref | undefined;
  return v === "light" || v === "dark" || v === "system" ? v : "system";
}

function resolve(pref: Pref): boolean {
  return pref === "dark" || (pref === "system" && mql.matches);
}

function apply(pref: Pref): void {
  root.classList.toggle("dark", resolve(pref));
  root.dataset.themePref = pref;
  try {
    localStorage.setItem("theme", pref);
  } catch {
    /* private mode — ignore */
  }
  for (const btn of toggleButtons) {
    btn.setAttribute("aria-pressed", String(btn.dataset.pref === pref));
  }
}

const toggleButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>(".theme-toggle button"),
);

for (const btn of toggleButtons) {
  btn.addEventListener("click", () => apply((btn.dataset.pref as Pref) ?? "system"));
}

mql.addEventListener("change", () => {
  if (currentPref() === "system") apply("system");
});

apply(currentPref());

/* ── scroll reveal ───────────────────────────────────────────── */

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealables = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

if (reduce || !("IntersectionObserver" in window)) {
  for (const el of revealables) el.classList.add("in");
} else {
  const io = new IntersectionObserver(
    (entries, obs) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          obs.unobserve(e.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );
  for (const el of revealables) io.observe(el);
}

/* ── current year ────────────────────────────────────────────── */

const yr = document.querySelector("[data-year]");
if (yr) yr.textContent = String(new Date().getFullYear());
