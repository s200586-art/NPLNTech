// Amplitude Analytics — NPLN Tech
// Autocapture + custom CTA tracking

(function() {
  // Init Amplitude with autocapture
  window.amplitude.add(window.amplitudeAutocapturePlugin.plugin());
  window.amplitude.init('dE8ZZkuU15H9Bc6ugcfMtIbtEHssGY3k', {
    autocapture: {
      elementInteractions: true,
      pageViews: true,
      sessions: true,
      formInteractions: true
    }
  });

  // Auto-track CTA clicks: Telegram links, mailto, buttons with .cta-btn/.btn-primary/.contact-link
  document.addEventListener('click', function(e) {
    var el = e.target.closest('a[href*="t.me/"], a[href^="mailto:"], .cta-btn, .btn-primary, .contact-link');
    if (!el) return;

    var buttonName = (el.textContent || '').trim().replace(/\s+/g, ' ');
    var href = el.getAttribute('href') || '';

    amplitude.track('CTA Clicked', {
      button_name: buttonName,
      href: href,
      page: window.location.pathname
    });
  });

  // Auto-track form submissions
  document.addEventListener('submit', function(e) {
    var form = e.target;
    var formName = form.getAttribute('name') || form.getAttribute('id') || 'unknown';

    amplitude.track('Form Submitted', {
      form_name: formName,
      page: window.location.pathname
    });
  });
})();
