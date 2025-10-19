// =====================================================
// PROJECTS MANAGEMENT MODULE
// =====================================================

import { CONFIG } from '../config/constants.js';
import { getDOM, fetchJSON } from '../core/app.js';
import { Language } from './language.js';
import { Animations } from '../core/dom.js';

export const Projects = {
  async load(lang = Language.current) {
    if (!getDOM('projectsGrid')) return;

    this.showLoading();

    try {
      const data = await fetchJSON(CONFIG.endpoints.projects);
      this.display(data.projects, lang);
      this.setupFilters(lang);
    } catch (error) {
      this.showError(lang, error.message);
    }
  },

  display(projects, lang) {
    const featuredProjects = projects.filter(
      (project) => project.featured !== false
    );

    if (featuredProjects.length === 0) {
      getDOM('projectsGrid').innerHTML = this.createNoProjectsMessage(lang);
      return;
    }

    getDOM('projectsGrid').innerHTML = '';
    featuredProjects.forEach((project, index) => {
      const projectCard = this.createProjectCard(project, lang);
      projectCard.style.animationDelay = `${index * 0.1}s`;
      getDOM('projectsGrid').appendChild(projectCard);
    });
  },

  createProjectCard(project, lang) {
    const title = project.title[lang] || project.title.en || project.title.de;
    const description =
      project.description[lang] ||
      project.description.en ||
      project.description.de;

    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-category', project.category);

    card.innerHTML = `
      <div class="project-image">
        <img src="${project.image}" alt="${title}" loading="lazy">
      </div>
      <div class="project-content">
        <h3 class="project-title">${title}</h3>
        <p class="project-description">${description}</p>
        <div class="project-tech">
          ${project.technologies
            .map((tech) => `<span class="tech-tag">${tech}</span>`)
            .join('')}
        </div>
        <div class="project-links">
          ${
            project.demoLink !== '#'
              ? `<a href="${project.demoLink}" class="btn" target="_blank">${
                  Language.getTranslation('projects.demo', lang) || 'Demo'
                }</a>`
              : ''
          }
          <a href="${project.codeLink}" class="btn ${
      project.demoLink === '#' ? '' : 'btn-outline'
    }" target="_blank">
            ${Language.getTranslation('projects.code', lang) || 'Code'}
          </a>
        </div>
      </div>
    `;

    return card;
  },

  showLoading() {
    if (getDOM('projectsGrid')) {
      getDOM('projectsGrid').innerHTML = '<div class="loading-spinner"></div>';
    }
  },

  showError(lang, errorMessage) {
    if (getDOM('projectsGrid')) {
      getDOM('projectsGrid').innerHTML = `
        <div class="no-projects">
          <p>${
            Language.getTranslation('projects.unavailable', lang) ||
            'Projects are temporarily unavailable.'
          }</p>
          <p><small>Error: ${errorMessage}</small></p>
        </div>
      `;
    }
  },

  createNoProjectsMessage(lang) {
    return `
      <div class="no-projects">
        <p>${
          Language.getTranslation('projects.none', lang) ||
          'No projects available yet.'
        }</p>
      </div>
    `;
  },

  setupFilters(lang = Language.current) {
    if (!lang) lang = Language.current;

    // Remove existing filters if any
    const existingFilters = document.querySelector('.projects-filters');
    if (existingFilters) {
      existingFilters.remove();
    }

    const filters = Language.getTranslation('filters', lang) || {
      all: 'All',
      frontend: 'Frontend',
      backend: 'Backend',
      fullstack: 'Full Stack',
    };

    const filtersContainer = document.createElement('div');
    filtersContainer.className = 'projects-filters';
    filtersContainer.innerHTML = `
      <button class="filter-btn active" data-filter="all">${filters.all}</button>
      <button class="filter-btn" data-filter="frontend">${filters.frontend}</button>
      <button class="filter-btn" data-filter="backend">${filters.backend}</button>
      <button class="filter-btn" data-filter="fullstack">${filters.fullstack}</button>
    `;

    const projectsContainer = document.querySelector('.projects .container');
    const sectionTitle = document.querySelector('.projects .section-title');

    if (projectsContainer && sectionTitle) {
      sectionTitle.insertAdjacentElement('afterend', filtersContainer);
      this.setupFilterButtons();
    }
  },

  setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        filterButtons.forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');
        this.filterProjects(button.getAttribute('data-filter'));
      });
    });
  },

  filterProjects(filter) {
    if (!getDOM('projectsGrid')) return;

    const projectCards =
      getDOM('projectsGrid').querySelectorAll('.project-card');

    projectCards.forEach((card) => {
      const category = card.getAttribute('data-category');
      card.style.display =
        filter === 'all' || category === filter ? 'block' : 'none';
    });
  },

  updateFiltersLanguage(lang) {
    const filtersContainer = document.querySelector('.projects-filters');
    if (!filtersContainer) return;

    const filters = Language.getTranslation('filters', lang) || {
      all: 'All',
      frontend: 'Frontend',
      backend: 'Backend',
      fullstack: 'Full Stack',
    };

    const filterButtons = filtersContainer.querySelectorAll('.filter-btn');
    filterButtons.forEach((button) => {
      const filter = button.getAttribute('data-filter');
      button.textContent = filters[filter] || filter;
    });
  },
};
