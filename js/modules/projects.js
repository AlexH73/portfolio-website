// =====================================================
// PROJECTS MANAGEMENT MODULE
// =====================================================

import { CONFIG } from '../config/constants.js';
import { getDOM, fetchJSON, AppState } from '../core/app.js';
import { Language } from './language.js';

export const Projects = {
  async load(lang = Language.current) {
    if (!getDOM('projectsGrid')) return;

    this.showLoading();

    try {
      if (!AppState.projectsData) {
        const data = await fetchJSON(CONFIG.endpoints.projects);
        AppState.projectsData = data.projects;
      }

      this.display(AppState.projectsData, lang);
      this.setupFilters(lang);
    } catch (error) {
      console.error('Projects loading failed:', error);
      this.showError(lang);
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

    const card = document.createElement('article');
    card.className = 'project-card';
    card.setAttribute('data-category', project.category);

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'project-image';
    const image = document.createElement('img');
    image.src = this.getSafeUrl(project.image, 'image');
    image.alt = title;
    image.loading = 'lazy';
    imageWrapper.appendChild(image);

    const content = document.createElement('div');
    content.className = 'project-content';
    const heading = document.createElement('h3');
    heading.className = 'project-title';
    heading.textContent = title;
    const summary = document.createElement('p');
    summary.className = 'project-description';
    summary.textContent = description;

    const technologies = document.createElement('div');
    technologies.className = 'project-tech';
    project.technologies.forEach((technology) => {
      const tag = document.createElement('span');
      tag.className = 'tech-tag';
      tag.textContent = technology;
      technologies.appendChild(tag);
    });

    const links = document.createElement('div');
    links.className = 'project-links';
    if (project.demoLink && project.demoLink !== '#') {
      links.appendChild(
        this.createExternalLink(
          project.demoLink,
          Language.getTranslation('projects.demo', lang) || 'Demo',
          'btn'
        )
      );
    }
    if (project.codeLink) {
      links.appendChild(
        this.createExternalLink(
          project.codeLink,
          Language.getTranslation('projects.code', lang) || 'Code',
          `btn ${project.demoLink === '#' ? '' : 'btn-outline'}`.trim()
        )
      );
    }

    content.append(heading, summary, technologies, links);
    card.append(imageWrapper, content);

    return card;
  },

  createExternalLink(url, label, className) {
    const link = document.createElement('a');
    link.href = this.getSafeUrl(url, 'link');
    link.className = className;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = label;
    return link;
  },

  getSafeUrl(value) {
    try {
      const url = new URL(value, window.location.href);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch {
      return '';
    }
  },

  showLoading() {
    if (getDOM('projectsGrid')) {
      getDOM('projectsGrid').innerHTML = '<div class="loading-spinner"></div>';
    }
  },

  showError(lang) {
    if (getDOM('projectsGrid')) {
      getDOM('projectsGrid').innerHTML = `
        <div class="no-projects">
          <p>${
            Language.getTranslation('projects.unavailable', lang) ||
            'Projects are temporarily unavailable.'
          }</p>
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

    const filters = Language.getTranslation('filters', lang) || {};
    const categories = [
      'all',
      ...new Set(AppState.projectsData.map(({ category }) => category)),
    ];

    const filtersContainer = document.createElement('div');
    filtersContainer.className = 'projects-filters';
    filtersContainer.setAttribute('aria-label', filters.label || 'Project filters');
    categories.forEach((category) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `filter-btn${category === 'all' ? ' active' : ''}`;
      button.dataset.filter = category;
      button.setAttribute('aria-pressed', String(category === 'all'));
      button.textContent =
        filters[category] ||
        `${category.charAt(0).toUpperCase()}${category.slice(1)}`;
      filtersContainer.appendChild(button);
    });

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
        filterButtons.forEach((btn) => btn.setAttribute('aria-pressed', 'false'));
        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');
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
