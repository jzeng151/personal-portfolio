const toggle = document.getElementById('dark-mode-toggle');
toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    toggle.textContent = document.body.classList.contains('dark') ? '\u2600' : '\u263E';
});

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a');
const visibleSections = new Set();

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            visibleSections.add(entry.target);
        } else {
            visibleSections.delete(entry.target);
        }
    });

    if (visibleSections.size === 0) return;

    const topmost = [...visibleSections].sort(
        (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top
    )[0];

    setActiveNav(topmost.id);
}, { threshold: 0.1 });

sections.forEach(section => observer.observe(section));

function setActiveNav(id) {
    navLinks.forEach(link => link.classList.remove('active'));
    const active = document.querySelector(`nav a[href="#${id}"]`);
    if (active) active.classList.add('active');
}

window.addEventListener('scroll', () => {
    const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 10;
    if (atBottom) setActiveNav('contact');
});
