import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const myprojects = await fetchJSON('../lib/projects.json');
let projects = myprojects;
let query = '';

const projectsContainer = document.querySelector('.projects');
const svg = d3.select('svg');
const legend = d3.select('.legend');
const colors = d3.scaleOrdinal(d3.schemeTableau10);

let selectedIndex = -1;  // This will keep track of the selected slice index

// Refactor all plotting into one function
function renderPieChart(projectsGiven) {
  // Clear old pie chart and legend
  svg.selectAll('*').remove();
  legend.selectAll('*').remove();

  // Re-calculate rolled data
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );

  // Re-calculate data
  let newData = newRolledData.map(([year, count]) => {
    return { label: year, value: count };
  });

  // Re-calculate slice generator, arc data, arc, etc.
  let newSliceGenerator = d3.pie().value(d => d.value);
  let newArcData = newSliceGenerator(newData);
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

  // Update paths (pie slices)
  svg.selectAll('path')
    .data(newArcData)
    .enter()
    .append('path')
    .attr('d', arcGenerator)
    .attr('fill', (_, i) => colors(i))
    .style('cursor', 'pointer')
    .on('click', (event, d, i) => {
      // Toggle selected index (select/deselect on click)
      selectedIndex = selectedIndex === i ? -1 : i;

      // Update styles for slices and legend
      updateStyles(newData);
       // Filter and render projects based on selected wedge
       if (selectedIndex === -1) {
        renderProjects(projects, projectsContainer, 'h2');
      } else {
        const selectedYear = newData[selectedIndex].label;
        const filteredProjects = projects.filter(project => project.year === selectedYear);
        renderProjects(filteredProjects, projectsContainer, 'h2');
      }
    });

    

  // Update legend
  newData.forEach((d, i) => {
    legend.append('li')
      .attr('style', `--color:${colors(i)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .style('cursor', 'pointer')
      .on('click', (event, d, i) => {
        // Toggle selected index (select/deselect on click)
        selectedIndex = selectedIndex === i ? -1 : i;

        // Update styles for slices and legend
        updateStyles(newData);
      });
  });

  // Apply initial styles (opacity and selected class)
  updateStyles(newData);
}

// Utility to update slice/legend highlighting
function updateStyles(data) {
  // Update pie slice opacity
  svg.selectAll('path')
    .style('opacity', (_, i) => (selectedIndex === -1 || i === selectedIndex ? 1 : 0.5));

  // Update legend highlighting
  legend.selectAll('li')
    .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));
}

// Call this function on page load
renderProjects(projects, projectsContainer, 'h2');
renderPieChart(projects);

// Filter and render on input
const searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('change', (event) => {
  let filteredProjects = projects.filter(project => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(event.target.value.toLowerCase());
  });

  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});
