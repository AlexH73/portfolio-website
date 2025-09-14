// ==================== КОНСТАНТЫ И ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
const CONFIG = {
  formspreeUrl: "https://formspree.io/f/xyzdlrvd",
  chartColors: {
    primary: "rgba(99, 102, 241, 0.2)",
    border: "rgba(99, 102, 241, 0.8)",
    point: "rgba(99, 102, 241, 1)",
  },
};

let currentLanguage = "de";
let translations = {};
let skillsChartInstance = null;

// ==================== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ====================
document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
  try {
    await loadResources();
    initializePage();
  } catch (error) {
    console.error("Failed to initialize app:", error);
    initializePage(); // Пытаемся инициализировать хотя бы базовые функции
  }
}

async function loadResources() {
  try {
    // Параллельная загрузка переводов и schema
    const [translationsResponse, schemaResponse] = await Promise.all([
      fetch("js/translations.json"),
      fetch("js/schema.json"),
    ]);

    if (!translationsResponse.ok)
      throw new Error("Failed to load translations");
    if (!schemaResponse.ok) throw new Error("Failed to load schema");

    translations = await translationsResponse.json();
    const schemaData = await schemaResponse.json();

    // Добавляем structured data
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
    loadProjects,
    setupFormHandler,
    setupSmoothScrolling,
    () => setTimeout(setupScrollAnimations, 100),
    setupScrollProgress,
    setupBackToTop,
    setupMobileMenu,
    setupCookiesBanner,
    setupPrivacyModal,
    initSkillsChart,
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
  const themeToggle = document.querySelector(".theme-toggle");
  if (!themeToggle) return;

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

  // Применяем тему
  if (currentTheme === "dark") {
    document.body.classList.add("dark-theme");
    themeToggle.textContent = "☀️";
  } else {
    themeToggle.textContent = "🌙";
  }

  themeToggle.addEventListener("click", toggleTheme);
}

function toggleTheme() {
  const themeToggle = document.querySelector(".theme-toggle");
  const cookiesPrefs = getCookie("cookies_preferences");

  document.body.classList.toggle("dark-theme");

  let theme = "light";
  if (document.body.classList.contains("dark-theme")) {
    theme = "dark";
    themeToggle.textContent = "☀️";
  } else {
    themeToggle.textContent = "🌙";
  }

  if (cookiesPrefs !== "false") {
    localStorage.setItem("theme", theme);
  }
}

// ==================== ЯЗЫК ====================
function initializeLanguage() {
  const langSelect = document.querySelector(".lang-select");
  if (!langSelect) return;

  const cookiesPrefs = getCookie("cookies_preferences");
  const savedLang =
    cookiesPrefs === "false" ? "de" : localStorage.getItem("language") || "de";

  currentLanguage = savedLang;
  langSelect.value = savedLang;

  updateMetaTags(savedLang);
  applyLanguage(savedLang);

  langSelect.addEventListener("change", handleLanguageChange);
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

  if (skillsChartInstance) {
    initSkillsChart();
  }
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
  const projectsGrid = document.querySelector(".projects-grid");
  if (!projectsGrid) return;

  showLoadingIndicator(projectsGrid);

  try {
    const response = await fetch("js/projects.json");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    displayProjects(data.projects, lang, projectsGrid);
  } catch (error) {
    console.error("Error loading projects:", error);
    showProjectsError(lang, projectsGrid, error.message);
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
                          .map(
                            (tech) => `<span class="tech-tag">${tech}</span>`
                          )
                          .join("")}
                    </div>
                    <div class="project-links">
                        ${
                          project.demoLink !== "#"
                            ? `<a href="${
                                project.demoLink
                              }" class="btn" target="_blank">${
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
  const projectsGrid = document.querySelector(".projects-grid");
  const projectCards = projectsGrid.querySelectorAll(".project-card");

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

// ==================== ФОРМА ОБРАТНОЙ СВЯЗИ С reCAPTCHA ====================

function setupFormHandler() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  setupFormValidation(contactForm);
  contactForm.addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  
  if (!validateForm(form)) {
    showError(getTranslation('form.validationError', currentLanguage));
    return;
  }
  
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  
  try {
    setButtonState(submitBtn, true, getTranslation('form.sending', currentLanguage));
    
    // Получаем токен reCAPTCHA
  const recaptchaResponse = grecaptcha.getResponse();
  if (!recaptchaResponse) {
    showError("Please complete the reCAPTCHA");
    return;
  }
    
    await sendFormData(formData);
    showSuccess(getTranslation('form.success', currentLanguage));
    form.reset();
  } catch (error) {
    console.error('Form submission error:', error);
    showError(`${getTranslation('form.error', currentLanguage)}: ${error.message}`);
  } finally {
    setButtonState(submitBtn, false, originalText);
  }
}

// Функция для получения токена reCAPTCHA
function getRecaptchaToken() {
  return new Promise((resolve, reject) => {
    if (typeof grecaptcha === 'undefined') {
      reject(new Error('reCAPTCHA not loaded'));
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

function showWarning(message) {
  const title =
    getTranslation("notification.warning", currentLanguage) || "Warning";
  showNotification("warning", title, message);
}

// ==================== ПЛАВНАЯ ПРОКРУТКА ====================
function setupSmoothScrolling() {
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

// ==================== АНИМАЦИИ ПРИ ПРОКРУТКЕ ====================
function setupScrollAnimations() {
  const animatedElements = document.querySelectorAll("section, .fade-in");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }
  );

  animatedElements.forEach((element) => observer.observe(element));
}

// ==================== ИНДИКАТОР ПРОКРУТКИ ====================
function setupScrollProgress() {
  const progressBar = document.getElementById("progressBar");
  if (!progressBar) return;

  window.addEventListener("scroll", () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const progress = (scrollTop / documentHeight) * 100;

    progressBar.style.width = `${progress}%`;
  });
}

// ==================== КНОПКА "НАВЕРХ" ====================
function setupBackToTop() {
  const backToTopBtn = document.getElementById("backToTop");
  if (!backToTopBtn) return;

  window.addEventListener("scroll", () => {
    backToTopBtn.classList.toggle("visible", window.pageYOffset > 300);
  });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// ==================== МОБИЛЬНОЕ МЕНЮ ====================
function setupMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.querySelector("nav ul");
  if (!menuToggle || !nav) return;

  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("active");
    menuToggle.classList.toggle("active");
    document.body.style.overflow = nav.classList.contains("active")
      ? "hidden"
      : "";
  });

  // Закрытие меню при клике на ссылку
  const navLinks = document.querySelectorAll("nav a");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => closeMobileMenu(nav, menuToggle));
  });

  // Закрытие меню при клике вне его области
  document.addEventListener("click", (e) => {
    if (
      nav.classList.contains("active") &&
      !nav.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {
      closeMobileMenu(nav, menuToggle);
    }
  });

  // Закрытие меню при нажатии ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("active")) {
      closeMobileMenu(nav, menuToggle);
    }
  });
}

function closeMobileMenu(nav, menuToggle) {
  nav.classList.remove("active");
  menuToggle.classList.remove("active");
  document.body.style.overflow = "";
}

// ==================== УПРАВЛЕНИЕ COOKIES ====================
function setupCookiesBanner() {
  const banner = document.getElementById("cookies-banner");
  const acceptBtn = document.getElementById("cookies-accept");
  const rejectBtn = document.getElementById("cookies-reject");
  const learnMoreLink = document.getElementById("cookies-learn-more");
  const savePrefsBtn = document.getElementById("save-cookies-preferences");

  if (!banner || !acceptBtn || !rejectBtn) return;

  const cookiesDecision = getCookie("cookies_decision");

  if (!cookiesDecision) {
    setTimeout(() => banner.classList.add("active"), 1000);
  }

  acceptBtn.addEventListener("click", () => acceptCookies(banner));
  rejectBtn.addEventListener("click", () => rejectCookies(banner));

  if (learnMoreLink) {
    learnMoreLink.addEventListener("click", (e) => {
      e.preventDefault();
      banner.classList.remove("active");
      const privacySection = document.getElementById("privacy");
      if (privacySection) privacySection.scrollIntoView({ behavior: "smooth" });
    });
  }

  if (savePrefsBtn) {
    savePrefsBtn.addEventListener("click", saveCookiesPreferences);
  }

  loadCookiesPreferences();
}

function acceptCookies(banner) {
  setCookie("cookies_decision", "accepted", 365);
  setCookie("cookies_preferences", "true", 365);
  setCookie("cookies_analytics", "true", 365);
  banner.classList.remove("active");
}

function rejectCookies(banner) {
  setCookie("cookies_decision", "rejected", 365);
  setCookie("cookies_preferences", "false", 365);
  setCookie("cookies_analytics", "false", 365);
  banner.classList.remove("active");

  deleteCookie("cookies_preferences");
  deleteCookie("cookies_analytics");
  deleteCookie("theme");
  deleteCookie("language");

  setTimeout(() => window.location.reload(), 500);
}

function saveCookiesPreferences() {
  const prefsChecked = document.getElementById("cookies-preferences").checked;
  const analyticsChecked = document.getElementById("cookies-analytics").checked;

  setCookie("cookies_preferences", prefsChecked.toString(), 365);
  setCookie("cookies_analytics", analyticsChecked.toString(), 365);

  showSuccess(
    getTranslation("privacy.saved", currentLanguage) || "Settings saved"
  );
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

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ COOKIES ====================
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

// ==================== МОДАЛЬНОЕ ОКНО ПОЛИТИКИ ====================
function setupPrivacyModal() {
  const modal = document.getElementById("privacy-modal");
  const fabButton = document.getElementById("privacy-fab");
  const closeBtn = document.querySelector(".modal-close");
  const learnMoreLink = document.getElementById("cookies-learn-more");

  if (!modal) return;

  function openModal() {
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }

  if (fabButton) fabButton.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (learnMoreLink) {
    learnMoreLink.addEventListener("click", function (e) {
      e.preventDefault();
      openModal();
    });
  }

  window.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.style.display === "block") closeModal();
  });

  // Перенос содержимого из старой секции
  const oldPrivacySection = document.getElementById("privacy");
  const privacyContent = document.querySelector(".privacy-content");

  if (oldPrivacySection && privacyContent) {
    const privacyInnerContent =
      oldPrivacySection.querySelector(".privacy-content");
    if (privacyInnerContent) {
      privacyContent.innerHTML = privacyInnerContent.innerHTML;
      oldPrivacySection.remove();
    }
  }
}

// ==================== ДИАГРАММА НАВЫКОВ ====================
function initSkillsChart() {
  const ctx = document.getElementById("skills-chart");
  if (!ctx) return;

  if (typeof Chart === "undefined") {
    console.error("Chart.js is not loaded");
    return;
  }

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

  if (skillsChartInstance) {
    skillsChartInstance.destroy();
  }

  skillsChartInstance = new Chart(ctx, {
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
            color: "rgba(119, 119, 119, 0.1)",
          },
          angleLines: {
            color: "rgba(119, 119, 119, 0.1)",
          },
          pointLabels: {
            color: "var(--text-primary)",
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
                      getTranslation("projects.none", lang) ||
                      "No projects available yet."
                    }</p>
                </div>
            `;
}

// Обработчик изменения размера окна для диаграммы
window.addEventListener("resize", () => {
  if (skillsChartInstance) {
    skillsChartInstance.resize();
  }
});

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
