/* 2VUES Vlog - Single Page App (hash routing)
   Routes:
   #/            Home
   #/explore     Explore/filter/search
   #/post/<id>   Post detail
   #/about       About
   #/contact     Contact
*/

(() => {
  const app = document.getElementById("app");
  const navToggle = document.querySelector(".nav__toggle");
  const navLinks = document.querySelector(".nav__links");

  const state = {
    posts: [],
    loaded: false
  };

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Helpers ----------
  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[c]));

  function formatDate(iso) {
    // safe, minimal formatting without locale surprises
    const [y, m, d] = iso.split("-").map(Number);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${months[(m-1)||0]} ${d}, ${y}`;
  }

  function sortByNewest(posts) {
    return [...posts].sort((a,b) => (a.date < b.date ? 1 : -1));
  }

  function getFeatured(posts) {
    return sortByNewest(posts)[0] || null;
  }

  function getRoute() {
    const hash = location.hash || "#/";
    const cleaned = hash.replace(/^#/, "");
    const parts = cleaned.split("/").filter(Boolean);
    // parts like ["post", "id"]
    return parts.length ? parts : [""];
  }

  function setActiveNav() {
    const hash = location.hash || "#/";
    const links = document.querySelectorAll(".nav__links a");
    links.forEach(a => {
      const href = a.getAttribute("href");
      const active =
        (href === "#/" && (hash === "#/" || hash === "")) ||
        (href !== "#/" && hash.startsWith(href));
      a.style.color = active ? "rgba(255,255,255,.92)" : "";
      a.style.borderColor = active ? "rgba(106,227,218,.28)" : "transparent";
      a.style.background = active ? "rgba(255,255,255,.06)" : "";
    });
  }

  function closeMenu() {
    if (!navLinks || !navToggle) return;
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }

  // ---------- Data ----------
  async function loadPosts() {
    if (state.loaded) return;
    const res = await fetch("./data/posts.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load posts.json");
    const posts = await res.json();

    // Normalize basic fields
    state.posts = posts.map(p => ({
      ...p,
      category: p.category || "Travel",
      tags: Array.isArray(p.tags) ? p.tags : [],
      content: Array.isArray(p.content) ? p.content : [],
      sections: Array.isArray(p.sections) ? p.sections : []
    }));
    state.loaded = true;
  }

  // ---------- UI Blocks ----------
  function playIconSvg() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M8 5v14l12-7z"></path>
      </svg>
    `;
  }

  function postCard(post) {
    const thumbImg = post.thumb
      ? `<img src="${escapeHtml(post.thumb)}" alt="${escapeHtml(post.title)} thumbnail" loading="lazy" />`
      : "";

    return `
      <a class="card" href="#/post/${encodeURIComponent(post.id)}" aria-label="Open post: ${escapeHtml(post.title)}">
        <div class="thumb">
          ${thumbImg}
          <div class="play" aria-hidden="true">${playIconSvg()}</div>
        </div>
        <div class="card__body">
          <div class="pillRow">
            <span class="pill">${escapeHtml(post.category)}</span>
            <span class="pill">${escapeHtml(formatDate(post.date))}</span>
            <span class="pill">${escapeHtml(post.readTime || "—")}</span>
          </div>
          <h3 class="title">${escapeHtml(post.title)}</h3>
          <p class="excerpt">${escapeHtml(post.excerpt || "")}</p>
        </div>
      </a>
    `;
  }

  function heroBlock(featured) {
    const cat = featured?.category || "Travel";
    const date = featured?.date ? formatDate(featured.date) : "";
    const readTime = featured?.readTime || "";
    const title = featured?.title || "2VUES Vlog";
    const excerpt = featured?.excerpt || "Travel, food, and technology stories — video-first.";

    return `
      <section class="wrap hero">
        <div class="hero__top">
          <div class="hero__media" role="img" aria-label="2VUES hero image"></div>
          <div class="hero__content">
            <div class="kicker">
              <span class="badge"><span class="dot"></span> featured vlog</span>
              <span class="badge">${escapeHtml(cat)}</span>
            </div>
            <h1 class="h1">${escapeHtml(title)}</h1>
            <p class="lead">${escapeHtml(excerpt)}</p>

            <div class="actions">
              <a class="btn btn--primary" href="#/post/${encodeURIComponent(featured?.id || "")}">
                Watch now
              </a>
              <a class="btn btn--ghost" href="#/explore">Explore episodes</a>
            </div>

            <div class="meta">
              <span>📅 ${escapeHtml(date)}</span>
              <span>⏱️ ${escapeHtml(readTime)}</span>
              <span>🎬 Video-first stories</span>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function homeView() {
    const posts = sortByNewest(state.posts);
    const featured = getFeatured(posts);

    const latest = posts.slice(0, 6);
    return `
      ${heroBlock(featured)}

      <section class="wrap">
        <div class="sectionTitle">
          <h2>Latest Episodes</h2>
          <p class="hint">New drops across travel, food, and tech.</p>
        </div>
        <div class="grid">
          ${latest.map(postCard).join("")}
        </div>
      </section>
    `;
  }

  function exploreView() {
    return `
      <section class="wrap">
        <div class="sectionTitle">
          <h2>Explore</h2>
          <p class="hint">Filter by category and search titles.</p>
        </div>

        <div class="toolbar">
          <input id="q" class="input" type="search" placeholder="Search episodes…" autocomplete="off" />
          <select id="cat" class="select" aria-label="Filter by category">
            <option value="all">All categories</option>
            <option value="Travel">Travel</option>
            <option value="Food">Food</option>
            <option value="Technology">Technology</option>
          </select>
          <button id="clear" class="btn">Clear</button>
        </div>

        <div id="results" class="grid" aria-label="Explore results"></div>

        <div class="notice" style="margin-top:16px;">
          💡 Tip: Edit <b>data/posts.json</b> to add your real videos (YouTube IDs) and descriptions.
        </div>
      </section>
    `;
  }

  function aboutView() {
    return `
      <section class="wrap">
        <div class="sectionTitle">
          <h2>About 2VUES</h2>
          <p class="hint">Who I am + what this vlog is.</p>
        </div>

        <div class="post">
          <div class="post__header">
            <div class="pillRow">
              <span class="pill">Travel</span>
              <span class="pill">Food</span>
              <span class="pill">Technology</span>
            </div>
            <h1 class="post__title">A vlog for curiosity, flavor, and building.</h1>
            <div class="post__meta">
              <span>🎥 video-first storytelling</span>
              <span>🌍 real places + real eats</span>
              <span>🧠 tools + workflows</span>
            </div>
          </div>
          <div class="post__content">
            <p>
              2VUES is where I document the overlap of <b>travel</b>, <b>food</b>, and <b>technology</b>.
              Some episodes are fast and fun. Others are deep dives. The point is always the same:
              capture the moment, learn something, and share it clearly.
            </p>
            <h3>What you’ll find here</h3>
            <ul>
              <li>Short cine
