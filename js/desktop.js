import WindowManager from './window-manager.js';
import { registerAbout } from './apps/about.js';
import { registerSkills } from './apps/skills.js';
import { registerExplorer } from './apps/explorer.js';
import { registerContact } from './apps/contact.js';
import { registerResume } from './apps/resume.js';

// Init WindowManager
const desktop = document.getElementById('desktop');
const taskbarItems = document.getElementById('taskbar-items');
const wm = new WindowManager(desktop, taskbarItems);

// Register all apps
registerAbout(wm);
registerSkills(wm);
registerExplorer(wm);
registerContact(wm);
registerResume(wm);

// Desktop icon double-click
document.querySelectorAll('.desktop-icon').forEach(icon => {
  icon.addEventListener('dblclick', () => {
    const appId = icon.dataset.app;
    if (appId) wm.open(appId);
  });

  // Single-click to select
  icon.addEventListener('click', () => {
    document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
    icon.classList.add('selected');
  });
});

// Click desktop to deselect icons
desktop.addEventListener('click', (e) => {
  if (e.target === desktop) {
    document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
  }
});

// Clock
const clockEl = document.getElementById('taskbar-clock');
function updateClock() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  clockEl.textContent = `${h12}:${minutes} ${ampm}`;
}
updateClock();
setInterval(updateClock, 60000);

// Mobile gate
const mobileGate = document.getElementById('mobile-gate');
const mobileOk = document.getElementById('mobile-gate-ok');
if (mobileOk) {
  mobileOk.addEventListener('click', () => {
    mobileGate.style.display = 'none';
    document.getElementById('mobile-fallback').style.display = 'block';
  });
}
