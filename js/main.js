/* ============================================
   YourIT.Team - Main JavaScript
   ============================================ */

// --- Navbar scroll effect ---
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// --- Mobile nav toggle ---
const navToggle = document.querySelector('.nav-toggle');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    navbar.classList.toggle('nav-open');
    const spans = navToggle.querySelectorAll('span');
    if (navbar.classList.contains('nav-open')) {
      spans[0].style.transform = 'rotate(45deg) translateY(7px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translateY(-7px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });
}

// Mobile dropdown toggle
document.querySelectorAll('.nav-item').forEach(item => {
  const link = item.querySelector('.nav-link');
  const dropdown = item.querySelector('.dropdown');
  if (!link || !dropdown) return;
  link.addEventListener('click', (e) => {
    if (window.innerWidth > 768) return;
    e.preventDefault();
    const isOpen = item.classList.contains('dropdown-open');
    document.querySelectorAll('.nav-item.dropdown-open').forEach(i => i.classList.remove('dropdown-open'));
    if (!isOpen) item.classList.add('dropdown-open');
  });
});

// Close nav on outside click
document.addEventListener('click', (e) => {
  if (navbar && navbar.classList.contains('nav-open') && !navbar.contains(e.target)) {
    navbar.classList.remove('nav-open');
    document.querySelectorAll('.nav-item.dropdown-open').forEach(i => i.classList.remove('dropdown-open'));
  }
});

// --- Stagger children (must run BEFORE observer setup so these elements are observed) ---
document.querySelectorAll('[data-stagger]').forEach(parent => {
  const children = parent.children;
  Array.from(children).forEach((child, i) => {
    child.classList.add('reveal');
    child.dataset.delay = i * 100;
  });
});

// --- Scroll reveal ---
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, entry.target.dataset.delay || 0);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

const revealElements = document.querySelectorAll('.reveal');
revealElements.forEach(el => revealObserver.observe(el));

// --- Counter animation ---
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1600;
  const start = performance.now();
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = prefix + current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

// --- Contact form ---
// Replace this URL after deploying your Google Apps Script (see setup/google-apps-script.js)
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyY_YK-pt5TmmkDak4T4SnmCRa4vFWSqSkMwgmoWLIeSMAUcujreBR1rqoQXoNSNfu9/exec';

// Careers form reuses the same GOOGLE_SHEET_URL above (type field routes it to the right sheet)

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;

    const payload = {
      firstName: contactForm.elements.firstName.value.trim(),
      lastName:  contactForm.elements.lastName.value.trim(),
      email:     contactForm.elements.email.value.trim(),
      company:   contactForm.elements.company.value.trim(),
      phone:     contactForm.elements.phone.value.trim(),
      service:   contactForm.elements.service.options[contactForm.elements.service.selectedIndex].text,
      message:   contactForm.elements.message.value.trim(),
      timeline:  contactForm.elements.timeline.options[contactForm.elements.timeline.selectedIndex].text,
      consent:   contactForm.elements.consent.checked ? 'Yes' : 'No',
    };

    try {
      // no-cors is required for Google Apps Script from a static site;
      // the response will be opaque but the data is saved to the sheet.
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload),
      });
      contactForm.reset();
      showToast('Message sent! We\'ll be in touch within 24 hours.');
    } catch (err) {
      showToast('Something went wrong. Please email us directly at info@yourit.team');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// --- File upload: label + drag-and-drop ---
const fileDropZone = document.getElementById('fileDropZone');
const resumeInput  = document.getElementById('resume');
const resumeLabel  = document.getElementById('resumeLabel');

if (fileDropZone && resumeInput) {
  resumeInput.addEventListener('change', () => {
    resumeLabel.textContent = resumeInput.files[0] ? resumeInput.files[0].name : 'No file selected';
  });
  fileDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileDropZone.classList.add('drag-over');
  });
  fileDropZone.addEventListener('dragleave', () => fileDropZone.classList.remove('drag-over'));
  fileDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    fileDropZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) {
      resumeInput.files = e.dataTransfer.files;
      resumeLabel.textContent = e.dataTransfer.files[0].name;
    }
  });
}

