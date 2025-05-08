import { fetchJSON, renderProjects } from '../global.js';

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';


const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

const titleElement = document.querySelector('.projects-title');
    if (titleElement) {
      titleElement.textContent = `${projects.length} Projects`;
    }

  
    
let arc = d3.arc().innerRadius(0).outerRadius(50)({
  startAngle: 0,
  endAngle: 2 * Math.PI,
});

let data = [1, 2];