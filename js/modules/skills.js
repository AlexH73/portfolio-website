// =====================================================
// SKILLS CHART AND VISUALIZATION MODULE
// =====================================================

import { CONFIG } from '../config/constants.js';
import { getDOM, AppState, fetchJSON } from '../core/app.js';
import { Language } from './language.js';
import { hexToRgba } from '../utils/helpers.js';
import { Animations, Visibility } from '../core/dom.js';

export const Skills = {
  async loadData() {
    try {
      AppState.skillsData = await fetchJSON(CONFIG.endpoints.skills);
      this.initializeComponents();
    } catch (error) {
      console.error('Error loading skills data:', error);
      this.initializeFallbackChart();
    }
  },

  initializeComponents() {
    this.initChart();
    this.renderLegend();
    this.renderCategoryDetails();
    this.renderSkillsCloud();
    this.setupInteractivity();
  },

  initChart() {
    if (!getDOM('skillsChart') || !AppState.skillsData) return;

    // Destroy existing chart
    if (AppState.skillsChart) {
      AppState.skillsChart.destroy();
    }

    const isDarkTheme = document.body.classList.contains('dark-theme');
    const chartData = this.prepareChartData();

    AppState.skillsChart = new Chart(getDOM('skillsChart'), {
      type: 'radar',
      data: chartData,
      options: this.getChartOptions(isDarkTheme),
    });
  },

  prepareChartData() {
    const { skills, categories } = AppState.skillsData;
    const allSkills = skills.map((skill) => skill.name);

    const datasets = categories.map((category) => {
      const categorySkills = skills.filter(
        (skill) => skill.category === category.name
      );
      const data = allSkills.map((skillName) => {
        const skill = categorySkills.find((s) => s.name === skillName);
        return skill ? skill.level : 0;
      });

      return {
        label:
          Language.getTranslation(`skills.${category.name}`) || category.name,
        data: data,
        backgroundColor: hexToRgba(category.color, 0.2),
        borderColor: category.color,
        pointBackgroundColor: category.color,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: category.color,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        category: category.name,
      };
    });

    return {
      labels: allSkills,
      datasets: datasets,
    };
  },

  getChartOptions(isDarkTheme) {
    const textColor = isDarkTheme ? '#f3f4f6' : '#1f2937';
    const gridColor = isDarkTheme
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)';

    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: { display: false, stepSize: 20 },
          grid: { color: gridColor },
          angleLines: { color: gridColor },
          pointLabels: {
            color: textColor,
            font: { size: 11, family: "'Inter', sans-serif" },
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.raw || 0;
              const category = context.dataset.category || '';
              return `${label}: ${value}% (${category})`;
            },
          },
        },
      },
      animation: CONFIG.charts.skills.animation,
      elements: {
        line: { tension: 0.1 },
      },
    };
  },

  renderLegend() {
    if (!getDOM('chartLegend') || !AppState.skillsData) return;

    const { skills, categories } = AppState.skillsData;
    getDOM('chartLegend').innerHTML = '';

    // Add "All" item
    this.createLegendItem('all', skills.length);

    // Add category items
    categories.forEach((category) => {
      const categorySkills = skills.filter(
        (skill) => skill.category === category.name
      );
      const avgLevel = this.calculateAverageLevel(categorySkills);
      this.createLegendItem(
        category.name,
        categorySkills.length,
        avgLevel,
        category.color
      );
    });

    this.setupLegendInteractivity();
  },

  createLegendItem(
    category,
    count,
    avgLevel = null,
    color = 'var(--primary-color)'
  ) {
    const item = document.createElement('div');
    item.className = `legend-item ${category === 'all' ? 'active' : ''}`;
    item.dataset.filter = category;

    const label =
      category === 'all'
        ? Language.getTranslation('filters.all') || 'All'
        : Language.getTranslation(`skills.${category}`) || category;

    const countText = `${count} ${
      Language.getTranslation('skills.technologies') || 'technologies'
    }`;
    const levelText = avgLevel ? ` • ${avgLevel}%` : '';

    item.innerHTML = `
      <div class="legend-color" style="background-color: ${color}"></div>
      <div class="legend-info">
        <div class="legend-name">${label}</div>
        <div class="legend-count">${countText}${levelText}</div>
      </div>
    `;

    getDOM('chartLegend').appendChild(item);
  },

  calculateAverageLevel(skills) {
    if (skills.length === 0) return 0;
    const total = skills.reduce((sum, skill) => sum + skill.level, 0);
    return Math.round(total / skills.length);
  },

  setupLegendInteractivity() {
    const legendItems = document.querySelectorAll('.legend-item');

    legendItems.forEach((item) => {
      item.addEventListener('click', () => {
        // Remove active class from all items
        legendItems.forEach((i) => i.classList.remove('active'));
        // Add active class to current item
        item.classList.add('active');

        const filter = item.dataset.filter;
        this.filterChartData(filter);
        this.filterSkillsCloud(filter);
        this.filterCategoryDetails(filter);
      });
    });
  },

  filterChartData(filter) {
    if (!AppState.skillsChart || !AppState.skillsData) return;

    const datasets = AppState.skillsChart.data.datasets;

    if (filter === 'all') {
      // Show all datasets
      datasets.forEach((dataset) => {
        dataset.hidden = false;
      });
    } else {
      // Show only selected category
      datasets.forEach((dataset) => {
        dataset.hidden = dataset.category !== filter;
      });
    }

    AppState.skillsChart.update();
  },

  renderCategoryDetails() {
    if (!getDOM('categoryList') || !AppState.skillsData) return;

    const { categories } = AppState.skillsData;
    getDOM('categoryList').innerHTML = '';

    categories.forEach((category, index) => {
      const skillsInCategory = AppState.skillsData.skills.filter(
        (skill) => skill.category === category.name
      );
      const avgLevel = this.calculateAverageLevel(skillsInCategory);

      const categoryItem = document.createElement('div');
      categoryItem.className = 'category-item';
      categoryItem.style.borderLeftColor = category.color;
      categoryItem.style.animationDelay = `${index * 0.1}s`;

      categoryItem.innerHTML = `
        <div class="category-header">
          <div class="category-title">
            <div class="legend-color" style="background-color: ${
              category.color
            }"></div>
            ${
              Language.getTranslation(`skills.${category.name}`) ||
              category.name
            }
          </div>
          <div class="category-stats">
            ${
              Language.getTranslation('skills.averageLevel') || 'Average'
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
            .join('')}
        </div>
      `;

      getDOM('categoryList').appendChild(categoryItem);
    });
  },

  renderSkillsCloud() {
    if (!getDOM('skillsCloud') || !AppState.skillsData) return;

    getDOM('skillsCloud').innerHTML = '';

    // Shuffle skills for variety
    const shuffledSkills = [...AppState.skillsData.skills].sort(
      () => Math.random() - 0.5
    );

    shuffledSkills.forEach((skill, index) => {
      const category = AppState.skillsData.categories.find(
        (cat) => cat.name === skill.category
      );
      const cloudTag = document.createElement('div');
      cloudTag.className = `cloud-tag ${skill.category}`;
      cloudTag.textContent = skill.name;
      cloudTag.title = `${skill.name} - ${skill.level}%`;
      cloudTag.style.animationDelay = `${index * 0.05}s`;

      getDOM('skillsCloud').appendChild(cloudTag);
    });
  },

  filterSkillsCloud(filter) {
    const cloudTags = document.querySelectorAll('.cloud-tag');

    cloudTags.forEach((tag) => {
      if (filter === 'all' || tag.classList.contains(filter)) {
        tag.style.display = 'flex';
        tag.style.opacity = '1';
        tag.style.transform = 'scale(1)';
      } else {
        tag.style.display = 'none';
        tag.style.opacity = '0';
        tag.style.transform = 'scale(0.8)';
      }
    });
  },

  filterCategoryDetails(filter) {
    const categoryItems = document.querySelectorAll('.category-item');

    categoryItems.forEach((item) => {
      if (filter === 'all') {
        item.style.display = 'block';
      } else {
        const categoryName = item
          .querySelector('.category-title')
          .textContent.toLowerCase();
        const shouldShow = categoryName.includes(filter.toLowerCase());
        item.style.display = shouldShow ? 'block' : 'none';
      }
    });
  },

  refresh(lang) {
    if (!AppState.skillsData) return;

    // Reset animations
    this.resetAnimations();

    // Re-render components
    this.renderLegend();
    this.renderCategoryDetails();
    this.renderSkillsCloud();

    // Reinitialize chart
    setTimeout(() => {
      this.initChart();

      // Trigger animations if section is visible
      const skillsSection = document.getElementById('skills');
      const chartContainer = document.querySelector('.skills-chart-container');
      if (
        skillsSection &&
        chartContainer &&
        Visibility.isInViewport(skillsSection)
      ) {
        this.handleChartAnimation(chartContainer);
      }
    }, 150);
  },

  refreshChart() {
    if (AppState.skillsChart) {
      this.initChart();
    }
  },

  resetAnimations() {
    const skillElements = document.querySelectorAll(
      '.skills-chart-container, .legend-item, .category-item, .cloud-tag'
    );
    skillElements.forEach((el) => {
      el.classList.remove('visible', 'chart-visible');
    });
  },

  handleChartAnimation(chartContainer) {
    chartContainer.classList.add('chart-visible');

    // Initialize chart if not created
    if (!AppState.skillsChart && AppState.skillsData) {
      setTimeout(() => {
        this.initChart();
      }, 500);
    }

    // Animate legend items with delay
    const legendItems = document.querySelectorAll('.legend-item');
    legendItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('visible');
      }, index * 100 + 300);
    });

    // Animate category items and cloud tags
    const categoryItems = document.querySelectorAll('.category-item');
    const cloudTags = document.querySelectorAll('.cloud-tag');

    categoryItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('visible');
      }, index * 100 + 600);
    });

    cloudTags.forEach((tag, index) => {
      setTimeout(() => {
        tag.classList.add('visible');
      }, index * 50 + 800);
    });
  },

  initializeFallbackChart() {
    if (!getDOM('skillsChart')) return;

    const isDarkTheme = document.body.classList.contains('dark-theme');
    const textColor = isDarkTheme ? '#f3f4f6' : '#1f2937';
    const gridColor = isDarkTheme
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)';

    const skillsData = {
      labels: [
        Language.getTranslation('skills.frontend') || 'Frontend',
        Language.getTranslation('skills.backend') || 'Backend',
        Language.getTranslation('skills.databases') || 'Databases',
        Language.getTranslation('skills.algorithms') || 'Algorithms',
        Language.getTranslation('skills.tools') || 'Tools',
        Language.getTranslation('skills.oop') || 'OOP',
      ],
      datasets: [
        {
          label: Language.getTranslation('skills.level') || 'Skill Level',
          data: [85, 90, 80, 75, 85, 95],
          backgroundColor: CONFIG.charts.skills.colors.primary,
          borderColor: CONFIG.charts.skills.colors.border,
          pointBackgroundColor: CONFIG.charts.skills.colors.point,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: CONFIG.charts.skills.colors.border,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };

    AppState.skillsChart = new Chart(getDOM('skillsChart'), {
      type: 'radar',
      data: skillsData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { display: false, stepSize: 20 },
            grid: { color: gridColor },
            angleLines: { color: gridColor },
            pointLabels: {
              color: textColor,
              font: { size: 12, family: "'Inter', sans-serif" },
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.dataset.label + ': ' + context.raw + '%';
              },
            },
          },
        },
        animation: CONFIG.charts.skills.animation,
      },
    });
  },

  setupInteractivity() {
    // Setup resize handler for chart
    window.addEventListener('resize', () => {
      if (AppState.skillsChart) {
        AppState.skillsChart.resize();
      }
    });

    // Setup intersection observer for skills section
    const skillsSection = document.getElementById('skills');
    if (skillsSection) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const chartContainer = document.querySelector(
                '.skills-chart-container'
              );
              if (
                chartContainer &&
                !chartContainer.classList.contains('chart-visible')
              ) {
                this.handleChartAnimation(chartContainer);
              }
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(skillsSection);
    }
  },
};