// --- Careers application form ---
const careersForm = document.getElementById('careersForm');
if (careersForm) {
  careersForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = careersForm.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    const resumeFile = careersForm.elements.resume ? careersForm.elements.resume.files[0] : null;

    // Validate resume presence
    if (!resumeFile) {
      showToast('Please attach your resume (PDF or Word .docx).');
      return;
    }

    // Validate file type
    const allowedExts = ['.pdf', '.docx'];
    const ext = resumeFile.name.toLowerCase().slice(resumeFile.name.lastIndexOf('.'));
    if (!allowedExts.includes(ext)) {
      showToast('Only PDF (.pdf) or Word (.docx) files are accepted for resume.');
      return;
    }

    // Validate file size (max 10 MB)
    if (resumeFile.size > 10 * 1024 * 1024) {
      showToast('Resume file must be under 10 MB. Please compress and retry.');
      return;
    }

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
    btn.disabled = true;

    const reader = new FileReader();
    reader.onload = async function (ev) {
      const base64Data = ev.target.result.split(',')[1];

      const payload = {
        type:                   'careers',
        openPosition:           (document.getElementById('hiddenOpenPosition')?.value || 'Access Developer / Junior DBA'),
        fullName:               (careersForm.elements.fullName.value || '').trim(),
        totalYearsOfExperience: (careersForm.elements.totalYearsOfExperience.value || '').trim(),
        currentCompany:         (careersForm.elements.currentCompany.value || '').trim(),
        currentCTC:             (careersForm.elements.currentCTC.value || '').trim(),
        noticePeriodDays:       (careersForm.elements.noticePeriodDays.value || '').trim(),
        email:                  (careersForm.elements.email.value || '').trim(),
        phone:                  (careersForm.elements.phone.value || '').trim(),
        linkedInURL:            (careersForm.elements.linkedInURL.value || '').trim(),
        resumeBase64:           base64Data,
        resumeFileName:         resumeFile.name,
        resumeMimeType:         resumeFile.type || 'application/octet-stream',
      };

      try {
        await fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(payload),
        });
        careersForm.reset();
        if (resumeLabel) resumeLabel.textContent = 'No file selected';
        showToast('Application submitted! We will be in touch within 3–5 business days.');
      } catch (err) {
        showToast('Something went wrong. Please email your resume to info@yourit.team');
      } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    };
    reader.readAsDataURL(resumeFile);
  });
}

// --- Future Opportunities form ---
const futureOpportunitiesForm = document.getElementById('futureOpportunitiesForm');
if (futureOpportunitiesForm) {
  futureOpportunitiesForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = futureOpportunitiesForm.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    // Collect checked areas
    const checkedAreas = Array.from(
      futureOpportunitiesForm.querySelectorAll('input[name="willingToWorkIn"]:checked')
    ).map(cb => cb.value);

    if (checkedAreas.length === 0) {
      showToast('Please select at least one area you are willing to work in.');
      return;
    }

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
    btn.disabled = true;

    const payload = {
      type:           'future_opportunities',
      fullName:       (futureOpportunitiesForm.elements.fullName.value || '').trim(),
      currentCompany: (futureOpportunitiesForm.elements.currentCompany.value || '').trim(),
      position:       (futureOpportunitiesForm.elements.position.value || '').trim(),
      willingToWorkIn: checkedAreas.join(', '),
      phone:          (futureOpportunitiesForm.elements.phone.value || '').trim(),
      email:          (futureOpportunitiesForm.elements.email.value || '').trim(),
      linkedInURL:    (futureOpportunitiesForm.elements.linkedInURL.value || '').trim(),
    };

    try {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload),
      });
      futureOpportunitiesForm.reset();
      showToast('Profile submitted! We will reach out when a matching opportunity arises.');
    } catch (err) {
      showToast('Something went wrong. Please email us directly at info@yourit.team');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });
}

// --- Active nav link based on page ---
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// --- Smooth scroll for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navH = navbar ? navbar.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
