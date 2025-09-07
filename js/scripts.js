// Load translations and initialize the page
document.addEventListener("DOMContentLoaded", function () {
  // Load translations
  fetch("js/translations.json")
    .then((response) => response.json())
    .then((translations) => {
      window.translations = translations;

      // Load schema data
      return fetch("js/schema.json");
    })
    .then((response) => response.json())
    .then((schemaData) => {
      // Add structured data to the page
      const script = document.getElementById("structured-data");
      script.textContent = JSON.stringify(schemaData);

      // Initialize the page
      initializePage();
    })
    .catch((error) => {
      console.error("Error loading data:", error);
      initializePage();
    });
});

function initializePage() {
  // Theme toggle functionality
  const themeToggle = document.querySelector(".theme-toggle");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  // Check for saved theme preference or use system preference
  const currentTheme =
    localStorage.getItem("theme") ||
    (prefersDarkScheme.matches ? "dark" : "light");

  if (currentTheme === "dark") {
    document.body.classList.add("dark-theme");
    themeToggle.textContent = "☀️";
  } else {
    themeToggle.textContent = "🌙";
  }

  themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-theme");

    let theme = "light";
    if (document.body.classList.contains("dark-theme")) {
      theme = "dark";
      themeToggle.textContent = "☀️";
    } else {
      themeToggle.textContent = "🌙";
    }

    localStorage.setItem("theme", theme);
  });

  // Language switcher functionality
  const langSelect = document.querySelector(".lang-select");

  // Check for saved language preference
  const savedLang = localStorage.getItem("language") || "de";
  langSelect.value = savedLang;
  changeLanguage(savedLang);

  langSelect.addEventListener("change", function () {
    const lang = this.value;
    localStorage.setItem("language", lang);
    changeLanguage(lang);
  });

  // Load projects
  loadProjects();

  // Form submission handling
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      alert(getTranslation("form.success", langSelect.value));
      contactForm.reset();
    });
  }

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerHeight = document.querySelector("header").offsetHeight;
        const targetPosition =
          targetElement.getBoundingClientRect().top +
          window.pageYOffset -
          headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });
}

function changeLanguage(lang) {
  if (!window.translations) return;

  const elements = document.querySelectorAll("[data-i18n]");

  elements.forEach((element) => {
    const key = element.getAttribute("data-i18n");
    const translation = getTranslation(key, lang);

    if (translation) {
      if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    }
  });

  // Update HTML lang attribute
  document.documentElement.lang = lang;

  // Reload projects to update their language
  loadProjects(lang);
}

function getTranslation(key, lang) {
  if (!window.translations || !window.translations[lang]) return null;

  const keys = key.split(".");
  let value = window.translations[lang];

  for (const k of keys) {
    if (value[k] === undefined) return null;
    value = value[k];
  }

  return value;
}

function loadProjects(lang = null) {
  if (!lang) {
    lang = localStorage.getItem("language") || "de";
  }

  const projectsGrid = document.querySelector(".projects-grid");
  if (!projectsGrid) return;

  // Clear existing projects
  projectsGrid.innerHTML = "";

  // Sample projects data - in a real scenario, this would come from an API or JSON file
  const projects = [
    {
      image:
        "https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1064&q=80",
      title:
        getTranslation("projects.project1.title", lang) || "E-Commerce-Shop",
      description:
        getTranslation("projects.project1.description", lang) ||
        "Vollständiger Online-Shop mit Warenkorb, Filtern und Suchfunktion",
      technologies: ["HTML", "CSS", "JavaScript"],
      demoLink: "#",
      codeLink: "#",
    },
    {
      image:
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
      title:
        getTranslation("projects.project2.title", lang) ||
        "Analytics-Dashboard",
      description:
        getTranslation("projects.project2.description", lang) ||
        "Management-Panel mit Diagrammen, Tabellen und Statistiken",
      technologies: ["React", "Chart.js", "CSS"],
      demoLink: "#",
      codeLink: "#",
    },
    {
      image:
        "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1139&q=80",
      title:
        getTranslation("projects.project3.title", lang) || "Portfolio-Website",
      description:
        getTranslation("projects.project3.description", lang) ||
        "Moderne Portfolio-Website mit Animationen und responsive Design",
      technologies: ["HTML", "CSS", "JavaScript"],
      demoLink: "#",
      codeLink: "#",
    },
  ];

  // Create project cards
  projects.forEach((project) => {
    const projectCard = document.createElement("div");
    projectCard.className = "project-card";

    projectCard.innerHTML = `
            <div class="project-image">
                <img src="${project.image}" alt="${project.title}">
            </div>
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-tech">
                    ${project.technologies
                      .map((tech) => `<span class="tech-tag">${tech}</span>`)
                      .join("")}
                </div>
                <div class="project-links">
                    <a href="${project.demoLink}" class="btn">${
      getTranslation("projects.demo", lang) || "Demo"
    }</a>
                    <a href="${project.codeLink}" class="btn btn-outline">${
      getTranslation("projects.code", lang) || "Code"
    }</a>
                </div>
            </div>
        `;

    projectsGrid.appendChild(projectCard);
  });
}
