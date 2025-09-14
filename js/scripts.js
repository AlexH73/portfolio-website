// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И ИНИЦИАЛИЗАЦИЯ ====================

let currentLanguage = "de";

// Загрузка переводов и инициализация страницы
document.addEventListener("DOMContentLoaded", function () {
  loadTranslationsAndInitialize();
});

async function loadTranslationsAndInitialize() {
  try {
    // Загрузка переводов
    const translationsResponse = await fetch("js/translations.json");
    window.translations = await translationsResponse.json();

    // Загрузка schema данных
    const schemaResponse = await fetch("js/schema.json");
    const schemaData = await schemaResponse.json();

    // Добавление структурированных данных на страницу
    const script = document.getElementById("structured-data");
    script.textContent = JSON.stringify(schemaData);

    // Инициализация страницы
    initializePage();
  } catch (error) {
    console.error("Error loading data:", error);
    initializePage();
  }
}

// ==================== ОСНОВНАЯ ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ ====================

function initializePage() {
  // Инициализация темы с учетом cookies
  initializeTheme();

  // Инициализация языка с учетом cookies
  initializeLanguage();

  // Загрузка проектов
  loadProjects();

  // Настройка обработки формы
  setupFormHandler();

  // Настройка плавной прокрутки
  setupSmoothScrolling();

  // Настройка анимаций при прокрутке
  setTimeout(() => {
    setupScrollAnimations();
  }, 100);

  // Настройка дополнительных функций
  setupScrollProgress();
  setupBackToTop();
  setupMobileMenu();
  setupCookiesBanner();
  // Функции для модального окна политики
  setupPrivacyModal();
  // Функция для инициализации диаграммы навыков
  initSkillsChart();
}

// ==================== ФУНКЦИИ ТЕМЫ ====================

