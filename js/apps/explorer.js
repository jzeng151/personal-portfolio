export function registerExplorer(wm) {
  wm.register('explorer', 'C:\\Users\\Jason\\Projects', initExplorer);
}

function initExplorer(body, wm) {
  const folders = body.querySelectorAll('.explorer-folder');
  folders.forEach(folder => {
    folder.addEventListener('dblclick', () => {
      const url = folder.dataset.url;
      const name = folder.querySelector('span').textContent.trim();
      if (!url) return;

      const appId = 'project-' + name.toLowerCase().replace(/\s+/g, '-');

      if (!wm.apps.has(appId)) {
        wm.register(appId, name, (windowBody) => {
          const windowEl = windowBody.closest('.window');
          windowEl.style.display = 'flex';
          windowEl.style.flexDirection = 'column';
          windowEl.style.height = '400px';
          windowEl.style.width = '600px';
          windowBody.classList.add('project-window-body');
          windowBody.style.flex = '1';
          const iframe = document.createElement('iframe');
          iframe.className = 'project-iframe';
          iframe.src = url;
          iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups';
          windowBody.appendChild(iframe);
        });
      }

      wm.open(appId);
    });
  });
}
