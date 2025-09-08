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
  // Обновим обработчик формы
  if (contactForm) {
    // Добавим валидацию в реальном времени
    const inputs = contactForm.querySelectorAll("input, textarea");
    inputs.forEach((input) => {
      input.addEventListener("blur", (e) => {
        validateField(e.target);
      });

      input.addEventListener("input", (e) => {
        clearFieldError(e.target);
      });
    });

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Валидация всех полей перед отправкой
      let isValid = true;
      inputs.forEach((input) => {
        if (!validateField(input)) {
          isValid = false;
        }
      });

      if (!isValid) {
        alert(
          getTranslation("form.validationError", langSelect.value) ||
            "Please fill all fields correctly."
        );
        return;
      }

      // Показываем индикатор загрузки
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent =
        getTranslation("form.sending", langSelect.value) || "Sending...";
      submitBtn.disabled = true;

      // Здесь будет код для отправки данных формы
      const formData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        message: document.getElementById("message").value,
      };

      // Пример использования Fetch API для отправки
      fetch("https://formspree.io/f/xyzdlrvd", {
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
          alert(
            getTranslation("form.error", langSelect.value) ||
              "There was a problem sending your message."
          );
        })
        .finally(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        });
    });
  }

  function validateField(field) {
    clearFieldError(field);

    let isValid = true;
    let errorMessage = "";

    if (field.value.trim() === "") {
      isValid = false;
      errorMessage =
        getTranslation("form.required", langSelect.value) ||
        "This field is required";
    } else if (field.type === "email" && !isValidEmail(field.value)) {
      isValid = false;
      errorMessage =
        getTranslation("form.invalidEmail", langSelect.value) ||
        "Please enter a valid email address";
    }

    if (!isValid) {
      showFieldError(field, errorMessage);
    }

    return isValid;
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function showFieldError(field, message) {
    field.classList.add("error");

    let errorElement = field.parentNode.querySelector(".error-message");
    if (!errorElement) {
      errorElement = document.createElement("div");
      errorElement.className = "error-message";
      field.parentNode.appendChild(errorElement);
    }

    errorElement.textContent = message;
  }

  function clearFieldError(field) {
    field.classList.remove("error");

    const errorElement = field.parentNode.querySelector(".error-message");
    if (errorElement) {
      errorElement.remove();
    }
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

  setTimeout(() => {
    setupScrollAnimations();
  }, 100);

  setupScrollProgress();
  setupBackToTop();
  setupMobileMenu();
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

// Отслеживаем появления элементов в области видимости
function setupScrollAnimations() {
  const animatedElements = document.querySelectorAll("section, .fade-in");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }
  );

  animatedElements.forEach((element) => {
    observer.observe(element);
  });
}

// обработчик прокрутки
function setupScrollProgress() {
  const progressBar = document.getElementById("progressBar");

  window.addEventListener("scroll", () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const progress = (scrollTop / documentHeight) * 100;

    progressBar.style.width = `${progress}%`;
  });
}

function setupBackToTop() {
  const backToTopBtn = document.getElementById("backToTop");

  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add("visible");
    } else {
      backToTopBtn.classList.remove("visible");
    }
  });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

function setupMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.querySelector("nav ul");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      nav.classList.toggle("active");
      menuToggle.classList.toggle("active");

      // Блокировка прокрутки при открытом меню
      if (nav.classList.contains("active")) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    });

    // Закрытие меню при клике на ссылку
    const navLinks = document.querySelectorAll("nav a");
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("active");
        menuToggle.classList.remove("active");
        document.body.style.overflow = "";
      });
    });

    // Закрытие меню при клике вне его области
    document.addEventListener("click", (e) => {
      if (
        nav.classList.contains("active") &&
        !nav.contains(e.target) &&
        !menuToggle.contains(e.target)
      ) {
        nav.classList.remove("active");
        menuToggle.classList.remove("active");
        document.body.style.overflow = "";
      }
    });

    // Закрытие меню при нажатии ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("active")) {
        nav.classList.remove("active");
        menuToggle.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  }
}