function initializeTheme() {
  const themeToggle = document.querySelector(".theme-toggle");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  // Проверяем настройки cookies
  const cookiesPrefs = getCookie("cookies_preferences");

  let currentTheme;

  // Если cookies предпочтений отключены, используем системные настройки
  if (cookiesPrefs === "false") {
    currentTheme = prefersDarkScheme.matches ? "dark" : "light";
  } else {
    // Иначе используем сохраненные настройки
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

  // Обработчик переключения темы
  themeToggle.addEventListener("click", function () {
    const cookiesPrefs = getCookie("cookies_preferences");

    document.body.classList.toggle("dark-theme");

    let theme = "light";
    if (document.body.classList.contains("dark-theme")) {
      theme = "dark";
      themeToggle.textContent = "☀️";
    } else {
      themeToggle.textContent = "🌙";
    }

    // Сохраняем настройку только если разрешено
    if (cookiesPrefs !== "false") {
      localStorage.setItem("theme", theme);
    }
  });
}

// ==================== ФУНКЦИИ ЯЗЫКА ====================

function initializeLanguage() {
  const langSelect = document.querySelector(".lang-select");

  // Проверяем настройки cookies
  const cookiesPrefs = getCookie("cookies_preferences");

  let savedLang;

  // Если cookies предпочтений отключены, используем язык по умолчанию
  if (cookiesPrefs === "false") {
    savedLang = "de";
  } else {
    // Иначе используем сохраненные настройки
    savedLang = localStorage.getItem("language") || "de";
  }

  // Устанавливаем язык
  currentLanguage = savedLang;
  langSelect.value = savedLang;
  updateMetaTags(savedLang);
  changeLanguage(savedLang);

  // Обработчик изменения языка
  langSelect.addEventListener("change", function () {
    const cookiesPrefs = getCookie("cookies_preferences");
    const lang = this.value;

    // Сохраняем настройку только если разрешено
    if (cookiesPrefs !== "false") {
      localStorage.setItem("language", lang);
    }

    currentLanguage = lang;
    changeLanguage(lang);
  });
}

function changeLanguage(lang) {
  if (!window.translations) return;

  // Обновляем все элементы с атрибутом data-i18n
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

  // Обновляем атрибут lang HTML
  document.documentElement.lang = lang;

  // Обновляем метатеги
  updateMetaTags(lang);

  // Обновляем проекты
  loadProjects(lang);

  // Обновляем фильтры проектов
  updateFiltersLanguage(lang);

  // Обновляем диаграмму навыков
  if (window.skillsChartInstance) {
    initSkillsChart();
  }
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

// ==================== МЕТАТЕГИ ====================

function updateMetaTags(lang) {
  if (!window.translations || !window.translations[lang]) return;

  const meta = window.translations[lang].meta;
  if (!meta) return;

  // Обновляем description
  updateMetaTag("name", "description", meta.description);

  // Обновляем keywords
  updateMetaTag("name", "keywords", meta.keywords);

  // Обновляем title
  if (meta.title) {
    document.title = meta.title;
  }

  // Обновляем Open Graph метатеги
  updateSocialMeta(
    "og:title",
    meta.title || "Alexander Hermann - Full-Stack Developer"
  );
  updateSocialMeta("og:description", meta.description);
  updateSocialMeta("og:locale", getOgLocale(lang));

  // Обновляем Twitter метатеги
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

function loadProjects(lang = null) {
  if (!lang) lang = currentLanguage;

  const projectsGrid = document.querySelector(".projects-grid");
  if (!projectsGrid) return;

  // Пытаемся загрузить из внешнего JSON
  fetch("js/projects.json")
    .then((response) => {
      if (!response.ok) throw new Error("Projects file not found");
      return response.json();
    })
    .then((data) => {
      displayProjects(data.projects, lang, projectsGrid);
    })
    .catch((error) => {
      console.error("Error loading projects:", error);
      showProjectsError(lang, projectsGrid, error.message);
    });
}

function displayProjects(projects, lang, container) {
  container.innerHTML = "";

  const projectsToShow = projects.filter(
    (project) => project.featured !== false
  );

  // Если проектов нет, показываем сообщение
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
    const projectCard = createProjectCard(project, lang);
    container.appendChild(projectCard);
  });

  // Настраиваем фильтры проектов
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

function setupProjectFilters(lang = null) {
  if (!lang) lang = currentLanguage;

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

  // Находим контейнер для вставки фильтров
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

// ==================== ФОРМА ОБРАТНОЙ СВЯЗИ ====================

function setupFormHandler() {
  const contactForm = document.getElementById("contactForm");
  if (!contactForm) return;

  // Добавляем валидацию в реальном времени
  const inputs = contactForm.querySelectorAll("input, textarea");
  inputs.forEach((input) => {
    input.addEventListener("blur", (e) => validateField(e.target));
    input.addEventListener("input", (e) => clearFieldError(e.target));
  });

  // Обработчик отправки формы
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Валидация всех полей перед отправкой
    let isValid = true;
    inputs.forEach((input) => {
      if (!validateField(input)) isValid = false;
    });

    if (!isValid) {
      alert(
        getTranslation("form.validationError", currentLanguage) ||
          "Please fill all fields correctly."
      );
      return;
    }

    // Показываем индикатор загрузки
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent =
      getTranslation("form.sending", currentLanguage) || "Sending...";
    submitBtn.disabled = true;

    // Подготовка данных формы
    const formData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      message: document.getElementById("message").value,
    };

    // Отправка формы
    sendFormData(formData)
      .then(() => {
        alert(getTranslation("form.success", currentLanguage));
        contactForm.reset();
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(
          getTranslation("form.error", currentLanguage) ||
            "There was a problem sending your message."
        );
      })
      .finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      });
  });
}

