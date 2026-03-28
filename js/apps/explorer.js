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
          const topOffset = parseInt(windowEl.style.top) || 30;
          const height = window.innerHeight - 36 - topOffset;

          windowEl.classList.add('project-window');
          windowEl.style.width = '800px';
          windowEl.style.height = `${height}px`;
          windowEl.style.overflow = 'hidden';
          windowEl.style.resize = 'both';

          windowBody.classList.add('project-window-body');
          windowBody.style.flex = '1';
          windowBody.style.padding = '0';
          windowBody.style.overflow = 'hidden';
          windowBody.style.display = 'flex';
          windowBody.style.flexDirection = 'column';

          // Browser chrome
          const chrome = document.createElement('div');
          chrome.className = 'browser-chrome';
          chrome.innerHTML = `
            <div class="browser-menubar">
              <span>File</span><span>Edit</span><span>View</span>
              <span>Favorites</span><span>Tools</span><span>Help</span>
            </div>
            <div class="browser-toolbar">
              <button class="browser-btn" data-action="back">◀ Back</button>
              <button class="browser-btn" data-action="forward">Forward ▶</button>
              <button class="browser-btn" data-action="stop">✕ Stop</button>
              <button class="browser-btn" data-action="refresh">↻ Refresh</button>
              <div class="browser-toolbar-sep"></div>
              <button class="browser-btn" data-action="home">⌂ Home</button>
            </div>
            <div class="browser-addressbar">
              <span class="browser-address-label">Address</span>
              <input class="browser-address-input" type="text" value="${url}">
              <button class="browser-go-btn">Go</button>
            </div>
          `;
          windowBody.appendChild(chrome);

          const iframe = document.createElement('iframe');
          iframe.className = 'project-iframe';
          iframe.src = url;
          iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups';
          windowBody.appendChild(iframe);

          // History tracking
          const hist = [url];
          let idx = 0;
          const addressInput = chrome.querySelector('.browser-address-input');
          const backBtn = chrome.querySelector('[data-action="back"]');
          const forwardBtn = chrome.querySelector('[data-action="forward"]');

          function navigate(newUrl) {
            hist.splice(idx + 1);
            hist.push(newUrl);
            idx = hist.length - 1;
            iframe.src = newUrl;
            addressInput.value = newUrl;
            syncButtons();
          }

          function syncButtons() {
            backBtn.disabled = idx === 0;
            forwardBtn.disabled = idx === hist.length - 1;
          }

          syncButtons();

          chrome.querySelector('[data-action="back"]').addEventListener('click', () => {
            if (idx > 0) { idx--; iframe.src = hist[idx]; addressInput.value = hist[idx]; syncButtons(); }
          });
          chrome.querySelector('[data-action="forward"]').addEventListener('click', () => {
            if (idx < hist.length - 1) { idx++; iframe.src = hist[idx]; addressInput.value = hist[idx]; syncButtons(); }
          });
          chrome.querySelector('[data-action="refresh"]').addEventListener('click', () => {
            iframe.src = hist[idx];
          });
          chrome.querySelector('[data-action="stop"]').addEventListener('click', () => {
            iframe.src = 'about:blank';
          });
          chrome.querySelector('[data-action="home"]').addEventListener('click', () => {
            navigate(url);
          });
          chrome.querySelector('.browser-go-btn').addEventListener('click', () => {
            navigate(addressInput.value.trim());
          });
          addressInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') navigate(addressInput.value.trim());
          });
        });
      }

      wm.open(appId);
    });
  });
}
