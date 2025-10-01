// ==================== КОНСТАНТЫ И ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================

const CONFIG = {
  formspreeUrl: "https://formspree.io/f/xyzdlrvd",
  chartColors: {
    primary: "rgba(99, 102, 241, 0.2)",
    border: "rgba(99, 102, 241, 0.8)",
    point: "rgba(99, 102, 241, 1)",
  },
};

// Глобальные переменные
let currentLanguage = "de";
let translations = {};
let skillsChartInstance = null;
let skillsData = null;

// Кэш DOM элементов
const domCache = {};

// Утилиты для debounce и throttling
const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
  try {
    await loadResources();
    cacheDOMElements();
    initializePage();
    setupPerformanceMonitoring();
  } catch (error) {
    console.error("Failed to initialize app:", error);
    initializePage(); // Пытаемся инициализировать хотя бы базовые функции
  }
}

function cacheDOMElements() {
  const elements = {
    // Основные элементы
    menuToggle: "#menuToggle",
    nav: "nav ul",
    backToTopBtn: "#backToTop",
    progressBar: "#progressBar",
    contactForm: "#contactForm",
    cookiesBanner: "#cookies-banner",
    privacyModal: "#privacy-modal",
    skillsChart: "#skills-chart",
    projectsGrid: ".projects-grid",
    langSelect: ".lang-select",
    themeToggle: ".theme-toggle",
    privacyFab: "#privacy-fab",

    // Форма
    nameInput: "#name",
    emailInput: "#email",
    messageInput: "#message",

    // Cookies
    cookiesAccept: "#cookies-accept",
    cookiesReject: "#cookies-reject",
    cookiesLearnMore: "#cookies-learn-more",

    // Модальные окна
    modalClose: ".modal-close",
    saveCookiesPrefs: "#save-cookies-preferences",
  };

  Object.keys(elements).forEach((key) => {
    const selector = elements[key];
    domCache[key] = selector.startsWith("#")
      ? document.getElementById(selector.replace("#", ""))
      : document.querySelector(selector);
  });
}

async function loadResources() {
  try {
    const [translationsResponse, schemaResponse] = await Promise.all([
      fetch("js/translations.json"),
      fetch("js/schema.json"),
    ]);

    if (!translationsResponse.ok)
      throw new Error("Failed to load translations");
    if (!schemaResponse.ok) throw new Error("Failed to load schema");

    translations = await translationsResponse.json();
    const schemaData = await schemaResponse.json();

    const script = document.getElementById("structured-data");
    if (script) {
      script.textContent = JSON.stringify(schemaData);
    }
  } catch (error) {
    console.error("Error loading resources:", error);
    throw error;
  }
}

function initializePage() {
  const initFunctions = [
    initializeTheme,
    initializeLanguage,
    loadSkillsData,
    loadProjects,
    setupFormHandler,
    setupSmoothScrolling,
    () => setTimeout(setupScrollAnimations, 100),
    setupScrollProgress,
    setupBackToTop,
    setupMobileMenu,
    setupCookiesBanner,
    setupPrivacyModal,
  ];

  initFunctions.forEach((fn) => {
    try {
      fn();
    } catch (error) {
      console.error(`Error in ${fn.name}:`, error);
    }
  });
}

// ==================== ТЕМА ====================
function initializeTheme() {
  if (!domCache.themeToggle) return;

  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const cookiesPrefs = getCookie("cookies_preferences");

  let currentTheme = "light";

  if (cookiesPrefs === "false") {
    currentTheme = prefersDarkScheme.matches ? "dark" : "light";
  } else {
    currentTheme =
      localStorage.getItem("theme") ||
      (prefersDarkScheme.matches ? "dark" : "light");
  }

  if (currentTheme === "dark") {
    document.body.classList.add("dark-theme");
    domCache.themeToggle.textContent = "☀️";
  } else {
    domCache.themeToggle.textContent = "🌙";
  }

  domCache.themeToggle.addEventListener("click", toggleTheme);
}

function toggleTheme() {
  const cookiesPrefs = getCookie("cookies_preferences");

  document.body.classList.toggle("dark-theme");

  let theme = "light";
  if (document.body.classList.contains("dark-theme")) {
    theme = "dark";
    domCache.themeToggle.textContent = "☀️";
  } else {
    domCache.themeToggle.textContent = "🌙";
  }

  if (cookiesPrefs !== "false") {
    localStorage.setItem("theme", theme);
  }

  if (skillsChartInstance) {
    initSkillsChart();
  }
}

// ==================== ЯЗЫК ====================
function initializeLanguage() {
  if (!domCache.langSelect) return;

  const cookiesPrefs = getCookie("cookies_preferences");
  const savedLang =
    cookiesPrefs === "false" ? "de" : localStorage.getItem("language") || "de";

  currentLanguage = savedLang;
  domCache.langSelect.value = savedLang;

  updateMetaTags(savedLang);
  applyLanguage(savedLang);

  domCache.langSelect.addEventListener("change", handleLanguageChange);
}

