import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const myprojects = await fetchJSON('../lib/projects.json');
let projects = myprojects;
let selectedIndex = -1;

const projectsContainer = document.querySelector('.projects');
const svg = d3.select('svg');
const legend = d3.select('.legend');
const colors = d3.scaleOrdinal(d3.schemeTableau10);

function renderPieChart(projectsGiven) {
  svg.selectAll('*').remove();
  legend.selectAll('*').remove();

  const newRolledData = d3.rollups(projectsGiven, v => v.length, d => d.year);
  const newData = newRolledData.map(([year, count]) => ({ label: year, value: count }));

  const pie = d3.pie().value(d => d.value);
  const arcData = pie(newData);
  const arc = d3.arc().innerRadius(0).outerRadius(50);

  // Draw pie wedges
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
      updateStyles(newData);

      if (selectedIndex === -1) {
        renderProjects(projects, projectsContainer, 'h2');
      } else {
        const selectedYear = newData[selectedIndex].label;
        const filtered = projects.filter(p => p.year === selectedYear);
        renderProjects(filtered, projectsContainer, 'h2');
      }
    });

  // Render legend
  legend.selectAll('li')
    .data(newData)
    .join('li')
    .attr('style', (_, i) => `--color:${colors(i)}`)
    .html(d => `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
    .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''))
    .on('click', (_, d) => {
      const i = newData.findIndex(item => item.label === d.label);
      selectedIndex = selectedIndex === i ? -1 : i;
      updateStyles(newData);

      if (selectedIndex === -1) {
        renderProjects(projects, projectsContainer, 'h2');
      } else {
        const selectedYear = newData[selectedIndex].label;
        const filtered = projects.filter(p => p.year === selectedYear);
        renderProjects(filtered, projectsContainer, 'h2');
      }
    });

  updateStyles(newData);
}

function updateStyles(data) {
  svg.selectAll('path')
    .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''))
    .style('opacity', (_, i) => (selectedIndex === -1 || i === selectedIndex ? 1 : 0.5));

  legend.selectAll('li')
    .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));
}

// Initial load
renderProjects(projects, projectsContainer, 'h2');
renderPieChart(projects);

// Handle search
document.querySelector('.searchBar').addEventListener('change', (event) => {
  const value = event.target.value.toLowerCase();
  const filtered = projects.filter(project =>
    Object.values(project).join('\n').toLowerCase().includes(value)
  );

  selectedIndex = -1; // clear selection on search
  renderProjects(filtered, projectsContainer, 'h2');
  renderPieChart(filtered);
});
