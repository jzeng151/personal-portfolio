export function registerExplorer(wm) {
  wm.register('explorer', 'C:\\Users\\Jason\\Projects', initExplorer);
}

function initExplorer(body, wm) {
  const folders = body.querySelectorAll('.explorer-folder');
  folders.forEach(folder => {
    folder.addEventListener('dblclick', () => {
      const url = folder.dataset.url;
      if (url) {
        wm.open('browser');
        // Small delay to ensure browser window is ready
        setTimeout(() => {
          const browserEntry = wm.windows.get('browser');
          if (browserEntry) {
            const iframe = browserEntry.windowEl.querySelector('.browser-iframe');
            const addressBar = browserEntry.windowEl.querySelector('.browser-address');
            if (iframe && addressBar) {
              addressBar.value = url;
              navigateIframe(iframe, url, browserEntry.windowEl);
            }
          }
        }, 100);
      }
    });
  });
}

function navigateIframe(iframe, url, windowEl) {
  const event = new CustomEvent('navigate', { detail: { url } });
  windowEl.dispatchEvent(event);
}