function handleLanguageChange() {
  const cookiesPrefs = getCookie("cookies_preferences");
  const lang = this.value;

  if (cookiesPrefs !== "false") {
    localStorage.setItem("language", lang);
  }

  currentLanguage = lang;
  applyLanguage(lang);
}

function applyLanguage(lang) {
  updateMetaTags(lang);
  updateContentLanguage(lang);
  loadProjects(lang);
  updateFiltersLanguage(lang);

  // Перерисовываем секцию навыков с сбросом анимаций
  if (skillsData) {
    // Сбрасываем классы анимации более аккуратно
    const skillElements = document.querySelectorAll(
      ".skills-chart-container, .legend-item, .category-item, .cloud-tag"
    );
    skillElements.forEach((el) => {
      el.classList.remove("visible", "chart-visible");
    });

    // Перерисовываем компоненты
    renderSkillsLegend();
    renderCategoryDetails();
    renderSkillsCloud();

    // Переинициализируем диаграмму с задержкой
    setTimeout(() => {
      if (skillsChartInstance) {
        skillsChartInstance.destroy();
        skillsChartInstance = null;
      }

      // Ждем перерисовки DOM перед инициализацией диаграммы
      setTimeout(() => {
        initSkillsChart();

        // Запускаем анимации если секция видима
        const skillsSection = document.getElementById("skills");
        if (skillsSection && isElementInViewport(skillsSection)) {
          const chartContainer = document.querySelector(
            ".skills-chart-container"
          );
          if (chartContainer) {
            handleSkillsChartAnimation(chartContainer);
          }
        }
      }, 100);
    }, 150);
  }
}

function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function updateContentLanguage(lang) {
  const elements = document.querySelectorAll("[data-i18n]");

  elements.forEach((element) => {
    const key = element.getAttribute("data-i18n");
    const translation = getTranslation(key, lang);

    if (!translation) return;

    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
      element.placeholder = translation;
    } else {
      element.textContent = translation;
    }
  });

  document.documentElement.lang = lang;
}

// ==================== МЕТАТЕГИ ====================
function updateMetaTags(lang) {
  if (!translations[lang]?.meta) return;

  const meta = translations[lang].meta;

  updateMetaTag("name", "description", meta.description);
  updateMetaTag("name", "keywords", meta.keywords);

  if (meta.title) {
    document.title = meta.title;
  }

  updateSocialMeta(
    "og:title",
    meta.title || "Alexander Hermann - Full-Stack Developer"
  );
  updateSocialMeta("og:description", meta.description);
  updateSocialMeta("og:locale", getOgLocale(lang));

  updateSocialMeta(
    "twitter:title",
    meta.title || "Alexander Hermann - Full-Stack Developer"
  );
  updateSocialMeta("twitter:description", meta.description);
}

function updateMetaTag(attrName, attrValue, content) {
  let metaElement = document.querySelector(`meta[${attrName}="${attrValue}"]`);

  if (!metaElement) {
    metaElement = document.createElement("meta");
    metaElement.setAttribute(attrName, attrValue);
    document.head.appendChild(metaElement);
  }

  metaElement.content = content;
}

function updateSocialMeta(property, content) {
  let metaElement =
    document.querySelector(`meta[property="${property}"]`) ||
    document.querySelector(`meta[name="${property}"]`);

  if (!metaElement) {
    metaElement = document.createElement("meta");
    if (property.startsWith("og:")) {
      metaElement.setAttribute("property", property);
    } else {
      metaElement.setAttribute("name", property);
    }
    document.head.appendChild(metaElement);
  }

  metaElement.content = content;
}

function getOgLocale(lang) {
  const locales = {
    de: "de_DE",
    en: "en_US",
    ru: "ru_RU",
  };
  return locales[lang] || "en_US";
}

// ==================== ПРОЕКТЫ ====================
async function loadProjects(lang = currentLanguage) {
  if (!domCache.projectsGrid) return;

  showLoadingIndicator(domCache.projectsGrid);

  try {
    const response = await fetch("js/projects.json");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    displayProjects(data.projects, lang, domCache.projectsGrid);
  } catch (error) {
    console.error("Error loading projects:", error);
    showProjectsError(lang, domCache.projectsGrid, error.message);
  }
}

function displayProjects(projects, lang, container) {
  const projectsToShow = projects.filter(
    (project) => project.featured !== false
  );

  if (projectsToShow.length === 0) {
    container.innerHTML = createNoProjectsMessage(lang);
    return;
  }

  container.innerHTML = "";
  projectsToShow.forEach((project) => {
    container.appendChild(createProjectCard(project, lang));
  });

  setupProjectFilters(lang);
}

