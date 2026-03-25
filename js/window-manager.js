// WindowManager — drag, minimize, maximize, close, z-order, taskbar sync

const WIN_TEMPLATE = `
<div class="window" style="position: absolute;">
  <div class="title-bar">
    <div class="title-bar-text"></div>
    <div class="title-bar-controls">
      <button aria-label="Minimize"></button>
      <button aria-label="Maximize"></button>
      <button aria-label="Close"></button>
    </div>
  </div>
  <div class="window-body"></div>
</div>
`;

class WindowManager {
  constructor(desktopEl, taskbarItemsEl) {
    this.desktop = desktopEl;
    this.taskbarItems = taskbarItemsEl;
    this.windows = new Map(); // appId → { windowEl, taskbarBtn, savedRect }
    this.zCounter = 100;
    this.cascadeOffset = 0;

    // App registry — populated by apps calling register()
    this.apps = new Map(); // appId → { title, init(bodyEl) }
  }

  register(appId, title, initFn) {
    this.apps.set(appId, { title, init: initFn });
  }

  open(appId) {
    // Single-instance: if already open, bring to front
    if (this.windows.has(appId)) {
      const { windowEl } = this.windows.get(appId);
      if (windowEl.style.display === 'none') {
        windowEl.style.display = '';
      }
      this.bringToFront(windowEl);
      return;
    }

    const app = this.apps.get(appId);
    if (!app) return;

    // Create window DOM
    const wrapper = document.createElement('div');
    wrapper.innerHTML = WIN_TEMPLATE.trim();
    const windowEl = wrapper.firstChild;
    windowEl.dataset.appId = appId;

    // Set title
    windowEl.querySelector('.title-bar-text').textContent = app.title;

    // Position with cascade
    const offset = 30 + (this.cascadeOffset * 30);
    windowEl.style.left = `${offset}px`;
    windowEl.style.top = `${offset}px`;
    windowEl.style.width = '500px';
    windowEl.style.minHeight = '300px';
    this.cascadeOffset = (this.cascadeOffset + 1) % 8;

    // Z-order
    windowEl.style.zIndex = ++this.zCounter;

    // Clone template content into window body
    const body = windowEl.querySelector('.window-body');
    const templateEl = document.getElementById(`app-${appId}`);
    if (templateEl) {
      body.appendChild(templateEl.content.cloneNode(true));
    }

    // Add to desktop
    this.desktop.appendChild(windowEl);

    // Call app init
    if (app.init) app.init(body, this);

    // Create taskbar button
    const taskbarBtn = document.createElement('button');
    taskbarBtn.className = 'taskbar-item active';
    taskbarBtn.textContent = app.title;
    taskbarBtn.addEventListener('click', () => this._onTaskbarClick(appId));
    this.taskbarItems.appendChild(taskbarBtn);

    // Store reference
    const entry = { windowEl, taskbarBtn, savedRect: null, listeners: [] };
    this.windows.set(appId, entry);

    // Wire up title bar controls
    const [minBtn, maxBtn, closeBtn] = windowEl.querySelectorAll('.title-bar-controls button');
    minBtn.addEventListener('click', (e) => { e.stopPropagation(); this.minimize(appId); });
    maxBtn.addEventListener('click', (e) => { e.stopPropagation(); this.maximize(appId); });
    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); this.close(appId); });

    // Click anywhere in window to bring to front
    const focusHandler = () => this.bringToFront(windowEl);
    windowEl.addEventListener('mousedown', focusHandler);
    entry.listeners.push({ el: windowEl, event: 'mousedown', handler: focusHandler });

    // Drag by title bar
    this._initDrag(windowEl, entry);

    this.bringToFront(windowEl);
  }

  close(appId) {
    const entry = this.windows.get(appId);
    if (!entry) return;

    // Clean up listeners
    for (const { el, event, handler } of entry.listeners) {
      el.removeEventListener(event, handler);
    }

    entry.windowEl.remove();
    entry.taskbarBtn.remove();
    this.windows.delete(appId);
  }

  minimize(appId) {
    const entry = this.windows.get(appId);
    if (!entry) return;

    entry.windowEl.style.display = 'none';
    entry.taskbarBtn.classList.remove('active');
  }

  maximize(appId) {
    const entry = this.windows.get(appId);
    if (!entry) return;

    const win = entry.windowEl;

    if (entry.savedRect) {
      // Restore
      win.style.left = entry.savedRect.left;
      win.style.top = entry.savedRect.top;
      win.style.width = entry.savedRect.width;
      win.style.height = entry.savedRect.height;
      entry.savedRect = null;
    } else {
      // Save current position and maximize
      entry.savedRect = {
        left: win.style.left,
        top: win.style.top,
        width: win.style.width,
        height: win.style.height,
      };
      win.style.left = '0px';
      win.style.top = '0px';
      win.style.width = '100vw';
      win.style.height = 'calc(100vh - 36px)';
    }
  }

  bringToFront(windowEl) {
    windowEl.style.zIndex = ++this.zCounter;

    // Update taskbar active states
    for (const [id, entry] of this.windows) {
      entry.taskbarBtn.classList.toggle('active', entry.windowEl === windowEl);
    }
  }

  _onTaskbarClick(appId) {
    const entry = this.windows.get(appId);
    if (!entry) return;

    if (entry.windowEl.style.display === 'none') {
      // Restore from minimized
      entry.windowEl.style.display = '';
      entry.taskbarBtn.classList.add('active');
      this.bringToFront(entry.windowEl);
    } else if (parseInt(entry.windowEl.style.zIndex) === this.zCounter) {
      // Already focused — minimize
      this.minimize(appId);
    } else {
      // Bring to front
      this.bringToFront(entry.windowEl);
    }
  }

  _initDrag(windowEl, entry) {
    const titleBar = windowEl.querySelector('.title-bar');
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    let rafId = null;
    let currentX, currentY;

    const onMouseDown = (e) => {
      // Don't drag if clicking on controls
      if (e.target.closest('.title-bar-controls')) return;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = windowEl.offsetLeft;
      startTop = windowEl.offsetTop;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      e.preventDefault();
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      currentX = e.clientX;
      currentY = e.clientY;

      if (rafId === null) {
        rafId = requestAnimationFrame(updatePosition);
      }
    };

    const updatePosition = () => {
      rafId = null;
      if (!isDragging) return;

      let newLeft = startLeft + (currentX - startX);
      let newTop = startTop + (currentY - startY);

      // Clamp to viewport
      const maxLeft = window.innerWidth - 50;
      const maxTop = window.innerHeight - 86; // 50 + 36 taskbar
      newLeft = Math.max(-windowEl.offsetWidth + 50, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));

      windowEl.style.left = `${newLeft}px`;
      windowEl.style.top = `${newTop}px`;
    };

    const onMouseUp = () => {
      isDragging = false;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    titleBar.addEventListener('mousedown', onMouseDown);
    entry.listeners.push({ el: titleBar, event: 'mousedown', handler: onMouseDown });
  }
}

export default WindowManager;
