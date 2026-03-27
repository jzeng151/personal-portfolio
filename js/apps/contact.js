export function registerContact(wm) {
  wm.register('contact', 'New Message', initContact);
}

function initContact(body) {
  const sendBtn = body.querySelector('.contact-send');
  const subjectInput = body.querySelector('.contact-subject');
  const messageInput = body.querySelector('.contact-message');

  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      const subject = subjectInput ? subjectInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      if (!subject || !message) {
        alert('Please fill in both the subject and message.');
        return;
      }

      sendBtn.disabled = true;
      sendBtn.textContent = 'Sending...';

      emailjs.send('service_q0xycwt', 'template_fiw1g9x', {
        subject,
        message,
      }).then(() => {
        sendBtn.textContent = 'Sent!';
        if (subjectInput) subjectInput.value = '';
        if (messageInput) messageInput.value = '';
      }).catch((err) => {
        console.error('EmailJS error:', err);
        sendBtn.textContent = 'Send';
        sendBtn.disabled = false;
        alert('Failed to send message. Please try again or email directly.');
      });
    });
  }
}
