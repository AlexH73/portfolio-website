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

      // Here will be the code for sending form data
      const formData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        message: document.getElementById("message").value,
      };

      // Example using Fetch API to send data
      fetch("https://formspree.io/f/your-form-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then((data) => {
          alert(getTranslation("form.success", langSelect.value));
          contactForm.reset();
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Es gab ein Problem beim Senden Ihrer Nachricht.");
        });
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

  // Update project filters language
  updateFiltersLanguage(lang);
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

  // Пытаемся загрузить из внешнего JSON
  fetch("js/projects.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Projects file not found");
      }
      return response.json();
    })
    .then((data) => {
      displayProjects(data.projects, lang, projectsGrid);
    })
    .catch((error) => {
      console.error("Error loading projects:", error);
      // Показываем сообщение об ошибке
      projectsGrid.innerHTML = `
        <div class="no-projects">
          <p>${
            getTranslation("projects.unavailable", lang) ||
            "Projects are temporarily unavailable."
          }</p>
          <p><small>Error: ${error.message}</small></p>
        </div>
      `;
    });
}

function displayProjects(projects, lang, container) {
  container.innerHTML = "";

  const projectsToShow = projects.filter(
    (project) => project.featured !== false
  );

  // Если проектов нет, показываем сообщение и не создаем фильтры
  if (projectsToShow.length === 0) {
    container.innerHTML = `
      <div class="no-projects">
        <p>${
          getTranslation("projects.none", lang) || "No projects available yet."
        }</p>
      </div>
    `;
    return;
  }

  // Создаем карточки проектов
  projectsToShow.forEach((project) => {
    const projectCard = document.createElement("div");
    projectCard.className = "project-card";
    projectCard.setAttribute("data-category", project.category);

    // Получаем локализованные данные
    const title = project.title[lang] || project.title.en || project.title.de;
    const description =
      project.description[lang] ||
      project.description.en ||
      project.description.de;

    projectCard.innerHTML = `
      <div class="project-image">
        <img src="${project.image}" alt="${title}" loading="lazy">
      </div>
      <div class="project-content">
        <h3 class="project-title">${title}</h3>
        <p class="project-description">${description}</p>
        <div class="project-tech">
          ${project.technologies
            .map((tech) => `<span class="tech-tag">${tech}</span>`)
            .join("")}
        </div>
        <div class="project-links">
          ${
            project.demoLink !== "#"
              ? `<a href="${project.demoLink}" class="btn" target="_blank">${
                  getTranslation("projects.demo", lang) || "Demo"
                }</a>`
              : ""
          }
          <a href="${project.codeLink}" class="btn ${
      project.demoLink === "#" ? "" : "btn-outline"
    }" target="_blank">${getTranslation("projects.code", lang) || "Code"}</a>
        </div>
      </div>
    `;

    container.appendChild(projectCard);
  });

  // Настраиваем фильтры проектов
  setupProjectFilters(lang);
}

function setupProjectFilters(lang = null) {
  if (!lang) {
    lang = localStorage.getItem("language") || "de";
  }

  // Проверяем, не добавлены ли уже фильтры
  if (document.querySelector(".projects-filters")) {
    updateFiltersLanguage(lang);
    return;
  }

  const filters = getTranslation("filters", lang) || {
    all: "All",
    frontend: "Frontend",
    backend: "Backend",
    fullstack: "Full Stack",
  };

  const filtersContainer = document.createElement("div");
  filtersContainer.className = "projects-filters";

  filtersContainer.innerHTML = `
    <button class="filter-btn active" data-filter="all">${filters.all}</button>
    <button class="filter-btn" data-filter="frontend">${filters.frontend}</button>
    <button class="filter-btn" data-filter="backend">${filters.backend}</button>
    <button class="filter-btn" data-filter="fullstack">${filters.fullstack}</button>
  `;

  // Находим правильный контейнер для вставки фильтров
  const projectsContainer = document.querySelector(".projects .container");
  const sectionTitle = document.querySelector(".projects .section-title");

  if (projectsContainer && sectionTitle) {
    // Вставляем фильтры после заголовка, но перед сеткой проектов
    sectionTitle.insertAdjacentElement("afterend", filtersContainer);
  } else {
    console.error("Could not find projects container or section title");
    return;
  }

  // Обработка кликов по фильтрам
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Убираем активный класс у всех кнопок
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      // Добавляем активный класс текущей кнопке
      button.classList.add("active");

      // Фильтруем проекты
      const filter = button.getAttribute("data-filter");
      filterProjects(filter);
    });
  });
}

function filterProjects(filter) {
  const projectsGrid = document.querySelector(".projects-grid");
  const projectCards = projectsGrid.querySelectorAll(".project-card");

  projectCards.forEach((card) => {
    const category = card.getAttribute("data-category");

    if (filter === "all" || category === filter) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

function updateFiltersLanguage(lang) {
  const filtersContainer = document.querySelector(".projects-filters");
  if (!filtersContainer) return;

  const filters = getTranslation("filters", lang) || {
    all: "All",
    frontend: "Frontend",
    backend: "Backend",
    fullstack: "Full Stack",
  };

  const filterButtons = filtersContainer.querySelectorAll(".filter-btn");
  filterButtons.forEach((button) => {
    const filter = button.getAttribute("data-filter");
    button.textContent = filters[filter] || filter;
  });
}
