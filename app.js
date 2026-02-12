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
              <li>Short cinematic vlogs + practical guides</li>
              <li>Street food and restaurant highlights</li>
              <li>Creator gear, apps, and behind-the-scenes workflow</li>
            </ul>
            <p>
              Want this site to match your exact style? Tell me your favorite colors + your logo and I’ll theme it.
            </p>
          </div>
        </div>
      </section>
    `;
  }

  function contactView() {
    return `
      <section class="wrap">
        <div class="sectionTitle">
          <h2>Contact</h2>
          <p class="hint">Collabs, features, and brand work.</p>
        </div>

        <div class="post">
          <div class="post__header">
            <h1 class="post__title">Let’s build something.</h1>
            <div class="post__meta">
              <span>📩 hello@2vues.com</span>
              <span>🤝 partnerships & collaborations</span>
            </div>
          </div>
          <div class="post__content">
            <p>
              Email: <a href="mailto:hello@2vues.com">hello@2vues.com</a>
            </p>
            <p>
              Or DM via your social links in the footer. Add a real form later if you want (I can wire it to Formspree or Netlify Forms).
            </p>
          </div>
        </div>
      </section>
    `;
  }

  function youtubeEmbed(videoId) {
    const safeId = encodeURIComponent(videoId || "");
    // modestbranding + rel=0 for cleaner playback; still YouTube controlled
    return `
      <iframe
        src="https://www.youtube.com/embed/${safeId}?rel=0&modestbranding=1"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
    `;
  }

  function postView(id) {
    const post = state.posts.find(p => p.id === id);
    if (!post) {
      return `
        <section class="wrap">
          <div class="notice">❗ Post not found. Go back to <a href="#/">Home</a>.</div>
        </section>
      `;
    }

    const videoBlock =
      post.video?.type === "youtube" && post.video?.id
        ? youtubeEmbed(post.video.id)
        : `<div style="padding:24px;color:rgba(255,255,255,.75)">No video set for this post.</div>`;

    const paragraphs = post.content.map(t => `<p>${escapeHtml(t)}</p>`).join("");

    const extraSections = post.sections.map(s => `
      <h3>${escapeHtml(s.heading || "")}</h3>
      ${Array.isArray(s.bullets) && s.bullets.length
        ? `<ul>${s.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`
        : ""
      }
    `).join("");

    const tags = (post.tags || []).map(t => `<span class="pill">${escapeHtml(t)}</span>`).join("");

    return `
      <section class="wrap">
        <div style="margin-bottom:12px;">
          <a class="btn btn--ghost" href="#/explore">← Back to Explore</a>
        </div>

        <article class="post">
          <div class="post__header">
            <div class="pillRow">
              <span class="pill">${escapeHtml(post.category)}</span>
              <span class="pill">${escapeHtml(formatDate(post.date))}</span>
              <span class="pill">${escapeHtml(post.readTime || "")}</span>
              ${tags}
            </div>
            <h1 class="post__title">${escapeHtml(post.title)}</h1>
            <div class="post__meta">
              <span>🎬 Vlog Episode</span>
              <span>🧭 2VUES</span>
            </div>
          </div>

          <div class="post__video">
            ${videoBlock}
          </div>

          <div class="post__content">
            <p style="color:rgba(255,255,255,.75)"><i>${escapeHtml(post.excerpt || "")}</i></p>
            ${paragraphs}
            ${extraSections}
          </div>
        </article>
      </section>
    `;
  }

  // ---------- Explore wiring ----------
  function wireExplore() {
    const q = document.getElementById("q");
    const cat = document.getElementById("cat");
    const clear = document.getElementById("clear");
    const results = document.getElementById("results");
    if (!q || !cat || !clear || !results) return;

    function renderResults() {
      const query = q.value.trim().toLowerCase();
      const chosen = cat.value;

      let filtered = sortByNewest(state.posts);

      if (chosen !== "all") {
        filtered = filtered.filter(p => p.category === chosen);
      }
      if (query) {
        filtered = filtered.filter(p =>
          (p.title || "").toLowerCase().includes(query) ||
          (p.excerpt || "").toLowerCase().includes(query) ||
          (p.tags || []).some(t => String(t).toLowerCase().includes(query))
        );
      }

      results.innerHTML = filtered.length
        ? filtered.map(postCard).join("")
        : `<div class="notice" style="grid-column:1/-1;">No matches. Try another search.</div>`;
    }

    q.addEventListener("input", renderResults);
    cat.addEventListener("change", renderResults);
    clear.addEventListener("click", () => {
      q.value = "";
      cat.value = "all";
      renderResults();
      q.focus();
    });

    renderResults();
  }

  // ---------- Router ----------
  async function render() {
    await loadPosts();

    const route = getRoute();
    const [first, second] = route;

    let html = "";
    if (!first) html = homeView();
    else if (first === "explore") html = exploreView();
    else if (first === "post") html = postView(decodeURIComponent(second || ""));
    else if (first === "about") html = aboutView();
    else if (first === "contact") html = contactView();
    else html = homeView();

    app.innerHTML = html;
    setActiveNav();

    if (first === "explore") wireExplore();

    // Close menu on navigation
    closeMenu();

    // Optional: scroll to top on route change
    if (!prefersReducedMotion) window.scrollTo({ top: 0, behavior: "smooth" });
    else window.scrollTo(0, 0);
  }

  // ---------- Nav toggle ----------
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    document.addEventListener("click", (e) => {
      const t = e.target;
      if (!navLinks.contains(t) && !navToggle.contains(t)) closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  // Render on load + hash changes
  window.addEventListener("hashchange", render);
  window.addEventListener("DOMContentLoaded", async () => {
    try {
      await render();
    } catch (err) {
      app.innerHTML = `
        <section class="wrap">
          <div class="notice">
            ❗ Could not load the site data. If you opened this file directly, your browser might block fetch().
            <br><br>
            Fix: run a local server (VS Code Live Server, or: <code>python -m http.server</code>) and reload.
            <br><br>
            Error: ${escapeHtml(err.message)}
          </div>
        </section>
      `;
    }
  });
})();
