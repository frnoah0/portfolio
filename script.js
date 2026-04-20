const DATA_PATH = "site-data.json";

document.addEventListener("DOMContentLoaded", () => {
  initSite();
});

async function initSite() {
  try {
    const response = await fetch(DATA_PATH);
    if (!response.ok) throw new Error("Failed to load site data");

    const data = await response.json();

    applyTheme(data.theme);
    renderNav(data);
    renderHero(data);
    renderPortfolio(data);
    renderContact(data);
    initMenu();
    initSmoothScroll();
    initReveal();
    initActiveNav();
  } catch (error) {
    console.error(error);
    document.getElementById("projects").innerHTML = `
      <div class="glass" style="padding:24px;border:1px solid rgba(255,255,255,0.1);border-radius:24px;">
        <h3 style="margin:0 0 10px;">Site data failed to load</h3>
        <p style="margin:0;color:#a7abc6;">Make sure site-data.json is present and the site is being served through GitHub Pages, Cloudflare Pages, or a local dev server.</p>
      </div>
    `;
  }
}

function applyTheme(theme = {}) {
  const root = document.documentElement;
  const map = {
    background: "--bg",
    backgroundSoft: "--bg-soft",
    surface: "--surface",
    surfaceStrong: "--surface-strong",
    text: "--text",
    muted: "--muted",
    accent: "--accent",
    accent2: "--accent-2",
    border: "--border",
    glow: "--glow"
  };

  Object.entries(map).forEach(([key, variable]) => {
    if (theme[key]) root.style.setProperty(variable, theme[key]);
  });
}

function renderNav(data) {
  const navBrand = document.getElementById("navBrand");
  const navLinks = document.getElementById("navLinks");

  navBrand.textContent = data.brand.name;

  navLinks.innerHTML = data.nav
    .map((item) => {
      return `<a href="#${item.id}" class="nav-link" data-scroll>${item.label}</a>`;
    })
    .join("");
}

function renderHero(data) {
  const { brand } = data;

  document.title = brand.name;
  document.getElementById("heroEyebrow").textContent = brand.eyebrow;
  document.getElementById("heroTitle").textContent = brand.name;
  document.getElementById("heroSubtitle").textContent = brand.subtitle;
  document.getElementById("heroCta").textContent = brand.ctaLabel;

  const heroImage = document.getElementById("heroImage");
  heroImage.src = brand.heroImage;
  heroImage.alt = brand.heroImageAlt || `${brand.name} hero image`;
}

function renderPortfolio(data) {
  document.getElementById("portfolioKicker").textContent = data.sections.portfolio.kicker;
  document.getElementById("portfolioTitle").textContent = data.sections.portfolio.title;
  document.getElementById("portfolioIntro").textContent = data.sections.portfolio.intro;

  const container = document.getElementById("projects");

  const projectMap = new Map((data.projects || []).map((project) => [project.id, project]));
  const orderedProjects = (data.projectOrder || [])
    .map((id) => projectMap.get(id))
    .filter(Boolean);

  const fallbackProjects = (data.projects || []).filter(
    (project) => !orderedProjects.some((ordered) => ordered.id === project.id)
  );

  const finalProjects = [...orderedProjects, ...fallbackProjects];

  container.innerHTML = finalProjects
    .map((project, index) => {
      const reverseClass = index % 2 === 1 ? "is-reverse" : "";
      const mediaCountClass = `count-${Math.min(project.media.length, 2)}`;

      return `
        <article class="project-row reveal ${reverseClass}">
          <div class="project-copy glass">
            <p class="project-meta">${project.year} • ${project.role}</p>
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-tags">
              ${(project.tags || []).map((tag) => `<span class="project-tag">${tag}</span>`).join("")}
            </div>
          </div>

          <div class="project-media glass">
            <div class="media-grid ${mediaCountClass}">
              ${project.media.map(renderMediaCard).join("")}
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderMediaCard(item) {
  const isVideo = item.type === "video";

  if (isVideo) {
    const controls = item.controls ? "controls" : "";
    const autoplaySet = item.controls ? "" : "autoplay muted loop playsinline";
    const poster = item.poster ? `poster="${item.poster}"` : "";

    return `
      <div class="media-card">
        <video ${controls} ${autoplaySet} preload="metadata" ${poster}>
          <source src="${item.path}" type="${item.mime || "video/mp4"}" />
        </video>
      </div>
    `;
  }

  return `
    <div class="media-card">
      <img src="${item.path}" alt="${item.alt || "Project media"}" loading="lazy" />
    </div>
  `;
}

function renderContact(data) {
  const contact = data.contact;

  document.getElementById("contactKicker").textContent = data.sections.contact.kicker;
  document.getElementById("contactTitle").textContent = data.sections.contact.title;
  document.getElementById("contactIntro").textContent = data.sections.contact.intro;

  const links = [
    { platform: "Discord", value: contact.links.discord.label, url: contact.links.discord.url },
    { platform: "Email", value: contact.links.email.label, url: contact.links.email.url },
    { platform: "Roblox", value: contact.links.roblox.label, url: contact.links.roblox.url }
  ];

  document.getElementById("contactLinks").innerHTML = `
    <div class="contact-link-list">
      ${links
        .map(
          (link) => `
            <a class="contact-link" href="${link.url}" target="_blank" rel="noreferrer">
              <span class="contact-link-platform">${link.platform}</span>
              <span class="contact-link-value">${link.value}</span>
            </a>
          `
        )
        .join("")}
    </div>
  `;

  const form = document.getElementById("contactForm");
  const formNote = document.getElementById("formNote");
  const formSubject = document.getElementById("formSubject");
  const submitButton = document.getElementById("contactSubmit");

  form.action = contact.form.action;
  form.method = contact.form.method || "POST";
  submitButton.textContent = contact.form.buttonLabel || "Send Message";
  formSubject.value = `${contact.form.subjectPrefix || "Portfolio Inquiry"} | ${data.brand.name}`;

  const hasPlaceholderEndpoint =
    !contact.form.action ||
    contact.form.action.includes("your-form-id") ||
    contact.form.action.includes("your-endpoint");

  formNote.textContent = hasPlaceholderEndpoint
    ? contact.form.placeholderNote
    : contact.form.readyNote;

  form.addEventListener("submit", (event) => {
    if (hasPlaceholderEndpoint) {
      event.preventDefault();
      formNote.textContent = "Replace the placeholder form endpoint in site-data.json before submitting.";
      return;
    }

    if (contact.form.provider.toLowerCase() === "formspree") {
      formNote.textContent = "Sending...";
    }
  });
}

function initMenu() {
  const toggle = document.getElementById("menuToggle");
  const links = document.getElementById("navLinks");

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  links.addEventListener("click", (event) => {
    if (event.target.classList.contains("nav-link")) {
      links.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

function initSmoothScroll() {
  document.querySelectorAll("[data-scroll]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function initReveal() {
  const items = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -50px 0px" }
  );

  items.forEach((item) => observer.observe(item));
}

function initActiveNav() {
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { threshold: 0.45 }
  );

  sections.forEach((section) => observer.observe(section));
}