export function registerContact(wm) {
  wm.register('contact', 'New Message', initContact);
}

function initContact(body) {
  const sendBtn = body.querySelector('.contact-send');
  const subjectInput = body.querySelector('.contact-subject');
  const messageInput = body.querySelector('.contact-message');
  const email = 'jason.zeng@pursuit.org';

  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      const subject = subjectInput ? encodeURIComponent(subjectInput.value) : '';
      const message = messageInput ? encodeURIComponent(messageInput.value) : '';
      window.location.href = `mailto:${email}?subject=${subject}&body=${message}`;
    });
  }
}
