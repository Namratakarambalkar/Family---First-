const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Active link highlight for single-page navigation (hash links)
// If this page uses full separate pages (home/about/team/contact.html), the
// JS observer will find no hash sections and safely do nothing.
const links = Array.from(document.querySelectorAll('.menu-link'));
const sections = links
  .map((a) => {
    const href = a.getAttribute('href') || '';
    if (!href.startsWith('#')) return null;
    return document.querySelector(href);
  })
  .filter(Boolean);

function setActiveById(id) {
  links.forEach((a) => {
    const href = a.getAttribute('href') || '';
    const isActive = href === '#' + id;
    a.classList.toggle('is-active', isActive);
  });
}

if (sections.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target?.id) setActiveById(visible.target.id);
    },
    { threshold: [0.15, 0.25, 0.35] }
  );

  sections.forEach((s) => observer.observe(s));
}


// Contact form (front-end simulation only)
function bindFakeSubmit(formEl, statusEl) {
  if (!formEl) return;
  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    if (statusEl) statusEl.textContent = 'Submitting...';

    const data = Object.fromEntries(new FormData(formEl).entries());

    // Simulate success (no backend in this HTML/CSS/JS build)
    setTimeout(() => {
      if (statusEl) {
        const name = (data.name || '').trim() || 'there';
        statusEl.textContent = `Thanks, ${name}! We will contact you shortly.`;
      }
      formEl.reset();
    }, 700);
  });
}

const form = document.getElementById('contactForm');
const statusEl = form ? form.querySelector('.form-status') : null;
bindFakeSubmit(form, statusEl);

// Book consultation page (Firestore)
const bookForm = document.getElementById('bookForm');
const bookStatusEl = document.getElementById('bookStatus');

async function submitToFirestore(formEl, statusEl) {
  if (!formEl) return;
  if (!window.firebase || !firebase.firestore) {
    // Firestore not available (Firebase not initialized or scripts blocked)
    bindFakeSubmit(formEl, statusEl);
    return;
  }

  if (!firebase.firestore.FieldValue) {
    bindFakeSubmit(formEl, statusEl);
    return;
  }


  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (statusEl) statusEl.textContent = 'Submitting...';

    try {
      const data = Object.fromEntries(new FormData(formEl).entries());

      await firebase.firestore().collection('book_consultations').add({
        ...data,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      if (statusEl) {
        const name = (data.name || '').trim() || 'there';
        statusEl.textContent = `Thanks, ${name}! Your consultation request is saved. We will contact you shortly.`;
      }
      formEl.reset();
    } catch (err) {
      console.error("Firebase Error:", err);
      console.error("Error Code:", err?.code);
      console.error("Error Message:", err?.message);
      if (statusEl) statusEl.textContent = err?.message || 'Something went wrong. Please try again.';
    }

  });
}

submitToFirestore(bookForm, bookStatusEl);




