import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const myprojects = await fetchJSON('../lib/projects.json');
let projects = myprojects;
let selectedIndex = -1;
let searchQuery = '';
let pieData = []; // store pie data globally

const projectsContainer = document.querySelector('.projects');
const svg = d3.select('svg');
const legend = d3.select('.legend');
const colors = d3.scaleOrdinal(d3.schemeTableau10);

function renderPieChart() {
  svg.selectAll('*').remove();
  legend.selectAll('*').remove();

  const rolledData = d3.rollups(projects, v => v.length, d => d.year);
  pieData = rolledData.map(([year, count]) => ({ label: year, value: count }));

  const pie = d3.pie().value(d => d.value);
  const arcData = pie(pieData);
  const arc = d3.arc().innerRadius(0).outerRadius(50);

  svg.selectAll('path')
    .data(arcData)
    .join('path')
    .attr('d', arc)
    .attr('fill', (_, i) => colors(i))
    .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''))
    .style('cursor', 'pointer')
    .style('opacity', (_, i) => (selectedIndex === -1 || i === selectedIndex ? 1 : 0.5))
    .on('click', function (event, d) {
      const i = arcData.indexOf(d);
      selectedIndex = selectedIndex === i ? -1 : i;
      updateStyles();
      renderFilteredProjects();
    });

  legend.selectAll('li')
    .data(pieData)
    .join('li')
    .attr('style', (_, i) => `--color:${colors(i)}`)
    .html(d => `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
    .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''))
    .on('click', (_, d) => {
      const i = pieData.findIndex(item => item.label === d.label);
      selectedIndex = selectedIndex === i ? -1 : i;
      updateStyles();
      renderFilteredProjects();
    });

  updateStyles();
}

function updateStyles() {
  svg.selectAll('path')
    .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''))
    .style('opacity', (_, i) => (selectedIndex === -1 || i === selectedIndex ? 1 : 0.5));

  legend.selectAll('li')
    .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));
}

function renderFilteredProjects() {
  const selectedYear = selectedIndex !== -1 ? pieData[selectedIndex].label : null;

  const filteredProjects = projects.filter(project => {
    const matchesSearch = Object.values(project).join('\n').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = selectedYear ? project.year === selectedYear : true;
    return matchesSearch && matchesYear;
  });

  renderProjects(filteredProjects, projectsContainer, 'h2');
}

// Initial render
renderProjects(projects, projectsContainer, 'h2');
renderPieChart();

// Handle search input
document.querySelector('.searchBar').addEventListener('input', (event) => {
  searchQuery = event.target.value;
  renderFilteredProjects();
});
