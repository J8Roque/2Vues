(function () {
  const app = document.getElementById("app");
  const html = document.documentElement;

  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  const btnAtlas = document.getElementById("btnAtlas");
  const btnStudio = document.getElementById("btnStudio");
  const modeToggle = document.getElementById("modeToggle");

  const STORE_KEY = "twoVuesSettings";

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : { mode: "dark", vue: "atlas" };
    } catch {
      return { mode: "dark", vue: "atlas" };
    }
  }

  function saveSettings(next) {
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
  }

  function setMode(mode) {
    html.setAttribute("data-mode", mode);
  }

  function setVue(vue) {
    html.setAttribute("data-vue", vue);
    const accent = vue === "studio" ? "studio" : "atlas";
    html.style.setProperty("--accent", `var(--${accent})`);

    btnAtlas.classList.toggle("active", vue === "atlas");
    btnStudio.classList.toggle("active", vue === "studio");
  }

  function closeMenu() {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  navToggle?.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  window.addEventListener("hashchange", () => {
    closeMenu();
    render();
  });

  window.addEventListener("click", (e) => {
    const t = e.target;
    if (!t) return;
    const clickedLink = t.closest && t.closest(".nav-link");
    if (clickedLink) closeMenu();
  });

  const settings = loadSettings();
  setMode(settings.mode);
  setVue(settings.vue);

  modeToggle?.addEventListener("click", () => {
    const nextMode = html.getAttribute("data-mode") === "dark" ? "light" : "dark";
    setMode(nextMode);
    const next = { ...loadSettings(), mode: nextMode };
    saveSettings(next);
  });

  btnAtlas?.addEventListener("click", () => {
    setVue("atlas");
    const next = { ...loadSettings(), vue: "atlas" };
    saveSettings(next);
    if (!location.hash.startsWith("#/")) location.hash = "#/home";
    render();
  });

  btnStudio?.addEventListener("click", () => {
    setVue("studio");
    const next = { ...loadSettings(), vue: "studio" };
    saveSettings(next);
    if (!location.hash.startsWith("#/")) location.hash = "#/home";
    render();
  });

  function route() {
    const hash = (location.hash || "#/home").replace("#", "");
    const [path] = hash.split("?");
    const clean = path.startsWith("/") ? path : "/home";
    return clean;
  }

  function esc(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function hero(vue) {
    const isStudio = vue === "studio";
    const label = isStudio ? "Studio view" : "Atlas view";
    const title = isStudio ? "Build stories that travel." : "Plan trips that feel effortless.";
    const lead = isStudio
      ? "Studio is for creators: workflows, pacing, and publishing systems that stay consistent across platforms."
      : "Atlas is for travelers: compact plans, smart routes, and practical decisions that keep travel smooth.";

    return `
      <section class="hero">
        <div class="hero-inner">
          <div>
            <div class="kicker">${esc(label)} • Accent changes with your view</div>
            <h1 class="h1">${esc(title)}</h1>
            <p class="lead">${esc(lead)}</p>

            <div class="hero-actions">
              <a class="btn primary" href="#/${isStudio ? "studio" : "atlas"}">Open ${isStudio ? "Studio" : "Atlas"}</a>
              <a class="btn" href="#/notes">Read notes</a>
              <a class="btn" href="#/contact">Contact</a>
            </div>
          </div>

          <aside class="mini" aria-label="Quick stats">
            <p class="mini-title">Quick stats</p>
            <div class="stat-grid">
              <div class="stat"><b>${window.TWO_VUES.stats.atlas.countries}</b><span>Countries explored</span></div>
              <div class="stat"><b>${window.TWO_VUES.stats.atlas.journals}</b><span>Journal entries</span></div>
              <div class="stat"><b>${window.TWO_VUES.stats.atlas.gear}</b><span>Gear items</span></div>
              <div class="stat"><b>${window.TWO_VUES.stats.atlas.collabs}</b><span>Collabs</span></div>
            </div>
          </aside>
        </div>
      </section>
    `;
  }

  function atlasPage() {
    const data = window.TWO_VUES.atlas;
    return `
      ${hero("atlas")}
      <section class="grid">
        <article class="card pad">
          <h2>Atlas modules</h2>
          <p>Practical building blocks you can mix per trip.</p>
          <ul class="list">
            ${data.focus
              .map(
                (x) => `
              <li class="item">
                <div class="meta">
                  <div class="title">${esc(x.title)}</div>
                  <div class="sub">${esc(x.sub)}</div>
                </div>
                <div class="badge">${esc(x.badge)}</div>
              </li>`
              )
              .join("")}
          </ul>
        </article>

        <article class="card pad">
          <h2>Search pins</h2>
          <p>Type to filter quick ideas. Replace these with your own destinations later.</p>
          <div class="search">
            <input class="input" id="pinSearch" placeholder="Search pins..." />
          </div>
          <ul class="list" id="pinList">
            ${data.pins
              .map(
                (x) => `
              <li class="item">
                <div class="meta">
                  <div class="title">${esc(x.title)}</div>
                  <div class="sub">${esc(x.sub)}</div>
                </div>
                <div class="badge">Pin</div>
              </li>`
              )
              .join("")}
          </ul>
          <div class="pills">
            <span class="pill">Weekend</span>
            <span class="pill">Transit</span>
            <span class="pill">Food</span>
            <span class="pill">Photo spots</span>
            <span class="pill">Work friendly</span>
          </div>
        </article>
      </section>
    `;
  }

  function studioPage() {
    const data = window.TWO_VUES.studio;
    return `
      ${hero("studio")}
      <section class="grid">
        <article class="card pad">
          <h2>Studio focus</h2>
          <p>Creator systems that feel calm, not chaotic.</p>
          <ul class="list">
            ${data.focus
              .map(
                (x) => `
              <li class="item">
                <div class="meta">
                  <div class="title">${esc(x.title)}</div>
                  <div class="sub">${esc(x.sub)}</div>
                </div>
                <div class="badge">${esc(x.badge)}</div>
              </li>`
              )
              .join("")}
          </ul>
        </article>

        <article class="card pad">
          <h2>Studio kits</h2>
          <p>Small templates you can reuse per shoot.</p>
          <ul class="list">
            ${data.kits
              .map(
                (x) => `
              <li class="item">
                <div class="meta">
                  <div class="title">${esc(x.title)}</div>
                  <div class="sub">${esc(x.sub)}</div>
                </div>
                <div class="badge">Kit</div>
              </li>`
              )
              .join("")}
          </ul>
          <div class="pills">
            <span class="pill">Shorts</span>
            <span class="pill">Reels</span>
            <span class="pill">YouTube</span>
            <span class="pill">Batch edit</span>
            <span class="pill">Workflow</span>
          </div>
        </article>
      </section>
    `;
  }

  function notesPage() {
    const notes = window.TWO_VUES.notes;
    return `
      <section class="hero">
        <div class="hero-inner">
          <div>
            <div class="kicker">Notes • lightweight writing</div>
            <h1 class="h1">Small ideas that scale.</h1>
            <p class="lead">This section is intentionally simple. It is easy to expand into a blog later.</p>
            <div class="hero-actions">
              <a class="btn primary" href="#/home">Back home</a>
              <a class="btn" href="#/contact">Contact</a>
            </div>
          </div>
          <aside class="mini">
            <p class="mini-title">Tip</p>
            <div class="note">
              <b>Make it yours</b>
              <span>Edit content.js to replace the text with your own stories and destinations.</span>
            </div>
          </aside>
        </div>
      </section>

      <section class="grid">
        <article class="card pad" style="grid-column: span 12;">
          <h2>Notes</h2>
          <div class="split">
            ${notes
              .map(
                (n) => `
              <div class="note">
                <b>${esc(n.title)}</b>
                <span>${esc(n.text)}</span>
              </div>`
              )
              .join("")}
          </div>
        </article>
      </section>
    `;
  }

  function contactPage() {
    const c = window.TWO_VUES.contact;
    const mail = `mailto:${encodeURIComponent(c.email)}`;
    return `
      <section class="hero">
        <div class="hero-inner">
          <div>
            <div class="kicker">Contact • collaborations • questions</div>
            <h1 class="h1">Say hello.</h1>
            <p class="lead">This is a static site, so the form opens your email client. If you want a real inbox form later, you can connect Formspree or Netlify Forms.</p>
            <div class="hero-actions">
              <a class="btn primary" href="${mail}">Email</a>
              <a class="btn" href="#/home">Back home</a>
            </div>
          </div>

          <aside class="mini">
            <p class="mini-title">Social</p>
            <ul class="list">
              ${c.socials
                .map(
                  (s) => `
                <li class="item">
                  <div class="meta">
                    <div class="title">${esc(s.label)}</div>
                    <div class="sub">${esc(s.href)}</div>
                  </div>
                  <div class="badge">Link</div>
                </li>`
                )
                .join("")}
            </ul>
          </aside>
        </div>
      </section>

      <section class="grid">
        <article class="card pad" style="grid-column: span 12;">
          <h2>Message</h2>
          <p>Opens an email draft addressed to you.</p>
          <form class="form" id="contactForm">
            <input class="input" id="fromName" placeholder="Your name" />
            <input class="input" id="subject" placeholder="Subject" />
            <textarea class="input" id="message" placeholder="Message"></textarea>
            <button class="btn primary" type="submit">Open email draft</button>
          </form>
        </article>
      </section>
    `;
  }

  function homePage() {
    const vue = html.getAttribute("data-vue") || "atlas";
    return `
      ${hero(vue)}
      <section class="grid">
        <article class="card pad">
          <h2>What is TwoVues?</h2>
          <p>
            TwoVues is a clean, modern travel and creator hub with two viewpoints.
            Atlas is for planning and destinations.
            Studio is for content systems and publishing rhythm.
          </p>
          <div class="pills">
            <span class="pill">Static</span>
            <span class="pill">Fast</span>
            <span class="pill">Responsive</span>
            <span class="pill">Dark and light</span>
            <span class="pill">Two accents</span>
          </div>
        </article>

        <article class="card pad">
          <h2>Start here</h2>
          <p>Pick a view, then edit your content in content.js.</p>
          <ul class="list">
            <li class="item">
              <div class="meta">
                <div class="title">Atlas</div>
                <div class="sub">Trip capsules, city signals, pins, and search.</div>
              </div>
              <a class="badge" href="#/atlas" style="text-decoration:none;">Open</a>
            </li>
            <li class="item">
              <div class="meta">
                <div class="title">Studio</div>
                <div class="sub">Creative systems, kits, and repeatable workflows.</div>
              </div>
              <a class="badge" href="#/studio" style="text-decoration:none;">Open</a>
            </li>
          </ul>
        </article>
      </section>
    `;
  }

  function bindAtlasSearch() {
    const input = document.getElementById("pinSearch");
    const list = document.getElementById("pinList");
    if (!input || !list) return;

    const all = window.TWO_VUES.atlas.pins.slice();

    function renderPins(q) {
      const query = (q || "").trim().toLowerCase();
      const filtered = !query
        ? all
        : all.filter((p) => (p.title + " " + p.sub).toLowerCase().includes(query));

      list.innerHTML = filtered
        .map(
          (x) => `
          <li class="item">
            <div class="meta">
              <div class="title">${esc(x.title)}</div>
              <div class="sub">${esc(x.sub)}</div>
            </div>
            <div class="badge">Pin</div>
          </li>`
        )
        .join("");
    }

    input.addEventListener("input", (e) => renderPins(e.target.value));
    renderPins("");
  }

  function bindContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("fromName")?.value || "";
      const subject = document.getElementById("subject")?.value || "Hello from TwoVues";
      const message = document.getElementById("message")?.value || "";

      const to = window.TWO_VUES.contact.email;
      const body = `Name: ${name}\n\n${message}`.trim();
      const href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = href;
    });
  }

  function render() {
    const vue = html.getAttribute("data-vue") || "atlas";
    const path = route();

    let htmlOut = "";
    if (path === "/home") htmlOut = homePage();
    else if (path === "/atlas") htmlOut = atlasPage();
    else if (path === "/studio") htmlOut = studioPage();
    else if (path === "/notes") htmlOut = notesPage();
    else if (path === "/contact") htmlOut = contactPage();
    else htmlOut = homePage();

    app.innerHTML = htmlOut;

    // After-render bindings
    if (path === "/atlas") bindAtlasSearch();
    if (path === "/contact") bindContactForm();

    // keep active segment consistent
    setVue(vue);
  }

  // First load
  if (!location.hash) location.hash = "#/home";
  render();
})();
