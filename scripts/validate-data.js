import { readFile } from 'node:fs/promises';

const dataDirectory = new URL('../js/data/', import.meta.url);
const supportedLanguages = ['de', 'en', 'ru'];

async function readJson(filename) {
  const content = await readFile(new URL(filename, dataDirectory), 'utf8');
  return JSON.parse(content);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertLocalized(value, path) {
  supportedLanguages.forEach((language) => {
    assert(
      typeof value?.[language] === 'string' && value[language].trim(),
      `${path}.${language} must be a non-empty string`
    );
  });
}

function collectLeafPaths(value, prefix = '') {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === 'object'
      ? collectLeafPaths(child, path)
      : [path];
  });
}

const [projectsData, skillsData, translations, schema] = await Promise.all([
  readJson('projects.json'),
  readJson('skills.json'),
  readJson('translations.json'),
  readJson('schema.json'),
]);

assert(Array.isArray(projectsData.projects), 'projects must be an array');
const projectIds = new Set();
projectsData.projects.forEach((project, index) => {
  const path = `projects[${index}]`;
  assert(!projectIds.has(project.id), `${path}.id must be unique`);
  projectIds.add(project.id);
  assertLocalized(project.title, `${path}.title`);
  assertLocalized(project.description, `${path}.description`);
  assert(Array.isArray(project.technologies), `${path}.technologies must be an array`);
  assert(typeof project.category === 'string', `${path}.category is required`);
});

assert(Array.isArray(skillsData.skills), 'skills must be an array');
assert(Array.isArray(skillsData.categories), 'skill categories must be an array');
const categoryNames = new Set(skillsData.categories.map(({ name }) => name));
const skillNames = new Set();
skillsData.skills.forEach((skill, index) => {
  const path = `skills[${index}]`;
  assert(!skillNames.has(skill.name), `${path}.name must be unique`);
  skillNames.add(skill.name);
  assert(categoryNames.has(skill.category), `${path}.category is unknown`);
  assert(Number.isInteger(skill.level), `${path}.level must be an integer`);
  assert(skill.level >= 0 && skill.level <= 100, `${path}.level must be between 0 and 100`);
  assertLocalized(skill.description, `${path}.description`);
});

supportedLanguages.forEach((language) => {
  assert(translations[language], `translations.${language} is required`);
});
const referenceTranslationPaths = collectLeafPaths(translations.de).sort();
supportedLanguages.slice(1).forEach((language) => {
  const paths = collectLeafPaths(translations[language]).sort();
  assert(
    JSON.stringify(paths) === JSON.stringify(referenceTranslationPaths),
    `translations.${language} must contain exactly the same keys as translations.de`
  );
});
assert(schema['@context'] === 'https://schema.org', 'schema context is invalid');

console.log('Data validation passed.');
