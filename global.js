console.log("IT'S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                 
  : "/website/";        

  const pages = [
    { url: './index.html', title: 'home' },
    { url: './projects/index.html', title: 'project' },
    { url: './contact/index.html', title: 'contact' },
    { url: './resume/index.html', title: 'resume' },
    { url: 'https://github.com/j2nnifer', title: 'github' }
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