function createProjectCard(project, lang) {
  const title = project.title[lang] || project.title.en || project.title.de;
  const description =
    project.description[lang] ||
    project.description.en ||
    project.description.de;

  const projectCard = document.createElement("div");
  projectCard.className = "project-card";
  projectCard.setAttribute("data-category", project.category);

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
  }" target="_blank">
          ${getTranslation("projects.code", lang) || "Code"}
        </a>
      </div>
    </div>
  `;

  return projectCard;
}

function showProjectsError(lang, container, errorMessage) {
  container.innerHTML = `
    <div class="no-projects">
      <p>${
        getTranslation("projects.unavailable", lang) ||
        "Projects are temporarily unavailable."
      }</p>
      <p><small>Error: ${errorMessage}</small></p>
    </div>
  `;
}

function setupProjectFilters(lang = currentLanguage) {
  if (!lang) lang = currentLanguage;

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

  const projectsContainer = document.querySelector(".projects .container");
  const sectionTitle = document.querySelector(".projects .section-title");

  if (projectsContainer && sectionTitle) {
    sectionTitle.insertAdjacentElement("afterend", filtersContainer);
    setupFilterButtons();
  } else {
    console.error("Could not find projects container or section title");
  }
}

function setupFilterButtons() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      filterProjects(button.getAttribute("data-filter"));
    });
  });
}

function filterProjects(filter) {
  if (!domCache.projectsGrid) return;

  const projectCards = domCache.projectsGrid.querySelectorAll(".project-card");

  projectCards.forEach((card) => {
    const category = card.getAttribute("data-category");
    card.style.display =
      filter === "all" || category === filter ? "block" : "none";
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

// ==================== ФОРМА ====================
function setupFormHandler() {
  if (!domCache.contactForm) return;

  setupFormValidation(domCache.contactForm);
  domCache.contactForm.addEventListener("submit", handleFormSubmit);
}

function setupFormValidation(form) {
  const inputs = form.querySelectorAll("input, textarea");

  inputs.forEach((input) => {
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => clearFieldError(input));
  });
}

function validateForm(form) {
  let isValid = true;
  const inputs = form.querySelectorAll("input, textarea");

  inputs.forEach((input) => {
    if (!validateField(input)) isValid = false;
  });

  return isValid;
}

function validateField(field) {
  clearFieldError(field);

  let isValid = true;
  let errorMessage = "";

  if (field.value.trim() === "") {
    isValid = false;
    errorMessage =
      getTranslation("form.required", currentLanguage) ||
      "This field is required";
  } else if (field.type === "email" && !isValidEmail(field.value)) {
    isValid = false;
    errorMessage =
      getTranslation("form.invalidEmail", currentLanguage) ||
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
  if (errorElement) errorElement.remove();
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;

  if (!validateForm(form)) {
    showError(getTranslation("form.validationError", currentLanguage));
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  try {
    setButtonState(
      submitBtn,
      true,
      getTranslation("form.sending", currentLanguage)
    );

    let recaptchaToken = "";
    try {
      recaptchaToken = await getRecaptchaToken();
    } catch (error) {
      console.warn("reCAPTCHA error:", error);
    }

    const formData = {
      name: domCache.nameInput.value,
      email: domCache.emailInput.value,
      message: domCache.messageInput.value,
    };

    if (recaptchaToken) {
      formData["g-recaptcha-response"] = recaptchaToken;
    }

    await sendFormData(formData);
    showSuccess(getTranslation("form.success", currentLanguage));
    form.reset();
  } catch (error) {
    console.error("Form submission error:", error);
    showError(
      `${getTranslation("form.error", currentLanguage)}: ${error.message}`
    );
  } finally {
    setButtonState(submitBtn, false, originalText);
  }
}

function getRecaptchaToken() {
  return new Promise((resolve, reject) => {
    if (typeof grecaptcha === "undefined") {
      reject(new Error("reCAPTCHA not loaded"));
      return;
    }

    grecaptcha.ready(async () => {
      try {
        const token = await grecaptcha.execute(
          "6LeKX8grAAAAAFr3OMmNKYUKl-br5q9HlWq2eJG1",
          { action: "submit" }
        );
        resolve(token);
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function sendFormData(formData) {
  const response = await fetch(CONFIG.formspreeUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) throw new Error("Form submission failed");
  return response.json();
}

// ==================== УВЕДОМЛЕНИЯ ====================
function showNotification(type, title, message) {
  const modal = document.getElementById("notification-modal");
  const icon = document.getElementById("notification-icon");
  const titleEl = document.getElementById("notification-title");
  const messageEl = document.getElementById("notification-message");
  const confirmBtn = document.getElementById("notification-confirm");

  if (!modal || !icon || !titleEl || !messageEl || !confirmBtn) return;

  modal.className = "modal";
  modal.classList.add(`notification-${type}`);

  switch (type) {
    case "success":
      icon.innerHTML = "✅";
      break;
    case "error":
      icon.innerHTML = "❌";
      break;
    case "warning":
      icon.innerHTML = "⚠️";
      break;
    default:
      icon.innerHTML = "ℹ️";
  }

  titleEl.textContent = title;
  messageEl.textContent = message;

  modal.style.display = "block";
  document.body.style.overflow = "hidden";

  const closeModal = () => {
    modal.style.display = "none";
    document.body.style.overflow = "";
  };

  confirmBtn.onclick = closeModal;

  const closeBtn = document.getElementById("notification-close");
  if (closeBtn) closeBtn.onclick = closeModal;

  window.onclick = function (event) {
    if (event.target === modal) closeModal();
  };

  document.addEventListener("keydown", function closeOnEsc(event) {
    if (event.key === "Escape" && modal.style.display === "block") {
      closeModal();
      document.removeEventListener("keydown", closeOnEsc);
    }
  });
}

function showSuccess(message) {
  const title =
    getTranslation("notification.success", currentLanguage) || "Success";
  showNotification("success", title, message);
}

function showError(message) {
  const title =
    getTranslation("notification.error", currentLanguage) || "Error";
  showNotification("error", title, message);
}

// ==================== ПЛАВНАЯ ПРОКРУТКА ====================
function setupSmoothScrolling() {
  const supportsNativeSmoothScroll =
    "scrollBehavior" in document.documentElement.style;

  if (supportsNativeSmoothScroll) {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();

        const targetId = this.getAttribute("href");
        if (targetId === "#") return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const headerHeight = document.querySelector("header").offsetHeight;
          const extraOffset = 20;
          const targetPosition =
            targetElement.offsetTop - headerHeight - extraOffset;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
        }
      });
    });
  } else {
    // Фолбэк для старых браузеров
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();

        const targetId = this.getAttribute("href");
        if (targetId === "#") return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const headerHeight = document.querySelector("header").offsetHeight;
          const extraOffset = 20;
          const targetPosition =
            targetElement.offsetTop - headerHeight - extraOffset;

          const startPosition = window.pageYOffset;
          const distance = targetPosition - startPosition;
          const duration = 800;
          let startTime = null;

          function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const easeProgress =
              progress < 0.5
                ? 2 * progress * progress
                : -1 + (4 - 2 * progress) * progress;

            window.scrollTo(0, startPosition + distance * easeProgress);

            if (timeElapsed < duration) {
              requestAnimationFrame(animation);
            }
          }

          requestAnimationFrame(animation);
        }
      });
    });
  }

  // Оптимизация: debounce для resize
  const debouncedResize = debounce(() => {
    const hash = window.location.hash;
    if (hash) {
      const targetElement = document.querySelector(hash);
      if (targetElement) {
        const headerHeight = document.querySelector("header").offsetHeight;
        const extraOffset = 20;
        const targetPosition =
          targetElement.offsetTop - headerHeight - extraOffset;

        window.scrollTo(0, targetPosition);
      }
    }
  }, 250);

  window.addEventListener("resize", debouncedResize);
}

// ==================== АНИМАЦИИ ПРИ ПРОКРУТКЕ ====================
function setupScrollAnimations() {
  // Добавляем контейнеры навыков в наблюдаемые элементы
  const animatedElements = document.querySelectorAll(
    "section, .fade-in, .skills-chart-container, .chart-legend, .skills-details"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");

          // Специальная обработка для диаграммы навыков
          if (entry.target.classList.contains("skills-chart-container")) {
            handleSkillsChartAnimation(entry.target);
          }
        }
      });
    },
    {
      threshold: 0.1, // Увеличиваем порог для лучшей работы
      rootMargin: "0px 0px -50px 0px",
    }
  );

  animatedElements.forEach((element) => observer.observe(element));
}

// ==================== ИНДИКАТОР ПРОКРУТКИ ====================
function setupScrollProgress() {
  if (!domCache.progressBar) return;

  const throttledScroll = throttle(() => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const progress = (scrollTop / documentHeight) * 100;

    domCache.progressBar.style.width = `${progress}%`;
  }, 10);

  window.addEventListener("scroll", throttledScroll);
}

// ==================== КНОПКА "НАВЕРХ" ====================
function setupBackToTop() {
  if (!domCache.backToTopBtn) return;

  const throttledScroll = throttle(() => {
    domCache.backToTopBtn.classList.toggle("visible", window.pageYOffset > 300);
  }, 10);

  window.addEventListener("scroll", throttledScroll);

  domCache.backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// ==================== МОБИЛЬНОЕ МЕНЮ ====================
function setupMobileMenu() {
  if (!domCache.menuToggle || !domCache.nav) return;

  const toggleMenu = () => {
    domCache.nav.classList.toggle("active");
    domCache.menuToggle.classList.toggle("active");
    document.body.style.overflow = domCache.nav.classList.contains("active")
      ? "hidden"
      : "";
  };

  domCache.menuToggle.addEventListener("click", toggleMenu);

  const navLinks = document.querySelectorAll("nav a");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (domCache.nav.classList.contains("active")) {
        toggleMenu();
      }
    });
  });

  document.addEventListener("click", (e) => {
    if (
      domCache.nav.classList.contains("active") &&
      !domCache.nav.contains(e.target) &&
      !domCache.menuToggle.contains(e.target)
    ) {
      toggleMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && domCache.nav.classList.contains("active")) {
      toggleMenu();
    }
  });
}

// ==================== COOKIES ====================
function setupCookiesBanner() {
  if (
    !domCache.cookiesBanner ||
    !domCache.cookiesAccept ||
    !domCache.cookiesReject
  )
    return;

  const cookiesDecision = getCookie("cookies_decision");

  if (!cookiesDecision) {
    setTimeout(() => domCache.cookiesBanner.classList.add("active"), 1000);
  }

  domCache.cookiesAccept.addEventListener("click", () => acceptCookies());
  domCache.cookiesReject.addEventListener("click", () => rejectCookies());

  if (domCache.cookiesLearnMore) {
    domCache.cookiesLearnMore.addEventListener("click", (e) => {
      e.preventDefault();
      domCache.cookiesBanner.classList.remove("active");
      const privacySection = document.getElementById("privacy");
      if (privacySection) privacySection.scrollIntoView({ behavior: "smooth" });
    });
  }

  if (domCache.saveCookiesPrefs) {
    domCache.saveCookiesPrefs.addEventListener("click", saveCookiesPreferences);
  }

  loadCookiesPreferences();
}

function acceptCookies() {
  setCookie("cookies_decision", "accepted", 365);
  setCookie("cookies_preferences", "true", 365);
  setCookie("cookies_analytics", "true", 365);
  if (domCache.cookiesBanner) domCache.cookiesBanner.classList.remove("active");
}

function rejectCookies() {
  setCookie("cookies_decision", "rejected", 365);
  setCookie("cookies_preferences", "false", 365);
  setCookie("cookies_analytics", "false", 365);
  if (domCache.cookiesBanner) domCache.cookiesBanner.classList.remove("active");

  deleteCookie("cookies_preferences");
  deleteCookie("cookies_analytics");
  deleteCookie("theme");
  deleteCookie("language");

  setTimeout(() => window.location.reload(), 500);
}

function saveCookiesPreferences() {
  const prefsChecked =
    document.getElementById("cookies-preferences")?.checked || false;
  const analyticsChecked =
    document.getElementById("cookies-analytics")?.checked || false;

  setCookie("cookies_preferences", prefsChecked.toString(), 365);
  setCookie("cookies_analytics", analyticsChecked.toString(), 365);

  // Восстанавливаем кастомное поведение с сообщением и закрытием
  const saveBtn = document.getElementById("save-cookies-preferences");
  let msg = document.getElementById("cookies-save-message");

  if (!msg) {
    msg = document.createElement("div");
    msg.id = "cookies-save-message";
    msg.style.position = "relative";
    msg.style.float = "right";
    msg.style.right = "0";
    msg.style.top = "0";
    msg.style.background = "#4caf4fff";
    msg.style.color = "#ffffffff";
    msg.style.padding = "6px 16px";
    msg.style.borderRadius = "4px";
    msg.style.border = "1px solid #047208ff";
    msg.style.fontSize = "14px";
    msg.style.zIndex = "1000";
    msg.style.transition = "opacity 0.3s";
    msg.style.opacity = "0";

    if (saveBtn && saveBtn.parentNode) {
      saveBtn.parentNode.appendChild(msg);
    }
  }

  msg.textContent =
    getTranslation("privacy.saved", currentLanguage) || "Settings saved";
  msg.style.opacity = "1";

  // Показываем сообщение на 2 секунды, затем скрываем и закрываем модалку
  setTimeout(() => {
    msg.style.opacity = "0";
    setTimeout(() => {
      if (msg && msg.parentNode) {
        msg.remove();
      }

      // Закрываем модальное окно
      const modal = document.getElementById("privacy-modal");
      if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "";
      }
    }, 300);
  }, 2000);
}

function loadCookiesPreferences() {
  const prefs = getCookie("cookies_preferences");
  const analytics = getCookie("cookies_analytics");

  if (prefs === "false") {
    localStorage.removeItem("theme");
    localStorage.removeItem("language");
  }

  if (analytics === "false") {
    window["ga-disable-UA-XXXXX-Y"] = true;
  }

  const prefsCheckbox = document.getElementById("cookies-preferences");
  const analyticsCheckbox = document.getElementById("cookies-analytics");

  if (prefsCheckbox) prefsCheckbox.checked = prefs !== "false";
  if (analyticsCheckbox) analyticsCheckbox.checked = analytics !== "false";
}

// ==================== МОДАЛЬНОЕ ОКНО ====================
function setupPrivacyModal() {
  if (!domCache.privacyModal) return;

  function openModal() {
    domCache.privacyModal.style.display = "block";
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    domCache.privacyModal.style.display = "none";
    document.body.style.overflow = "";
  }

  if (domCache.privacyFab)
    domCache.privacyFab.addEventListener("click", openModal);
  if (domCache.modalClose)
    domCache.modalClose.addEventListener("click", closeModal);
  if (domCache.cookiesLearnMore) {
    domCache.cookiesLearnMore.addEventListener("click", function (e) {
      e.preventDefault();
      openModal();
    });
  }

  window.addEventListener("click", function (e) {
    if (e.target === domCache.privacyModal) closeModal();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && domCache.privacyModal.style.display === "block")
      closeModal();
  });
}

// ==================== ДИАГРАММА НАВЫКОВ ====================

async function loadSkillsData() {
  try {
    const response = await fetch("js/skills.json");
    if (!response.ok) throw new Error("Failed to load skills data");
    skillsData = await response.json();

    // Ждем немного для гарантии что DOM готов
    setTimeout(() => {
      initSkillsChart();
      renderSkillsLegend();
      renderCategoryDetails();
      renderSkillsCloud();

      // Проверяем если секция уже видима при загрузке
      const skillsSection = document.getElementById("skills");
      const chartContainer = document.querySelector(".skills-chart-container");
      if (
        skillsSection &&
        chartContainer &&
        isElementInViewport(skillsSection)
      ) {
        handleSkillsChartAnimation(chartContainer);
      }
    }, 100);
  } catch (error) {
    console.error("Error loading skills data:", error);
    // Fallback to basic chart
    setTimeout(() => {
      initBasicSkillsChart();
    }, 100);
  }
}

function initSkillsChart() {
  if (!domCache.skillsChart || !skillsData) return;

  if (skillsChartInstance) {
    skillsChartInstance.destroy();
  }

  const isDarkTheme = document.body.classList.contains("dark-theme");
  const textColor = isDarkTheme ? "#f3f4f6" : "#1f2937";
  const gridColor = isDarkTheme
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";

  // Создаем данные для диаграммы на основе skills.json
  const radarData = prepareRadarData();

  skillsChartInstance = new Chart(domCache.skillsChart, {
    type: "radar",
    data: radarData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            display: false,
            stepSize: 20,
          },
          grid: {
            color: gridColor,
          },
          angleLines: {
            color: gridColor,
          },
          pointLabels: {
            color: textColor,
            font: {
              size: 11, // Чуть меньше для лучшего размещения
              family: "'Inter', sans-serif",
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "white",
          bodyColor: "white",
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || "";
              const value = context.raw || 0;
              const category = context.dataset.category || "";
              return `${label}: ${value}% (${category})`;
            },
          },
        },
      },
      animation: {
        duration: 2000,
        easing: "easeOutQuart",
      },
      elements: {
        line: {
          tension: 0.1, // Более плавные линии
        },
      },
    },
  });
}

// функция для подготовки данных радара
function prepareRadarData() {
  if (!skillsData) return { labels: [], datasets: [] };

  // Собираем все уникальные навыки для labels
  const allSkills = skillsData.skills.map((skill) => skill.name);

  // Создаем datasets для каждой категории
  const datasets = skillsData.categories.map((category) => {
    const skillsInCategory = skillsData.skills.filter(
      (skill) => skill.category === category.name
    );

    // Создаем массив данных для этой категории
    const data = allSkills.map((skillName) => {
      const skill = skillsInCategory.find((s) => s.name === skillName);
      return skill ? skill.level : 0; // 0 для навыков не из этой категории
    });

    return {
      label:
        getTranslation(`skills.${category.name}`, currentLanguage) ||
        category.label[currentLanguage] ||
        category.name,
      data: data,
      backgroundColor: hexToRgba(category.color, 0.2),
      borderColor: category.color,
      pointBackgroundColor: category.color,
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: category.color,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2,
      category: category.name, // Добавляем категорию для фильтрации
    };
  });

  return {
    labels: allSkills,
    datasets: datasets,
  };
}

function renderSkillsLegend() {
  if (!skillsData || !document.getElementById("chartLegend")) return;

  const legendContainer = document.getElementById("chartLegend");
  legendContainer.innerHTML = "";

  // Добавляем "All" элемент
  const allItem = document.createElement("div");
  allItem.className = "legend-item active";
  allItem.dataset.filter = "all";
  allItem.innerHTML = `
    <div class="legend-color" style="background-color: var(--primary-color)"></div>
    <div class="legend-info">
      <div class="legend-name">${
        getTranslation("filters.all", currentLanguage) || "All"
      }</div>
      <div class="legend-count">${skillsData.skills.length} ${
    getTranslation("skills.technologies", currentLanguage) || "technologies"
  }</div>
    </div>
  `;
  legendContainer.appendChild(allItem);

  // Добавляем категории
  skillsData.categories.forEach((category) => {
    const skillsInCategory = skillsData.skills.filter(
      (skill) => skill.category === category.name
    );
    const avgLevel =
      skillsInCategory.length > 0
        ? Math.round(
            skillsInCategory.reduce((sum, skill) => sum + skill.level, 0) /
              skillsInCategory.length
          )
        : 0;

    const legendItem = document.createElement("div");
    legendItem.className = "legend-item";
    legendItem.dataset.filter = category.name;

    legendItem.innerHTML = `
      <div class="legend-color" style="background-color: ${
        category.color
      }"></div>
      <div class="legend-info">
        <div class="legend-name">${
          getTranslation(`skills.${category.name}`, currentLanguage) ||
          category.label[currentLanguage] ||
          category.name
        }</div>
        <div class="legend-count">${skillsInCategory.length} ${
      getTranslation("skills.technologies", currentLanguage) || "technologies"
    } • ${avgLevel}%</div>
      </div>
    `;

    legendContainer.appendChild(legendItem);
  });

  // Добавляем обработчики событий
  setupLegendInteractivity();
}

// функция для обработки взаимодействия с легендой
function setupLegendInteractivity() {
  const legendItems = document.querySelectorAll('.legend-item');
  
  legendItems.forEach(item => {
    item.addEventListener('click', () => {
      // Убираем активный класс у всех
      legendItems.forEach(i => i.classList.remove('active'));
      // Добавляем активный класс текущему
      item.classList.add('active');
      
      const filter = item.dataset.filter;
      filterChartData(filter);
      filterSkillsCloud(filter);
      filterCategoryDetails(filter);
    });
  });
}

// Функция для фильтрации данных диаграммы
function filterChartData(filter) {
  if (!skillsChartInstance || !skillsData) return;

  const datasets = skillsChartInstance.data.datasets;
  
  if (filter === 'all') {
    // Показываем все datasets
    datasets.forEach(dataset => {
      dataset.hidden = false;
    });
  } else {
    // Показываем только выбранную категорию
    datasets.forEach(dataset => {
      dataset.hidden = dataset.category !== filter;
    });
  }

  skillsChartInstance.update();
}

// Функция для фильтрации деталей категорий
function filterCategoryDetails(filter) {
  const categoryItems = document.querySelectorAll('.category-item');
  
  categoryItems.forEach(item => {
    if (filter === 'all') {
      item.style.display = 'block';
    } else {
      const categoryName = item.querySelector('.category-title').textContent.toLowerCase();
      const shouldShow = categoryName.includes(filter.toLowerCase());
      item.style.display = shouldShow ? 'block' : 'none';
    }
  });
}

function renderCategoryDetails() {
  if (!skillsData || !document.getElementById("categoryList")) return;

  const categoryList = document.getElementById("categoryList");
  categoryList.innerHTML = "";

  skillsData.categories.forEach((category, index) => {
    const skillsInCategory = skillsData.skills.filter(
      (skill) => skill.category === category.name
    );
    const avgLevel =
      skillsInCategory.length > 0
        ? Math.round(
            skillsInCategory.reduce((sum, skill) => sum + skill.level, 0) /
              skillsInCategory.length
          )
        : 0;

    const categoryItem = document.createElement("div");
    categoryItem.className = "category-item";
    categoryItem.style.borderLeftColor = category.color;
    categoryItem.style.animationDelay = `${index * 0.1}s`;

    categoryItem.innerHTML = `
      <div class="category-header">
        <div class="category-title">
          <div class="legend-color" style="background-color: ${
            category.color
          }"></div>
          ${
            getTranslation(`skills.${category.name}`, currentLanguage) ||
            category.label[currentLanguage] ||
            category.name
          }
        </div>
        <div class="category-stats">
          ${
            getTranslation("skills.averageLevel", currentLanguage) || "Average"
          }: ${avgLevel}%
        </div>
      </div>
      <div class="skills-list">
        ${skillsInCategory
          .map(
            (skill) => `
          <div class="skill-tag" data-skill="${skill.name}" title="${skill.level}%">
            <img src="${skill.icon}" alt="${skill.name}" onerror="this.style.display='none'">
            ${skill.name}
          </div>
        `
          )
          .join("")}
      </div>
    `;

    categoryList.appendChild(categoryItem);
  });
}

function renderSkillsCloud() {
  if (!skillsData || !document.getElementById("skillsCloud")) return;

  const skillsCloud = document.getElementById("skillsCloud");
  skillsCloud.innerHTML = "";

  // Shuffle skills for variety
  const shuffledSkills = [...skillsData.skills].sort(() => Math.random() - 0.5);

  shuffledSkills.forEach((skill, index) => {
    const category = skillsData.categories.find(
      (cat) => cat.name === skill.category
    );
    const cloudTag = document.createElement("div");
    cloudTag.className = `cloud-tag ${skill.category}`;
    cloudTag.textContent = skill.name;
    cloudTag.title = `${skill.name} - ${skill.level}%`;
    cloudTag.style.animationDelay = `${index * 0.05}s`;

    skillsCloud.appendChild(cloudTag);
  });
}

function filterSkillsCloud(filter) {
  const cloudTags = document.querySelectorAll(".cloud-tag");

  cloudTags.forEach((tag) => {
    if (filter === "all" || tag.classList.contains(filter)) {
      tag.style.display = "flex";
      tag.style.opacity = "1";
      tag.style.transform = "scale(1)";
    } else {
      tag.style.display = "none";
      tag.style.opacity = "0";
      tag.style.transform = "scale(0.8)";
    }
  });
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function initBasicSkillsChart() {
  // Fallback basic chart if skills.json fails to load
  if (!domCache.skillsChart) return;

  const isDarkTheme = document.body.classList.contains("dark-theme");
  const textColor = isDarkTheme ? "#f3f4f6" : "#1f2937";
  const gridColor = isDarkTheme
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";

  const skillsData = {
    labels: [
      getTranslation("skills.frontend", currentLanguage) || "Frontend",
      getTranslation("skills.backend", currentLanguage) || "Backend",
      getTranslation("skills.databases", currentLanguage) || "Databases",
      getTranslation("skills.algorithms", currentLanguage) || "Algorithms",
      getTranslation("skills.tools", currentLanguage) || "Tools",
      getTranslation("skills.oop", currentLanguage) || "OOP",
    ],
    datasets: [
      {
        label: getTranslation("skills.level", currentLanguage) || "Skill Level",
        data: [85, 90, 80, 75, 85, 95],
        backgroundColor: CONFIG.chartColors.primary,
        borderColor: CONFIG.chartColors.border,
        pointBackgroundColor: CONFIG.chartColors.point,
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: CONFIG.chartColors.border,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  skillsChartInstance = new Chart(domCache.skillsChart, {
    type: "radar",
    data: skillsData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            display: false,
            stepSize: 20,
          },
          grid: {
            color: gridColor,
          },
          angleLines: {
            color: gridColor,
          },
          pointLabels: {
            color: textColor,
            font: {
              size: 12,
              family: "'Inter', sans-serif",
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return context.dataset.label + ": " + context.raw + "%";
            },
          },
        },
      },
      animation: {
        duration: 2000,
        easing: "easeOutQuart",
      },
    },
  });
}

// функция для обработки анимации диаграммы навыков
function handleSkillsChartAnimation(chartContainer) {
  // Добавляем класс для запуска анимации
  chartContainer.classList.add("chart-visible");

  // Инициализируем диаграмму, если она еще не создана
  if (!skillsChartInstance && skillsData) {
    setTimeout(() => {
      initSkillsChart();
    }, 500);
  }

  // Анимируем появление элементов легенды с задержкой
  const legendItems = document.querySelectorAll(".legend-item");
  legendItems.forEach((item, index) => {
    setTimeout(() => {
      item.classList.add("visible");
    }, index * 100 + 300);
  });

  // Анимируем появление деталей навыков
  const categoryItems = document.querySelectorAll(".category-item");
  const cloudTags = document.querySelectorAll(".cloud-tag");

  categoryItems.forEach((item, index) => {
    setTimeout(() => {
      item.classList.add("visible");
    }, index * 100 + 600);
  });

  cloudTags.forEach((tag, index) => {
    setTimeout(() => {
      tag.classList.add("visible");
    }, index * 50 + 800);
  });
}

window.addEventListener(
  "resize",
  debounce(() => {
    const skillsSection = document.getElementById("skills");
    const chartContainer = document.querySelector(".skills-chart-container");

    if (skillsSection && chartContainer && isElementInViewport(skillsSection)) {
      if (!chartContainer.classList.contains("chart-visible")) {
        handleSkillsChartAnimation(chartContainer);
      }
    }
  }, 250)
);

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
function getTranslation(key, lang = currentLanguage) {
  if (!translations[lang]) return null;
  return key.split(".").reduce((obj, k) => obj && obj[k], translations[lang]);
}

function setButtonState(button, disabled, text) {
  button.disabled = disabled;
  button.textContent = text;
}

function showLoadingIndicator(container) {
  container.innerHTML = '<div class="loading-spinner"></div>';
}

function createNoProjectsMessage(lang) {
  return `
    <div class="no-projects">
      <p>${
        getTranslation("projects.none", lang) || "No projects available yet."
      }</p>
    </div>
  `;
}

// ==================== COOKIES УТИЛИТЫ ====================
function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// ==================== МОНИТОРИНГ ПРОИЗВОДИТЕЛЬНОСТИ ====================
function setupPerformanceMonitoring() {
  // Мониторинг FPS (только в development)
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    monitorFPS();
  }
}

function monitorFPS() {
  let frameCount = 0;
  let lastTime = performance.now();
  let fps = 0;

  function checkFPS() {
    frameCount++;
    const currentTime = performance.now();

    if (currentTime - lastTime >= 1000) {
      fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      frameCount = 0;
      lastTime = currentTime;

      if (fps < 50) {
        console.warn(
          `Low FPS detected: ${fps}. Consider optimizing animations.`
        );
      }
    }

    requestAnimationFrame(checkFPS);
  }

  checkFPS();
}

// ==================== ОЧИСТКА ПАМЯТИ ====================
function cleanup() {
  if (skillsChartInstance) {
    skillsChartInstance.destroy();
    skillsChartInstance = null;
  }

  // Очищаем кэш
  Object.keys(domCache).forEach((key) => {
    domCache[key] = null;
  });
}

window.addEventListener("beforeunload", cleanup);

// Обработчик изменения размера окна для диаграммы
window.addEventListener(
  "resize",
  debounce(() => {
    if (skillsChartInstance) {
      skillsChartInstance.resize();
    }
  }, 250)
);

// Глобальный обработчик клавиши ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => {
      if (modal.style.display === "block") {
        modal.style.display = "none";
        document.body.style.overflow = "";
      }
    });
  }
});

console.log("Optimized JavaScript loaded successfully!");
