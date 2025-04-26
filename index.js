import {    fetchJSON, renderProjects, fetchGithubData } from './global.js';


async function latestprojs() {
    const projectsContainer = document.querySelector('.projects');
  
    const projects = await fetchJSON('./lib/projects.json');
    const latestProjects = projects.slice(0, 3);
  
    renderProjects(latestProjects, projectsContainer, 'h2');
  }


async function ghstats() {
    const profileStats = document.querySelector('#profile-stats');
    if (profileStats) {
      const githubData = await fetchGithubData('j2nnifer');
      profileStats.innerHTML = `
        <h3>My GitHub Stats</h3>
        <div class="github-stats-grid">
          <div class="stat-item">
            <div class="stat-label">Followers</div>
            <div class="stat-value">${githubData.followers}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Following</div>
            <div class="stat-value">${githubData.following}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Public Repos</div>
            <div class="stat-value">${githubData.public_repos}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Public Gists</div>
            <div class="stat-value">${githubData.public_gists}</div>
          </div>
        </div>
      `;
    }
  }
  

  ghstats();
  latestprojs();