async function sendFormData(formData) {
  const response = await fetch("https://formspree.io/f/xyzdlrvd", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) throw new Error("Form submission failed");
  return response.json();
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

  if (!isValid) showFieldError(field, errorMessage);
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

  // Проверяем, было ли уже принято решение о cookies
  const cookiesDecision = getCookie("cookies_decision");

  if (!cookiesDecision) {
    // Показываем баннер, если решение еще не принято
    setTimeout(() => banner.classList.add("active"), 1000);
  }

  // Обработка принятия cookies
  acceptBtn.addEventListener("click", () => acceptCookies(banner));

  // Обработка отклонения cookies
  rejectBtn.addEventListener("click", () => rejectCookies(banner));

  // Плавный скролл к разделу с политикой
  if (learnMoreLink) {
    learnMoreLink.addEventListener("click", (e) => {
      e.preventDefault();
      banner.classList.remove("active");
      const privacySection = document.getElementById("privacy");
      if (privacySection) privacySection.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Сохранение настроек cookies
  if (savePrefsBtn) {
    savePrefsBtn.addEventListener("click", saveCookiesPreferences);
  }

  // Загрузка сохраненных настроек
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

  // Удаляем все cookies, которые не являются необходимыми
  deleteCookie("cookies_preferences");
  deleteCookie("cookies_analytics");
  deleteCookie("theme");
  deleteCookie("language");

  // Перезагружаем страницу для применения настроек
  setTimeout(() => window.location.reload(), 500);
}

function saveCookiesPreferences() {
  const prefsChecked = document.getElementById("cookies-preferences").checked;
  const analyticsChecked = document.getElementById("cookies-analytics").checked;

  setCookie("cookies_preferences", prefsChecked.toString(), 365);
  setCookie("cookies_analytics", analyticsChecked.toString(), 365);

  // alert(
  //   getTranslation("privacy.saved", currentLanguage) || "Настройки сохранены"
  // );
  // Находим кнопку и контейнер для сообщения
  const saveBtn = document.getElementById("save-cookies-preferences");
  let msg = document.getElementById("cookies-save-message");
  if (!msg) {
    msg = document.createElement("div");
    msg.id = "cookies-save-message";
    msg.style.position = "relative";
    msg.style.float = "right";
    msg.style.right = "0";
    msg.style.top = "0";
    msg.style.background = "#4caf50";
    msg.style.color = "#fff";
    msg.style.padding = "6px 16px";
    msg.style.borderRadius = "4px";
    msg.style.fontSize = "14px";
    msg.style.zIndex = "1000";
    msg.style.transition = "opacity 0.3s";
    msg.style.opacity = "0";
    saveBtn.parentNode.appendChild(msg);
  }

  msg.textContent =
    getTranslation("privacy.saved", currentLanguage) || "Настройки сохранены";
  msg.style.opacity = "1";

  // Показываем сообщение на 2 секунды, затем скрываем и закрываем модалку
  setTimeout(() => {
    msg.style.opacity = "0";
    setTimeout(() => {
      msg.remove();
      // Закрываем модальное окно
      const modal = document.getElementById("privacy-modal");
      if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "";
      }
    }, 300);
  }, 1000);
}

function loadCookiesPreferences() {
  // Загружаем настройки cookies и применяем их
  const prefs = getCookie("cookies_preferences");
  const analytics = getCookie("cookies_analytics");

  // Если cookies предпочтений отключены, очищаем настройки
  if (prefs === "false") {
    localStorage.removeItem("theme");
    localStorage.removeItem("language");
  }

  // Если аналитические cookies отключены, отключаем аналитику
  if (analytics === "false") {
    window["ga-disable-UA-XXXXX-Y"] = true;
  }

  // Обновляем чекбоксы в настройках
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
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

function getCurrentLanguage() {
  return currentLanguage;
}

// Функции для модального окна политики
function setupPrivacyModal() {
  const modal = document.getElementById("privacy-modal");
  const fabButton = document.getElementById("privacy-fab");
  const closeBtn = document.querySelector(".modal-close");
  const learnMoreLink = document.getElementById("cookies-learn-more");

  // Открытие модального окна
  function openModal() {
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  }

  // Закрытие модального окна
  function closeModal() {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }

  // Обработчики событий
  if (fabButton) fabButton.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (learnMoreLink) {
    learnMoreLink.addEventListener("click", function (e) {
      e.preventDefault();
      openModal();
    });
  }

  // Закрытие при клике вне окна
  window.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });

  // Закрытие по ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.style.display === "block") closeModal();
  });

  // Переносим содержимое из старой секции в модальное окно
  const oldPrivacySection = document.getElementById("privacy");
  const privacyContent = document.querySelector(".privacy-content");

  if (oldPrivacySection && privacyContent) {
    const privacyInnerContent =
      oldPrivacySection.querySelector(".privacy-content");
    if (privacyInnerContent) {
      privacyContent.innerHTML = privacyInnerContent.innerHTML;
      // Удаляем старую секцию
      oldPrivacySection.remove();
    }
  }
}

// Функция для инициализации диаграммы навыков
function initSkillsChart() {
  const ctx = document.getElementById("skills-chart");
  if (!ctx) return;

  // Убедимся, что Chart доступен
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
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: "rgba(99, 102, 241, 0.8)",
        pointBackgroundColor: "rgba(99, 102, 241, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(99, 102, 241, 1)",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Удаляем предыдущий график, если он существует
  if (window.skillsChartInstance) {
    window.skillsChartInstance.destroy();
  }

  // Создаем новый график
  window.skillsChartInstance = new Chart(ctx, {
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
            color: "rgba(255, 255, 255, 0.1)",
          },
          angleLines: {
            color: "rgba(255, 255, 255, 0.1)",
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

window.addEventListener("resize", function () {
  if (window.skillsChartInstance) {
    window.skillsChartInstance.resize();
  }
});