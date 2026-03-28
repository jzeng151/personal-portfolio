export function registerSkills(wm) {
  wm.register('skills', 'Skills - Control Panel', (body) => {
    const windowEl = body.closest('.window');
    windowEl.classList.add('project-window');
    windowEl.style.height = '340px';

    body.style.flex = '1';
    body.style.padding = '0';
    body.style.overflow = 'auto';
    body.style.minHeight = '0';
    body.style.background = '#fff';
  });
}
