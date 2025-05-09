console.log("IT'S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                 
  : "/portfolio/";        

  let pages = [
    { url: '', title: 'home' },
    { url: 'projects/', title: 'project' },
    { url: 'contact/', title: 'contact' },
    { url: 'resume/', title: 'resume' },
    { url: 'meta/', title: 'meta' },
    { url: 'https://github.com/j2nnifer', title: 'github', target: '_blank' }
  ];

function createNavigation() {
  const nav = document.createElement('nav');
  const ul = document.createElement('ul');
  nav.appendChild(ul);
  
  for (let p of pages) {
    let url = p.url;
    let title = p.title;
    
    if (!url.startsWith('http')) {
      url = BASE_PATH + url;
    }
    
    const li = document.createElement('li');
    
    const a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    
    a.classList.toggle(
      'current',
      a.host === location.host && a.pathname === location.pathname
    );
    
    a.toggleAttribute('target', a.host !== location.host, '_blank');
    
    li.appendChild(a);
    
    ul.appendChild(li);
  }
  
  document.body.prepend(nav);
}

function createColorSchemeSwitch() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
  document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme">
      Theme:
      <select>
        <option value="light dark">Automatic${prefersDark ? ' (Dark)' : ' (Light)'}</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
    `
  );
  
  const select = document.querySelector('.color-scheme select');
  
  function setColorScheme(colorScheme) {
    document.documentElement.style.setProperty('color-scheme', colorScheme);
  }
  
  select.addEventListener('input', function(event) {
    const colorScheme = event.target.value;
    setColorScheme(colorScheme);
    
    localStorage.colorScheme = colorScheme;
  });
  
  if ('colorScheme' in localStorage) {
    const savedColorScheme = localStorage.colorScheme;
    setColorScheme(savedColorScheme);
    select.value = savedColorScheme;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  createNavigation();
  createColorSchemeSwitch();
});


export async function fetchJSON(url) {

  const response = await fetch(url);
  const data = await response.json();
  return data;
}

export async function fetchGithubData(username) {
  // return statement here
  return fetchJSON(`https://api.github.com/users/${username}`);
}

export function renderProjects(project, containerElement, headinglevel = 'h2') {
  containerElement.innerHTML = '';

  project.forEach(p => {
    const article = document.createElement('article')
    
    article.innerHTML = `
    <h3>${p.title}</h3>
    <img src="${p.image}" alt="${p.title}">
    <p>${p.description}</p>
    `;

    containerElement.appendChild(article);

  });
  
}

