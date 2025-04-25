import { fetchJSON, renderProjects, fetchGithubData } from './global.js';



const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);
const projectsContainer = document.querySelector('.projects');

if (latestProjects && Array.isArray(latestProjects) && projectsContainer) 
    {
    renderProjects(latestProjects, projectsContainer, 'h2');
    }