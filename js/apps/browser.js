export function registerBrowser(wm) {
  wm.register('browser', 'Internet Explorer', initBrowser);
}

function initBrowser(body, wm) {
  const iframe = body.querySelector('.browser-iframe');
  const addressBar = body.querySelector('.browser-address');
  const goBtn = body.querySelector('.browser-go');
  const fallback = body.querySelector('.browser-fallback');
  const fallbackLink = body.querySelector('.browser-fallback-link');

  if (!iframe || !addressBar) return;

  const navigate = (url) => {
    if (!url.startsWith('http')) url = 'https://' + url;
    addressBar.value = url;
    iframe.style.display = '';
    if (fallback) fallback.style.display = 'none';

    iframe.src = url;

    // 3s timeout fallback for X-Frame-Options / CSP blocks
    const timeout = setTimeout(() => {
      showFallback(url);
    }, 3000);

    iframe.onload = () => {
      clearTimeout(timeout);
      try {
        // Attempt cross-origin access — will throw SecurityError if blocked
        void iframe.contentWindow.document;
      } catch (e) {
        // SecurityError means the page loaded but is cross-origin
        // This is actually fine — the iframe IS showing the content
        // Only show fallback if the iframe appears to have no content
      }
    };

    iframe.onerror = () => {
      clearTimeout(timeout);
      showFallback(url);
    };
  };

  const showFallback = (url) => {
    iframe.style.display = 'none';
    if (fallback) fallback.style.display = '';
    if (fallbackLink) {
      fallbackLink.href = url;
      fallbackLink.textContent = url;
    }
  };

  // Address bar navigation
  addressBar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') navigate(addressBar.value);
  });

  if (goBtn) {
    goBtn.addEventListener('click', () => navigate(addressBar.value));
  }

  // Listen for navigate events from explorer
  const windowEl = body.closest('.window');
  if (windowEl) {
    windowEl.addEventListener('navigate', (e) => {
      navigate(e.detail.url);
    });
  }
}
