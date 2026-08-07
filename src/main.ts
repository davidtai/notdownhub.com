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

/* ── "days since last GitHub outage" post-it ─────────────────
   Data: githubstatus.com (Statuspage) public API, CORS-open.
   Days = full days since the most recent incident resolved;
   an unresolved incident pins it to 0. Fetch failure → the
   note simply never appears.                                   */

async function outageDays(): Promise<number | null> {
  try {
    const res = await fetch("https://www.githubstatus.com/api/v2/incidents.json");
    if (!res.ok) return null;
    const data = (await res.json()) as {
      incidents?: { status?: string; impact?: string; resolved_at?: string | null }[];
    };
    // "major outage" note: only count incidents GitHub classed major or critical.
    const incidents = (data.incidents ?? []).filter(
      (i) => i.impact === "major" || i.impact === "critical",
    );
    if (incidents.length === 0) return null;
    if (incidents.some((i) => i.status !== "resolved" && i.status !== "postmortem")) return 0;
    const times = incidents
      .map((i) => (i.resolved_at ? Date.parse(i.resolved_at) : NaN))
      .filter((t) => Number.isFinite(t));
    if (times.length === 0) return null;
    const latest = Math.max(...times);
    return Math.max(0, Math.floor((Date.now() - latest) / 86_400_000));
  } catch {
    return null;
  }
}

const postit = document.getElementById("postit");
if (postit) {
  outageDays().then((days) => {
    if (days === null) return;
    const el = postit.querySelector("[data-outage-days]");
    if (el) el.textContent = String(days);
    postit.hidden = false;
  });
}
