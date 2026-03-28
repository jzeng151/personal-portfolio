export function registerResume(wm) {
  wm.register('resume', 'Resume.pdf', (body) => {
    const windowEl = body.closest('.window');
    const topOffset = parseInt(windowEl.style.top) || 30;
    const height = window.innerHeight - 36 - topOffset;

    windowEl.classList.add('project-window');
    windowEl.style.width = '850px';
    windowEl.style.height = `${height}px`;
    windowEl.style.overflow = 'hidden';
    windowEl.style.resize = 'both';

    body.style.flex = '1';
    body.style.padding = '0';
    body.style.overflow = 'hidden';

    const iframe = document.createElement('iframe');
    iframe.src = 'assets/resume.pdf#navpanes=0';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.display = 'block';
    body.appendChild(iframe);
  });
}
